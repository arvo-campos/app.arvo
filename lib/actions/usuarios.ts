"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { usuarioClienteSchema, resetSenhaSchema } from "@/lib/validations/usuario";
import type { FormState } from "./clientes";

export async function createUsuarioCliente(
  clienteId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  const parsed = usuarioClienteSchema.safeParse({
    nome: formData.get("nome"),
    email: formData.get("email"),
    senha: formData.get("senha"),
  });
  if (!parsed.success) {
    return {
      error: "Verifique os campos destacados.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const jaExiste = await db.usuario.findUnique({
    where: { email: parsed.data.email },
  });
  if (jaExiste) {
    return {
      error: "Já existe um usuário com esse e-mail.",
      fieldErrors: { email: ["E-mail já cadastrado."] },
    };
  }

  const senhaHash = await hashPassword(parsed.data.senha);
  await db.usuario.create({
    data: {
      nome: parsed.data.nome,
      email: parsed.data.email,
      senha: senhaHash,
      role: "cliente",
      clienteId,
    },
  });

  revalidatePath(`/clientes/${clienteId}/editar`);
  return undefined;
}

export async function resetSenhaUsuario(
  usuarioId: string,
  clienteId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  const parsed = resetSenhaSchema.safeParse({
    senha: formData.get("senha"),
  });
  if (!parsed.success) {
    return {
      error: "Verifique a senha.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const senhaHash = await hashPassword(parsed.data.senha);
  await db.usuario.update({
    where: { id: usuarioId },
    data: { senha: senhaHash, tentativasFalhas: 0, bloqueadoAte: null },
  });

  revalidatePath(`/clientes/${clienteId}/editar`);
  return undefined;
}

export async function deleteUsuarioCliente(formData: FormData) {
  await requireAdmin();
  const usuarioId = formData.get("usuarioId") as string;
  const clienteId = formData.get("clienteId") as string;
  await db.usuario.delete({ where: { id: usuarioId } });
  revalidatePath(`/clientes/${clienteId}/editar`);
}
