"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Move } from "lucide-react";
import { createParcela, deleteParcela, moverParcela } from "@/lib/actions/parcelas";
import type { FormState } from "@/lib/actions/clientes";
import { cn } from "@/lib/utils";

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
                ? "Toque numa parcela para ver os manejos feitos nela. Pra trocar duas de lugar, toque no ícone de mover em uma e depois na outra (ou arraste, no computador)."
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
                    draggable={arrastavel}
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", parcela.id);
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragOver={(e) => {
                      if (arrastavel) e.preventDefault();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (!podeEditar) return;
                      const arrastadaId = e.dataTransfer.getData("text/plain");
                      if (arrastadaId && arrastadaId !== parcela.id) {
                        moverParcela(arrastadaId, parcela.id);
                      }
                    }}
                    style={{
                      gridColumnStart: parcela.posX + 1,
                      gridRowStart: parcela.posY + 1,
                    }}
                    className={cn(
                      "group relative flex flex-col items-center justify-center rounded-lg border p-2 text-center text-xs",
                      TIPO_ESTILO[parcela.tipo],
                      arrastavel && "cursor-grab active:cursor-grabbing",
                      selecionada === parcela.id &&
                        "ring-2 ring-arvo-terracota ring-offset-1"
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
                        onClick={() => alternarSelecao(parcela.id)}
                        title="Mover parcela"
                        className={cn(
                          "absolute top-1 left-1 flex h-5 w-5 items-center justify-center rounded-full text-white",
                          selecionada === parcela.id
                            ? "bg-arvo-terracota"
                            : "bg-arvo-grafite/40"
                        )}
                      >
                        <Move className="h-3 w-3" />
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
