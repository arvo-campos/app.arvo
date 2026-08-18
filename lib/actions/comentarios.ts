"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import type { FormState } from "./clientes";

export async function createComentario(
  manejoId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireSession();
  const texto = ((formData.get("texto") as string) || "").trim();

  if (!texto) {
    return { error: "Escreva uma mensagem." };
  }

  const manejo = await db.manejo.findUnique({
    where: { id: manejoId },
    include: { evento: true },
  });

  if (!manejo) return { error: "Manejo não encontrado." };
  if (session.role === "cliente" && manejo.evento.clienteId !== session.clienteId) {
    return { error: "Manejo não encontrado." };
  }

  await db.comentario.create({
    data: { manejoId, usuarioId: session.userId, texto },
  });

  revalidatePath(`/manejos/${manejoId}`);
  return undefined;
}
