"use client";

import { useActionState } from "react";
import { createComentario } from "@/lib/actions/comentarios";
import type { FormState } from "@/lib/actions/clientes";
import { Button } from "@/components/ui/Button";

type Comentario = {
  id: string;
  texto: string;
  criadoEm: Date;
  usuario: { nome: string; role: string };
};

function formatarDataHora(data: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(data);
}

export function ComentariosThread({
  manejoId,
  comentarios,
}: {
  manejoId: string;
  comentarios: Comentario[];
}) {
  const action = createComentario.bind(null, manejoId);
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    undefined
  );

  return (
    <div className="rounded-2xl border border-arvo-terracota/10 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-arvo-grafite">Comentários</h2>

      <ul className="mt-4 space-y-3">
        {comentarios.length === 0 && (
          <p className="text-sm text-arvo-grafite/50">
            Nenhum comentário ainda.
          </p>
        )}
        {comentarios.map((c) => (
          <li key={c.id} className="rounded-lg bg-arvo-bg px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-arvo-grafite">
                {c.usuario.nome}{" "}
                <span className="font-normal text-arvo-grafite/40">
                  ({c.usuario.role === "admin" ? "Arvo" : "Cliente"})
                </span>
              </span>
              <span className="text-[11px] text-arvo-grafite/40">
                {formatarDataHora(c.criadoEm)}
              </span>
            </div>
            <p className="mt-1 text-sm text-arvo-grafite/80">{c.texto}</p>
          </li>
        ))}
      </ul>

      <form
        key={comentarios.length}
        action={formAction}
        className="mt-4 flex gap-2"
      >
        <textarea
          name="texto"
          rows={1}
          placeholder="Escreva uma mensagem..."
          className="flex-1 rounded-lg border border-arvo-grafite/15 px-3 py-2 text-sm outline-none focus:border-arvo-terracota"
        />
        <Button type="submit" disabled={pending}>
          Enviar
        </Button>
      </form>
      {state?.error && (
        <p className="mt-2 text-xs text-red-600">{state.error}</p>
      )}
    </div>
  );
}
