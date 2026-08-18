"use client";

import { useActionState } from "react";
import { registrarAprovacao } from "@/lib/actions/aprovacoes";
import type { FormState } from "@/lib/actions/clientes";
import { Button } from "@/components/ui/Button";

export function AprovacaoActions({ manejoId }: { manejoId: string }) {
  const action = registrarAprovacao.bind(null, manejoId);
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    undefined
  );

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-arvo-terracota/40 bg-arvo-terracota/5 p-5"
    >
      <h2 className="text-sm font-semibold text-arvo-grafite">
        Esse manejo está aguardando sua aprovação
      </h2>
      <label
        htmlFor="observacao"
        className="mt-3 mb-1 block text-sm font-medium text-arvo-grafite"
      >
        Observação{" "}
        <span className="font-normal text-arvo-grafite/50">
          (obrigatória para reprovar)
        </span>
      </label>
      <textarea
        id="observacao"
        name="observacao"
        rows={3}
        className="w-full rounded-lg border border-arvo-grafite/15 px-3 py-2 text-sm outline-none focus:border-arvo-terracota"
      />
      {state?.fieldErrors?.observacao?.[0] && (
        <p className="mt-1 text-xs text-red-600">
          {state.fieldErrors.observacao[0]}
        </p>
      )}
      {state?.error && !state.fieldErrors && (
        <p className="mt-1 text-xs text-red-600">{state.error}</p>
      )}

      <div className="mt-4 flex gap-3">
        <Button type="submit" name="acao" value="aprovado" disabled={pending}>
          {pending ? "Enviando..." : "Aprovar"}
        </Button>
        <Button
          type="submit"
          name="acao"
          value="reprovado"
          disabled={pending}
          variant="danger"
        >
          {pending ? "Enviando..." : "Reprovar"}
        </Button>
      </div>
    </form>
  );
}
