"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { eventoSchema } from "@/lib/validations/evento";
import type { FormState } from "./clientes";

function parseEvento(formData: FormData) {
  return eventoSchema.safeParse({
    nome: formData.get("nome"),
    clienteId: formData.get("clienteId"),
    local: formData.get("local"),
    latitude: (formData.get("latitude") as string) || undefined,
    longitude: (formData.get("longitude") as string) || undefined,
    dataInicio: formData.get("dataInicio"),
    dataFim: (formData.get("dataFim") as string) || undefined,
    status: formData.get("status"),
  });
}

export async function createEvento(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  const parsed = parseEvento(formData);
  if (!parsed.success) {
    return {
      error: "Verifique os campos destacados.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const { dataInicio, dataFim, ...rest } = parsed.data;
  await db.evento.create({
    data: {
      ...rest,
      dataInicio: new Date(dataInicio),
      dataFim: dataFim ? new Date(dataFim) : null,
    },
  });
  revalidatePath("/eventos");
  redirect("/eventos");
}

export async function updateEvento(
  eventoId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  const parsed = parseEvento(formData);
  if (!parsed.success) {
    return {
      error: "Verifique os campos destacados.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const { dataInicio, dataFim, ...rest } = parsed.data;
  await db.evento.update({
    where: { id: eventoId },
    data: {
      ...rest,
      dataInicio: new Date(dataInicio),
      dataFim: dataFim ? new Date(dataFim) : null,
    },
  });
  revalidatePath("/eventos");
  redirect("/eventos");
}
