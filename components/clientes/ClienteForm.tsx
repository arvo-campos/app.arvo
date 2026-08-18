"use client";

import { useActionState } from "react";
import { createCliente, updateCliente, type FormState } from "@/lib/actions/clientes";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

type ClienteDefaults = {
  id: string;
  nome: string;
  responsavel: string;
  email: string;
  telefone: string | null;
};

export function ClienteForm({ cliente }: { cliente?: ClienteDefaults }) {
  const action = cliente
    ? updateCliente.bind(null, cliente.id)
    : createCliente;
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
        label="Nome do cliente"
        name="nome"
        defaultValue={cliente?.nome}
        error={state?.fieldErrors?.nome}
        required
      />
      <Field
        label="Responsável"
        name="responsavel"
        defaultValue={cliente?.responsavel}
        error={state?.fieldErrors?.responsavel}
        required
      />
      <Field
        label="E-mail"
        name="email"
        type="email"
        defaultValue={cliente?.email}
        error={state?.fieldErrors?.email}
        required
      />
      <Field
        label="Telefone"
        name="telefone"
        defaultValue={cliente?.telefone ?? ""}
        error={state?.fieldErrors?.telefone}
      />

      {state?.error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="mt-2">
        {pending
          ? "Salvando..."
          : cliente
            ? "Salvar alterações"
            : "Cadastrar cliente"}
      </Button>
    </form>
  );
}
