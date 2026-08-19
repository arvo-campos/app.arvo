"use client";

import { useState } from "react";
import { useActionState } from "react";
import { createVistoria } from "@/lib/actions/vistorias";
import type { FormState } from "@/lib/actions/clientes";
import { Field } from "@/components/ui/Field";
import { SelectField } from "@/components/ui/SelectField";
import { Button } from "@/components/ui/Button";
import { ESTAGIO_CULTURA_LABEL, NIVEL_VISTORIA_LABEL } from "@/lib/constants";

function hoje() {
  return new Date().toISOString().slice(0, 10);
}

const OPCOES_ESTAGIO = [
  { value: "", label: "Não informado" },
  ...Object.entries(ESTAGIO_CULTURA_LABEL).map(([value, label]) => ({
    value,
    label,
  })),
];

const OPCOES_NIVEL = [
  { value: "", label: "Não avaliado" },
  ...Object.entries(NIVEL_VISTORIA_LABEL).map(([value, label]) => ({
    value,
    label,
  })),
];

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
  const [parcelasSugeridasIds, setParcelasSugeridasIds] = useState<string[]>([]);
  const parcelasDoEvento = parcelas.filter((p) => p.eventoId === eventoId);

  function alternarParcelaSugerida(id: string) {
    setParcelasSugeridasIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
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

      <SelectField
        label="Estágio da cultura"
        name="estagioCultura"
        defaultValue=""
        options={OPCOES_ESTAGIO}
      />

      <div className="mb-4">
        <p className="mb-2 text-sm font-medium text-arvo-grafite">
          Avaliação do campo
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SelectField
            label="Pragas"
            name="nivelPragas"
            defaultValue=""
            options={OPCOES_NIVEL}
          />
          <SelectField
            label="Doenças"
            name="nivelDoencas"
            defaultValue=""
            options={OPCOES_NIVEL}
          />
          <SelectField
            label="Plantas daninhas"
            name="nivelPlantasDaninhas"
            defaultValue=""
            options={OPCOES_NIVEL}
          />
          <SelectField
            label="Estresse hídrico / clima"
            name="nivelEstresseHidrico"
            defaultValue=""
            options={OPCOES_NIVEL}
          />
        </div>
      </div>

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

      <div className="mb-4 rounded-xl border border-arvo-grafite/10 bg-arvo-bg/40 p-4">
        <p className="mb-1 text-sm font-medium text-arvo-grafite">
          Sugestão de manejo
        </p>
        <p className="mb-3 text-xs text-arvo-grafite/50">
          Opcional — se já tiver uma recomendação a partir do que observou,
          deixe registrada aqui.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Produto sugerido" name="sugestaoProduto" />
          <Field label="Dosagem sugerida" name="sugestaoDosagem" />
        </div>
        {parcelasSugeridasIds.map((id) => (
          <input key={id} type="hidden" name="parcelasSugeridasIds" value={id} />
        ))}
        {eventoId && parcelasDoEvento.length > 0 && (
          <div>
            <p className="mb-1 block text-sm font-medium text-arvo-grafite">
              Parcelas sugeridas
            </p>
            <div className="grid max-h-40 grid-cols-2 gap-1.5 overflow-y-auto rounded-lg border border-arvo-grafite/15 bg-white p-3 sm:grid-cols-3">
              {parcelasDoEvento.map((p) => (
                <label
                  key={p.id}
                  className="flex items-center gap-1.5 text-sm text-arvo-grafite"
                >
                  <input
                    type="checkbox"
                    checked={parcelasSugeridasIds.includes(p.id)}
                    onChange={() => alternarParcelaSugerida(p.id)}
                    className="accent-arvo-terracota"
                  />
                  {p.nome}
                </label>
              ))}
            </div>
          </div>
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
