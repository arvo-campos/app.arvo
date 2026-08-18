"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { parcelaSchema } from "@/lib/validations/parcela";
import type { FormState } from "./clientes";

export async function createParcela(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  const parsed = parcelaSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return {
      error: "Verifique os campos destacados.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  await db.parcela.create({ data: parsed.data });
  revalidatePath(`/eventos/${parsed.data.eventoId}/editar`);
  return undefined;
}

export async function deleteParcela(formData: FormData) {
  await requireAdmin();
  const parcelaId = formData.get("parcelaId") as string;
  const eventoId = formData.get("eventoId") as string;
  await db.parcela.delete({ where: { id: parcelaId } });
  revalidatePath(`/eventos/${eventoId}/editar`);
}

export async function moverParcela(parcelaArrastadaId: string, parcelaAlvoId: string) {
  await requireAdmin();
  if (parcelaArrastadaId === parcelaAlvoId) return;

  const [arrastada, alvo] = await Promise.all([
    db.parcela.findUnique({ where: { id: parcelaArrastadaId } }),
    db.parcela.findUnique({ where: { id: parcelaAlvoId } }),
  ]);
  if (!arrastada || !alvo || arrastada.eventoId !== alvo.eventoId) return;

  await db.$transaction([
    db.parcela.update({
      where: { id: arrastada.id },
      data: { posX: alvo.posX, posY: alvo.posY },
    }),
    db.parcela.update({
      where: { id: alvo.id },
      data: { posX: arrastada.posX, posY: arrastada.posY },
    }),
  ]);

  revalidatePath(`/eventos/${arrastada.eventoId}/editar`);
}
