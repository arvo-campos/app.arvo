"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  verifyPassword,
  createSessionCookie,
  destroySessionCookie,
  homePathForRole,
  type Role,
} from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email("Informe um e-mail válido."),
  senha: z.string().min(1, "Informe a senha."),
});

export type LoginState = { error?: string } | undefined;

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    senha: formData.get("senha"),
  });

  if (!parsed.success) {
    return { error: "Preencha e-mail e senha corretamente." };
  }

  const usuario = await db.usuario.findUnique({
    where: { email: parsed.data.email },
  });

  if (!usuario || !(await verifyPassword(parsed.data.senha, usuario.senha))) {
    return { error: "E-mail ou senha inválidos." };
  }

  await createSessionCookie({
    userId: usuario.id,
    nome: usuario.nome,
    role: usuario.role as Role,
    clienteId: usuario.clienteId,
  });

  redirect(homePathForRole(usuario.role as Role));
}

export async function logout() {
  await destroySessionCookie();
  redirect("/login");
}
