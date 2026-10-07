"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { atualizarParcelaSchema, parcelaSchema } from "@/lib/validations/parcela";
import {
  agruparEmFileiras,
  moverNaGrade,
  posicoesDaGrade,
  removerDaGrade,
} from "@/lib/croqui";
import type { FormState } from "./clientes";

export type ParcelaFormState = FormState | { ok: true; em: number };

function revalidarCroqui(eventoId: string) {
  revalidatePath(`/eventos/${eventoId}/editar`);
  revalidatePath(`/meus-eventos/${eventoId}`);
}

// Recalcula posX/posY de todas as parcelas do evento a partir de uma
// transformação nas fileiras, gravando só as que mudaram de lugar.
async function reorganizar(
  eventoId: string,
  transformar: (fileiras: string[][]) => string[][]
) {
  const parcelas = await db.parcela.findMany({
    where: { eventoId },
    select: { id: true, posX: true, posY: true },
  });
  const posicoes = posicoesDaGrade(transformar(agruparEmFileiras(parcelas)));

  const atualizacoes = parcelas.flatMap((p) => {
    const nova = posicoes.get(p.id);
    if (!nova || (nova.posX === p.posX && nova.posY === p.posY)) return [];
    return [db.parcela.update({ where: { id: p.id }, data: nova })];
  });
  if (atualizacoes.length > 0) await db.$transaction(atualizacoes);
}

export async function createParcela(
  _prevState: ParcelaFormState,
  formData: FormData
): Promise<ParcelaFormState> {
  await requireAdmin();

  const parsed = parcelaSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    const fieldErrors = z.flattenError(parsed.error).fieldErrors;
    const primeiroErro = Object.values(fieldErrors).flat()[0];
    return { error: primeiroErro ?? "Verifique os campos.", fieldErrors };
  }
  const { fileira, ...dados } = parsed.data;

  const existentes = await db.parcela.findMany({
    where: { eventoId: dados.eventoId },
    select: { id: true, posX: true, posY: true },
  });
  const fileiras = agruparEmFileiras(existentes);
  // Fileiras sempre ficam numeradas 0, 1, 2… sem buracos (ver reorganizar),
  // então o índice da fileira é o próprio posY.
  const posY = fileira === "nova" || fileira >= fileiras.length ? fileiras.length : fileira;
  const posX = fileiras[posY]?.length ?? 0;

  await db.$transaction(async (tx) => {
    // Se o croqui veio da versão antiga (com buracos na grade), arruma antes.
    const posicoes = posicoesDaGrade(fileiras);
    for (const p of existentes) {
      const nova = posicoes.get(p.id)!;
      if (nova.posX !== p.posX || nova.posY !== p.posY) {
        await tx.parcela.update({ where: { id: p.id }, data: nova });
      }
    }
    await tx.parcela.create({ data: { ...dados, posX, posY } });
  });

  revalidarCroqui(dados.eventoId);
  return { ok: true, em: Date.now() };
}

export async function atualizarParcela(
  _prevState: ParcelaFormState,
  formData: FormData
): Promise<ParcelaFormState> {
  await requireAdmin();

  const parsed = atualizarParcelaSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    const fieldErrors = z.flattenError(parsed.error).fieldErrors;
    const primeiroErro = Object.values(fieldErrors).flat()[0];
    return { error: primeiroErro ?? "Verifique os campos.", fieldErrors };
  }
  const { parcelaId, ...dados } = parsed.data;

  const parcela = await db.parcela.update({
    where: { id: parcelaId },
    // Campo apagado no formulário deve limpar o valor salvo.
    data: {
      ...dados,
      largura: dados.largura ?? null,
      comprimento: dados.comprimento ?? null,
      linhas: dados.linhas ?? null,
    },
  });

  revalidarCroqui(parcela.eventoId);
  return { ok: true, em: Date.now() };
}

export async function deleteParcela(parcelaId: string) {
  await requireAdmin();
  const parcela = await db.parcela.findUnique({ where: { id: parcelaId } });
  if (!parcela) return;

  await db.parcela.delete({ where: { id: parcelaId } });
  // Fecha o buraco que a parcela deixou na fileira.
  await reorganizar(parcela.eventoId, (fileiras) => removerDaGrade(fileiras, parcelaId));
  revalidarCroqui(parcela.eventoId);
}

export async function moverParcela(
  parcelaId: string,
  fileiraDestino: number,
  indiceDestino: number
) {
  await requireAdmin();
  const parcela = await db.parcela.findUnique({ where: { id: parcelaId } });
  if (!parcela) return;

  await reorganizar(parcela.eventoId, (fileiras) =>
    moverNaGrade(fileiras, parcelaId, fileiraDestino, indiceDestino)
  );
  revalidarCroqui(parcela.eventoId);
}
