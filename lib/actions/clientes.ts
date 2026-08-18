"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { clienteSchema } from "@/lib/validations/cliente";

export type FormState =
  | { error?: string; fieldErrors?: Record<string, string[]> }
  | undefined;

function parseCliente(formData: FormData) {
  return clienteSchema.safeParse({
    nome: formData.get("nome"),
    responsavel: formData.get("responsavel"),
    email: formData.get("email"),
    telefone: (formData.get("telefone") as string) || undefined,
  });
}

export async function createCliente(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  const parsed = parseCliente(formData);
  if (!parsed.success) {
    return {
      error: "Verifique os campos destacados.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  await db.cliente.create({ data: parsed.data });
  revalidatePath("/clientes");
  redirect("/clientes");
}

export async function updateCliente(
  clienteId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  const parsed = parseCliente(formData);
  if (!parsed.success) {
    return {
      error: "Verifique os campos destacados.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  await db.cliente.update({ where: { id: clienteId }, data: parsed.data });
  revalidatePath("/clientes");
  redirect("/clientes");
}

export async function deleteCliente(formData: FormData) {
  await requireAdmin();
  const clienteId = formData.get("clienteId") as string;
  await db.cliente.delete({ where: { id: clienteId } });
  revalidatePath("/clientes");
  redirect("/clientes");
}
