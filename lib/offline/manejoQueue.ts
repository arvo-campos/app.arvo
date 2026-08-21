"use client";

import { createManejo } from "@/lib/actions/manejos";
import type { FormState } from "@/lib/actions/clientes";
import { manejoSchema } from "@/lib/validations/manejo";
import { dbDelete, dbGetAll, dbPut, STORE_MANEJOS_PENDENTES } from "./db";

export type ManejoPendente = {
  id: string;
  entries: [string, string][];
  criadoEm: number;
  eventoNome: string;
  tipoLabel: string;
  erro?: string;
};

// Pub/sub simples pra qualquer componente (ex: o indicador na tela) saber
// quando a fila muda, sem precisar de uma lib de estado global.
const eventos = new EventTarget();
const EVENTO_MUDOU = "mudou";

export function onFilaMudar(callback: () => void) {
  eventos.addEventListener(EVENTO_MUDOU, callback);
  return () => eventos.removeEventListener(EVENTO_MUDOU, callback);
}

function avisarMudanca() {
  eventos.dispatchEvent(new Event(EVENTO_MUDOU));
}

function formDataParaEntries(formData: FormData): [string, string][] {
  const pares: [string, string][] = [];
  for (const [chave, valor] of formData.entries()) {
    if (typeof valor === "string") pares.push([chave, valor]);
  }
  return pares;
}

function entriesParaFormData(entries: [string, string][]): FormData {
  const formData = new FormData();
  for (const [chave, valor] of entries) formData.append(chave, valor);
  return formData;
}

function isRedirectError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "digest" in err &&
    typeof (err as { digest?: unknown }).digest === "string" &&
    (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

/** Erro de rede de verdade (offline, DNS caiu, etc) — não um erro de validação. */
function isErroDeRede(err: unknown): boolean {
  if (typeof navigator !== "undefined" && !navigator.onLine) return true;
  return (
    err instanceof TypeError &&
    /fetch|network/i.test(err.message)
  );
}

export async function salvarManejoLocal(
  formData: FormData,
  meta: { eventoNome: string; tipoLabel: string }
): Promise<{ ok: boolean; erro?: string }> {
  const raw = Object.fromEntries(formData.entries());
  const parcelaIds = formData
    .getAll("parcelaIds")
    .filter((v): v is string => typeof v === "string" && v.length > 0);
  const parsed = manejoSchema.safeParse({ ...raw, parcelaIds });
  if (!parsed.success) {
    return { ok: false, erro: "Verifique os campos destacados." };
  }

  const pendente: ManejoPendente = {
    id: crypto.randomUUID(),
    entries: formDataParaEntries(formData),
    criadoEm: Date.now(),
    eventoNome: meta.eventoNome,
    tipoLabel: meta.tipoLabel,
  };
  await dbPut(STORE_MANEJOS_PENDENTES, pendente);
  avisarMudanca();
  return { ok: true };
}

/**
 * Usado pelo formulário de novo manejo: tenta enviar pro servidor
 * normalmente e só cai pro salvamento local se a tentativa falhar por causa
 * de conexão (não por erro de validação, que deve continuar aparecendo pro
 * usuário corrigir na hora).
 */
export async function criarManejoComFallbackOffline(
  prevState: FormState,
  formData: FormData,
  meta: { eventoNome: string; tipoLabel: string }
): Promise<(FormState & { offline?: boolean }) | undefined> {
  const semConexao = typeof navigator !== "undefined" && !navigator.onLine;
  if (!semConexao) {
    try {
      return await createManejo(prevState, formData);
    } catch (err) {
      if (isRedirectError(err)) throw err;
      if (!isErroDeRede(err)) throw err;
      // sem sinal de verdade (fetch falhou) -> cai pro salvamento local abaixo
    }
  }
  const resultado = await salvarManejoLocal(formData, meta);
  if (!resultado.ok) return { error: resultado.erro };
  return { offline: true };
}

export async function listarManejosPendentes(): Promise<ManejoPendente[]> {
  const itens = await dbGetAll<ManejoPendente>(STORE_MANEJOS_PENDENTES);
  return itens.sort((a, b) => a.criadoEm - b.criadoEm);
}

export async function removerManejoPendente(id: string): Promise<void> {
  await dbDelete(STORE_MANEJOS_PENDENTES, id);
  avisarMudanca();
}

let sincronizando = false;

/** Tenta enviar todos os manejos pendentes pro servidor. Chamado ao reconectar. */
export async function sincronizarManejosPendentes(): Promise<{
  enviados: number;
  comErro: number;
}> {
  if (sincronizando) return { enviados: 0, comErro: 0 };
  sincronizando = true;
  let enviados = 0;
  let comErro = 0;
  try {
    const pendentes = await listarManejosPendentes();
    for (const pendente of pendentes) {
      const formData = entriesParaFormData(pendente.entries);
      try {
        await createManejo(undefined, formData);
        // sucesso: createManejo termina com redirect(), que sempre lança.
        // Se chegou aqui sem lançar, não era o resultado esperado — trata
        // como sucesso mesmo assim e remove da fila.
        await removerManejoPendente(pendente.id);
        enviados++;
      } catch (err) {
        if (isRedirectError(err)) {
          await removerManejoPendente(pendente.id);
          enviados++;
          continue;
        }
        if (isErroDeRede(err)) {
          // ainda sem conexão — para por aqui e tenta de novo na próxima vez
          break;
        }
        // erro de verdade (ex: evento foi excluído nesse meio tempo):
        // mantém na fila marcado com erro, pra não tentar de novo sozinho
        // pra sempre nem sumir com o registro sem o usuário ver.
        const mensagem =
          err instanceof Error ? err.message : "Erro ao enviar.";
        await dbPut(STORE_MANEJOS_PENDENTES, { ...pendente, erro: mensagem });
        comErro++;
      }
    }
  } finally {
    sincronizando = false;
    avisarMudanca();
  }
  return { enviados, comErro };
}
