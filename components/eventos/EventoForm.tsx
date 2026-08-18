"use client";

import { useActionState } from "react";
import { createEvento, updateEvento } from "@/lib/actions/eventos";
import type { FormState } from "@/lib/actions/clientes";
import { Field } from "@/components/ui/Field";
import { SelectField } from "@/components/ui/SelectField";
import { Button } from "@/components/ui/Button";
import { STATUS_EVENTO_LABEL } from "@/lib/constants";

type EventoDefaults = {
  id: string;
  nome: string;
  clienteId: string;
  local: string;
  latitude: string | null;
  longitude: string | null;
  dataInicio: Date;
  dataFim: Date | null;
  status: string;
};

function toDateInputValue(data: Date | null) {
  if (!data) return "";
  return data.toISOString().slice(0, 10);
}

export function EventoForm({
  evento,
  clientes,
}: {
  evento?: EventoDefaults;
  clientes: { id: string; nome: string }[];
}) {
  const action = evento ? updateEvento.bind(null, evento.id) : createEvento;
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    undefined
  );

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-arvo-terracota/10 bg-white p-6 shadow-sm"
    >
      <Field
        label="Nome do evento"
        name="nome"
        defaultValue={evento?.nome}
        error={state?.fieldErrors?.nome}
        required
      />

      <SelectField
        label="Cliente"
        name="clienteId"
        defaultValue={evento?.clienteId ?? ""}
        error={state?.fieldErrors?.clienteId}
        placeholder="Selecione um cliente"
        options={clientes.map((c) => ({ value: c.id, label: c.nome }))}
        required
      />

      <Field
        label="Local"
        name="local"
        defaultValue={evento?.local}
        error={state?.fieldErrors?.local}
        placeholder="Ex: Cascavel - PR"
        required
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Latitude"
          name="latitude"
          defaultValue={evento?.latitude ?? ""}
          error={state?.fieldErrors?.latitude}
        />
        <Field
          label="Longitude"
          name="longitude"
          defaultValue={evento?.longitude ?? ""}
          error={state?.fieldErrors?.longitude}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Data de início"
          name="dataInicio"
          type="date"
          defaultValue={toDateInputValue(evento?.dataInicio ?? null)}
          error={state?.fieldErrors?.dataInicio}
          required
        />
        <Field
          label="Data de fim"
          name="dataFim"
          type="date"
          defaultValue={toDateInputValue(evento?.dataFim ?? null)}
          error={state?.fieldErrors?.dataFim}
        />
      </div>

      <SelectField
        label="Status"
        name="status"
        defaultValue={evento?.status ?? "em_andamento"}
        error={state?.fieldErrors?.status}
        options={Object.entries(STATUS_EVENTO_LABEL).map(([value, label]) => ({
          value,
          label,
        }))}
        required
      />

      {state?.error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="mt-2">
        {pending
          ? "Salvando..."
          : evento
            ? "Salvar alterações"
            : "Criar evento"}
      </Button>
    </form>
  );
}
