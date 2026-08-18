"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    login,
    undefined
  );

  return (
    <form
      action={formAction}
      className="w-full max-w-sm rounded-2xl border border-arvo-terracota/10 bg-white p-8 shadow-sm"
    >
      <div className="mb-6 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/arvo-simbolo-terracota.svg"
          alt=""
          className="mx-auto mb-3 h-10 w-10"
        />
        <h1 className="font-display text-2xl font-bold text-arvo-grafite">
          Arvo
        </h1>
        <p className="mt-1 text-xs tracking-widest text-arvo-terracota uppercase">
          Caderno de Campo Digital
        </p>
      </div>

      <label
        htmlFor="email"
        className="mb-1 block text-sm font-medium text-arvo-grafite"
      >
        E-mail
      </label>
      <input
        id="email"
        name="email"
        type="email"
        required
        autoComplete="email"
        className="mb-4 w-full rounded-lg border border-arvo-grafite/15 px-3 py-3 text-sm outline-none focus:border-arvo-terracota"
      />

      <label
        htmlFor="senha"
        className="mb-1 block text-sm font-medium text-arvo-grafite"
      >
        Senha
      </label>
      <input
        id="senha"
        name="senha"
        type="password"
        required
        autoComplete="current-password"
        className="mb-2 w-full rounded-lg border border-arvo-grafite/15 px-3 py-3 text-sm outline-none focus:border-arvo-terracota"
      />

      {state?.error && (
        <p className="mb-4 rounded-lg bg-arvo-terracota/10 px-3 py-2 text-sm text-arvo-terracota">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="mt-4 w-full">
        {pending ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
