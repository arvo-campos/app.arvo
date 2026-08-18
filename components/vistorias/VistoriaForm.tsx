"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useActionState } from "react";
import { createVistoria } from "@/lib/actions/vistorias";
import type { FormState } from "@/lib/actions/clientes";
import { Field } from "@/components/ui/Field";
import { SelectField } from "@/components/ui/SelectField";
import { Button } from "@/components/ui/Button";

function hoje() {
  return new Date().toISOString().slice(0, 10);
}

export function VistoriaForm({
  eventos,
  parcelas,
  eventoIdInicial,
}: {
  eventos: { id: string; nome: string; cliente?: { nome: string } }[];
  parcelas: { id: string; nome: string; eventoId: string }[];
  eventoIdInicial?: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createVistoria,
    undefined
  );
  const [solicitaIntervencao, setSolicitaIntervencao] = useState(false);
  const [eventoId, setEventoId] = useState(eventoIdInicial ?? "");
  const parcelasDoEvento = parcelas.filter((p) => p.eventoId === eventoId);

  const [arquivos, setArquivos] = useState<File[]>([]);
  const inputFotosRef = useRef<HTMLInputElement>(null);

  const previews = useMemo(
    () => arquivos.map((arquivo) => URL.createObjectURL(arquivo)),
    [arquivos]
  );

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  function sincronizarInputFotos(lista: File[]) {
    const dt = new DataTransfer();
    lista.forEach((arquivo) => dt.items.add(arquivo));
    if (inputFotosRef.current) {
      inputFotosRef.current.files = dt.files;
    }
  }

  function adicionarArquivos(selecionados: FileList | null) {
    if (!selecionados || selecionados.length === 0) return;
    setArquivos((atual) => {
      const atualizado = [...atual, ...Array.from(selecionados)];
      sincronizarInputFotos(atualizado);
      return atualizado;
    });
  }

  function removerArquivo(index: number) {
    setArquivos((atual) => {
      const atualizado = atual.filter((_, i) => i !== index);
      sincronizarInputFotos(atualizado);
      return atualizado;
    });
  }

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-arvo-terracota/10 bg-white p-6 shadow-sm"
    >
      <SelectField
        label="Evento"
        name="eventoId"
        value={eventoId}
        onChange={(e) => setEventoId(e.target.value)}
        error={state?.fieldErrors?.eventoId}
        placeholder="Selecione o evento"
        options={eventos.map((e) => ({
          value: e.id,
          label: e.cliente ? `${e.cliente.nome} — ${e.nome}` : e.nome,
        }))}
        required
      />
      <Field
        label="Data da vistoria"
        name="data"
        type="date"
        defaultValue={hoje()}
        error={state?.fieldErrors?.data}
        required
      />

      <div className="mb-4">
        <label
          htmlFor="condicoes"
          className="mb-1 block text-sm font-medium text-arvo-grafite"
        >
          Condições do campo observadas
        </label>
        <textarea
          id="condicoes"
          name="condicoes"
          rows={2}
          className="w-full rounded-lg border border-arvo-grafite/15 px-3 py-2 text-sm outline-none focus:border-arvo-terracota"
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="observacoes"
          className="mb-1 block text-sm font-medium text-arvo-grafite"
        >
          Observações
        </label>
        <textarea
          id="observacoes"
          name="observacoes"
          rows={3}
          className="w-full rounded-lg border border-arvo-grafite/15 px-3 py-2 text-sm outline-none focus:border-arvo-terracota"
        />
      </div>

      <label className="mb-4 flex items-center gap-2 text-sm text-arvo-grafite">
        <input
          type="checkbox"
          name="solicitaIntervencao"
          checked={solicitaIntervencao}
          onChange={(e) => setSolicitaIntervencao(e.target.checked)}
          className="accent-arvo-terracota"
        />
        Solicitar uma intervenção a partir dessa vistoria
      </label>

      {solicitaIntervencao && (
        <div className="mb-4">
          <label
            htmlFor="intervencaoDescricao"
            className="mb-1 block text-sm font-medium text-arvo-grafite"
          >
            Descreva a intervenção necessária
          </label>
          <textarea
            id="intervencaoDescricao"
            name="intervencaoDescricao"
            rows={2}
            className="w-full rounded-lg border border-arvo-grafite/15 px-3 py-2 text-sm outline-none focus:border-arvo-terracota"
          />
          {state?.fieldErrors?.intervencaoDescricao?.[0] && (
            <p className="mt-1 text-xs text-red-600">
              {state.fieldErrors.intervencaoDescricao[0]}
            </p>
          )}
        </div>
      )}

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-arvo-grafite">
          Fotos
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              adicionarArquivos(e.target.files);
              e.target.value = "";
            }}
            className="text-sm text-arvo-grafite/70"
          />
          <label
            htmlFor="foto-camera"
            className="cursor-pointer rounded-lg border border-arvo-terracota/30 px-3 py-2 text-xs font-medium text-arvo-terracota hover:bg-arvo-terracota/5"
          >
            Tirar foto agora
          </label>
          <input
            id="foto-camera"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => {
              adicionarArquivos(e.target.files);
              e.target.value = "";
            }}
            className="hidden"
          />
          {/* Input oculto de verdade — é o único que vai no envio do formulário. */}
          <input ref={inputFotosRef} type="file" name="fotos" multiple className="hidden" />
        </div>
        <p className="mt-1 text-xs text-arvo-grafite/50">
          Opcional — dá pra escolher fotos já tiradas ou abrir a câmera do
          celular na hora. Também é possível adicionar depois, na tela da
          vistoria.
        </p>

        {arquivos.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {arquivos.map((arquivo, index) => (
              <div
                key={index}
                className="group relative aspect-square overflow-hidden rounded-lg border border-arvo-grafite/10 bg-arvo-bg"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previews[index]}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removerArquivo(index)}
                  aria-label="Remover foto"
                  className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs leading-none text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {arquivos.length > 0 && parcelasDoEvento.length > 0 && (
          <select
            name="parcelaId"
            defaultValue=""
            className="mt-3 rounded-lg border border-arvo-grafite/15 bg-white px-2 py-2 text-xs"
          >
            <option value="">Sem parcela específica</option>
            {parcelasDoEvento.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        )}
      </div>

      {state?.error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Registrar vistoria"}
      </Button>
    </form>
  );
}
