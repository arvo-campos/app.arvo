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

const MAX_TENTATIVAS = 5;
const BLOQUEIO_MINUTOS = 15;

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

  if (usuario?.bloqueadoAte && usuario.bloqueadoAte > new Date()) {
    const minutos = Math.ceil(
      (usuario.bloqueadoAte.getTime() - Date.now()) / 60_000
    );
    return {
      error: `Muitas tentativas incorretas. Tente novamente em ${minutos} minuto(s).`,
    };
  }

  if (!usuario || !(await verifyPassword(parsed.data.senha, usuario.senha))) {
    if (usuario) {
      const tentativas = usuario.tentativasFalhas + 1;
      const atingiuLimite = tentativas >= MAX_TENTATIVAS;
      await db.usuario.update({
        where: { id: usuario.id },
        data: {
          tentativasFalhas: atingiuLimite ? 0 : tentativas,
          bloqueadoAte: atingiuLimite
            ? new Date(Date.now() + BLOQUEIO_MINUTOS * 60_000)
            : null,
        },
      });
    }
    return { error: "E-mail ou senha inválidos." };
  }

  if (usuario.tentativasFalhas > 0 || usuario.bloqueadoAte) {
    await db.usuario.update({
      where: { id: usuario.id },
      data: { tentativasFalhas: 0, bloqueadoAte: null },
    });
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
