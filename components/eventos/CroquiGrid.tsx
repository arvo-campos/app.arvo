"use client";

import { useActionState, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import Link from "next/link";
import { Move } from "lucide-react";
import { createParcela, deleteParcela, moverParcela } from "@/lib/actions/parcelas";
import type { FormState } from "@/lib/actions/clientes";
import { cn } from "@/lib/utils";

// Distância mínima (em pixels) que o dedo/mouse precisa se mover a partir do
// ícone de mover pra contar como um arraste de verdade. Abaixo disso, é
// tratado como um toque simples (fluxo de selecionar-e-trocar).
const LIMIAR_ARRASTE_PX = 8;

type Parcela = {
  id: string;
  nome: string;
  tipo: string;
  posX: number;
  posY: number;
  linhas: number | null;
  largura: string | null;
};

const TIPO_ESTILO: Record<string, string> = {
  parcela: "bg-arvo-terracota/10 border-arvo-terracota/40 text-arvo-terracota",
  corredor: "bg-arvo-grafite/5 border-arvo-grafite/15 text-arvo-grafite/50",
  rua: "bg-blue-50 border-blue-300 text-blue-700",
};

export function CroquiGrid({
  eventoId,
  parcelas,
  podeEditar = true,
}: {
  eventoId: string;
  parcelas: Parcela[];
  podeEditar?: boolean;
}) {
  const cols = Math.max(1, ...parcelas.map((p) => p.posX + 1));
  const rows = Math.max(1, ...parcelas.map((p) => p.posY + 1));

  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createParcela,
    undefined
  );

  const [selecionada, setSelecionada] = useState<string | null>(null);

  // Estado do arraste (mouse ou toque, via Pointer Events — funciona igual
  // nos dois). "arrastandoId" é a parcela sendo movida; "alvoHoverId" é a
  // parcela que está embaixo do dedo/cursor no momento, pra destacar onde ela
  // vai cair ao soltar.
  const [arrastandoId, setArrastandoId] = useState<string | null>(null);
  const [alvoHoverId, setAlvoHoverId] = useState<string | null>(null);
  const gestoRef = useRef<{
    origemId: string;
    inicioX: number;
    inicioY: number;
    arrastando: boolean;
  } | null>(null);
  const suprimirCliqueRef = useRef(false);

  function alternarSelecao(parcelaId: string) {
    if (!selecionada) {
      setSelecionada(parcelaId);
    } else if (selecionada === parcelaId) {
      setSelecionada(null);
    } else {
      moverParcela(selecionada, parcelaId);
      setSelecionada(null);
    }
  }

  function encerrarGesto() {
    gestoRef.current = null;
    setArrastandoId(null);
    setAlvoHoverId(null);
  }

  function iniciarArraste(e: ReactPointerEvent<HTMLButtonElement>, parcelaId: string) {
    e.currentTarget.setPointerCapture(e.pointerId);
    gestoRef.current = {
      origemId: parcelaId,
      inicioX: e.clientX,
      inicioY: e.clientY,
      arrastando: false,
    };
  }

  function moverArraste(e: ReactPointerEvent<HTMLButtonElement>) {
    const gesto = gestoRef.current;
    if (!gesto) return;

    if (!gesto.arrastando) {
      const dx = e.clientX - gesto.inicioX;
      const dy = e.clientY - gesto.inicioY;
      if (Math.hypot(dx, dy) < LIMIAR_ARRASTE_PX) return;
      gesto.arrastando = true;
      setArrastandoId(gesto.origemId);
    }

    const elementoAlvo = document
      .elementFromPoint(e.clientX, e.clientY)
      ?.closest<HTMLElement>("[data-parcela-id]");
    const alvoId = elementoAlvo?.dataset.parcelaId ?? null;
    // Só corredores e ruas não trocam de lugar — mesma regra de antes.
    const alvoValido =
      alvoId &&
      alvoId !== gesto.origemId &&
      parcelas.find((p) => p.id === alvoId)?.tipo === "parcela";
    setAlvoHoverId(alvoValido ? alvoId : null);
  }

  function soltarArraste() {
    const gesto = gestoRef.current;
    if (gesto?.arrastando) {
      suprimirCliqueRef.current = true;
      if (alvoHoverId && alvoHoverId !== gesto.origemId) {
        moverParcela(gesto.origemId, alvoHoverId);
      }
    }
    encerrarGesto();
  }

  function aoClicarMover(parcelaId: string) {
    if (suprimirCliqueRef.current) {
      suprimirCliqueRef.current = false;
      return;
    }
    alternarSelecao(parcelaId);
  }

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto rounded-2xl border border-arvo-terracota/10 bg-white p-5 shadow-sm">
        {parcelas.length === 0 ? (
          <p className="text-sm text-arvo-grafite/50">
            Nenhuma parcela cadastrada ainda. Adicione a primeira abaixo.
          </p>
        ) : (
          <>
            <p className="mb-3 text-xs text-arvo-grafite/50">
              {podeEditar
                ? "Toque numa parcela para ver os manejos feitos nela. Pra trocar duas de lugar, arraste pelo ícone de mover — ou toque nele e depois na outra parcela."
                : "Toque numa parcela para ver os manejos feitos nela."}
            </p>
            <div
              className="grid gap-2"
              style={{
                gridTemplateColumns: `repeat(${cols}, minmax(90px, 1fr))`,
                gridTemplateRows: `repeat(${rows}, minmax(60px, auto))`,
              }}
            >
              {parcelas.map((parcela) => {
                const arrastavel = podeEditar && parcela.tipo === "parcela";
                const clicavel = parcela.tipo === "parcela";
                return (
                  <div
                    key={parcela.id}
                    data-parcela-id={parcela.id}
                    style={{
                      gridColumnStart: parcela.posX + 1,
                      gridRowStart: parcela.posY + 1,
                    }}
                    className={cn(
                      "group relative flex flex-col items-center justify-center rounded-lg border p-2 text-center text-xs transition",
                      TIPO_ESTILO[parcela.tipo],
                      selecionada === parcela.id &&
                        "ring-2 ring-arvo-terracota ring-offset-1",
                      arrastandoId === parcela.id && "opacity-40",
                      alvoHoverId === parcela.id &&
                        "ring-2 ring-dashed ring-arvo-terracota bg-arvo-terracota/5"
                    )}
                  >
                    {clicavel ? (
                      <Link
                        href={`/manejos?eventoId=${eventoId}&parcelaId=${parcela.id}`}
                        className="flex flex-col items-center"
                      >
                        <span className="font-semibold">{parcela.nome}</span>
                        {parcela.linhas && (
                          <span className="opacity-70">{parcela.linhas} linhas</span>
                        )}
                      </Link>
                    ) : (
                      <>
                        <span className="font-semibold">{parcela.nome}</span>
                        {parcela.linhas && (
                          <span className="opacity-70">{parcela.linhas} linhas</span>
                        )}
                      </>
                    )}
                    {podeEditar && arrastavel && (
                      <button
                        type="button"
                        onPointerDown={(e) => iniciarArraste(e, parcela.id)}
                        onPointerMove={moverArraste}
                        onPointerUp={soltarArraste}
                        onPointerCancel={encerrarGesto}
                        onClick={() => aoClicarMover(parcela.id)}
                        title="Arrastar para mover, ou tocar e depois tocar em outra parcela"
                        aria-label="Mover parcela"
                        className={cn(
                          "absolute top-0.5 left-0.5 flex h-7 w-7 touch-none items-center justify-center rounded-full text-white select-none",
                          selecionada === parcela.id || arrastandoId === parcela.id
                            ? "bg-arvo-terracota"
                            : "bg-arvo-grafite/40"
                        )}
                      >
                        <Move className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {podeEditar && (
                      <form action={deleteParcela} className="absolute top-1 right-1">
                        <input type="hidden" name="parcelaId" value={parcela.id} />
                        <input type="hidden" name="eventoId" value={eventoId} />
                        <button
                          type="submit"
                          title="Remover parcela"
                          className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs leading-none text-white"
                        >
                          ×
                        </button>
                      </form>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {podeEditar && (
      <div className="rounded-2xl border border-arvo-terracota/10 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-arvo-grafite">
          Adicionar parcela
        </h2>
        <form
          action={formAction}
          className="grid grid-cols-2 gap-3 md:grid-cols-6"
        >
          <input type="hidden" name="eventoId" value={eventoId} />
          <input
            name="nome"
            placeholder="Nome (ex: GH 2459)"
            className="col-span-2 rounded-lg border border-arvo-grafite/15 px-2 py-2 text-xs"
          />
          <select
            name="tipo"
            defaultValue="parcela"
            className="rounded-lg border border-arvo-grafite/15 bg-white px-2 py-2 text-xs"
          >
            <option value="parcela">Parcela</option>
            <option value="corredor">Corredor</option>
            <option value="rua">Rua</option>
          </select>
          <input
            name="posX"
            type="number"
            placeholder="Coluna"
            className="rounded-lg border border-arvo-grafite/15 px-2 py-2 text-xs"
          />
          <input
            name="posY"
            type="number"
            placeholder="Linha"
            className="rounded-lg border border-arvo-grafite/15 px-2 py-2 text-xs"
          />
          <input
            name="linhas"
            type="number"
            placeholder="Nº linhas"
            className="rounded-lg border border-arvo-grafite/15 px-2 py-2 text-xs"
          />
          <input
            name="largura"
            placeholder="Largura (ex: 4.5m)"
            className="col-span-2 rounded-lg border border-arvo-grafite/15 px-2 py-2 text-xs"
          />
          <button
            type="submit"
            disabled={pending}
            className="col-span-2 rounded-lg bg-arvo-terracota px-3 py-2 text-xs font-semibold text-arvo-bg transition hover:opacity-90 disabled:opacity-60 md:col-span-1"
          >
            {pending ? "Adicionando..." : "Adicionar"}
          </button>
        </form>
        {state?.error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
            {state.error}
          </p>
        )}
      </div>
      )}
    </div>
  );
}
