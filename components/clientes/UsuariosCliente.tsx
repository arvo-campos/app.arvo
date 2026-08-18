"use client";

import { useActionState } from "react";
import {
  createUsuarioCliente,
  deleteUsuarioCliente,
  resetSenhaUsuario,
} from "@/lib/actions/usuarios";
import type { FormState } from "@/lib/actions/clientes";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

type Usuario = { id: string; nome: string; email: string };

function ResetSenhaUsuario({
  usuario,
  clienteId,
}: {
  usuario: Usuario;
  clienteId: string;
}) {
  const action = resetSenhaUsuario.bind(null, usuario.id, clienteId);
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    undefined
  );

  return (
    <details className="group">
      <summary className="cursor-pointer list-none text-xs font-medium text-arvo-terracota select-none hover:underline">
        Redefinir senha
      </summary>
      <form
        action={formAction}
        className="mt-2 rounded-lg bg-white p-3 shadow-sm"
      >
        <Field
          label="Nova senha"
          name="senha"
          type="password"
          error={state?.fieldErrors?.senha}
          required
        />
        {state?.error && (
          <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
            {state.error}
          </p>
        )}
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Salvar nova senha"}
        </Button>
      </form>
    </details>
  );
}

export function UsuariosCliente({
  clienteId,
  usuarios,
}: {
  clienteId: string;
  usuarios: Usuario[];
}) {
  const action = createUsuarioCliente.bind(null, clienteId);
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    undefined
  );

  return (
    <div className="rounded-2xl border border-arvo-terracota/10 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-arvo-grafite">
        Usuários com acesso
      </h2>
      <p className="mt-1 text-xs text-arvo-grafite/50">
        Cada login abaixo consegue entrar como esse cliente e aprovar manejos.
      </p>

      <ul className="mt-4 space-y-2">
        {usuarios.length === 0 && (
          <p className="text-sm text-arvo-grafite/50">
            Nenhum usuário cadastrado ainda.
          </p>
        )}
        {usuarios.map((usuario) => (
          <li
            key={usuario.id}
            className="rounded-lg bg-arvo-bg px-3 py-2"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-arvo-grafite">
                  {usuario.nome}
                </p>
                <p className="text-xs text-arvo-grafite/50">{usuario.email}</p>
              </div>
              <div className="flex items-center gap-4">
                <ResetSenhaUsuario usuario={usuario} clienteId={clienteId} />
                <form action={deleteUsuarioCliente}>
                  <input type="hidden" name="usuarioId" value={usuario.id} />
                  <input type="hidden" name="clienteId" value={clienteId} />
                  <button
                    type="submit"
                    className="text-xs font-medium text-red-600 hover:underline"
                  >
                    Remover
                  </button>
                </form>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <form key={usuarios.length} action={formAction} className="mt-5 border-t border-arvo-grafite/10 pt-5">
        <p className="mb-3 text-xs font-semibold text-arvo-grafite/60 uppercase">
          Adicionar novo usuário
        </p>
        <Field label="Nome" name="nome" error={state?.fieldErrors?.nome} required />
        <Field
          label="E-mail"
          name="email"
          type="email"
          error={state?.fieldErrors?.email}
          required
        />
        <Field
          label="Senha"
          name="senha"
          type="password"
          error={state?.fieldErrors?.senha}
          required
        />
        {state?.error && (
          <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {state.error}
          </p>
        )}
        <Button type="submit" disabled={pending}>
          {pending ? "Adicionando..." : "Adicionar usuário"}
        </Button>
      </form>
    </div>
  );
}
