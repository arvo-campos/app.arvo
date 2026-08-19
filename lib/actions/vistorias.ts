"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireSession, requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { vistoriaSchema } from "@/lib/validations/vistoria";
import type { FormState } from "./clientes";

export async function createVistoria(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireSession();

  const raw = Object.fromEntries(formData.entries());
  const parcelasSugeridasIds = formData
    .getAll("parcelasSugeridasIds")
    .filter((v): v is string => typeof v === "string" && v.length > 0);

  const parsed = vistoriaSchema.safeParse({ ...raw, parcelasSugeridasIds });
  if (!parsed.success) {
    return {
      error: "Verifique os campos destacados.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const evento = await db.evento.findUnique({ where: { id: parsed.data.eventoId } });
  if (!evento) {
    return { error: "Evento não encontrado." };
  }
  if (session.role === "cliente" && evento.clienteId !== session.clienteId) {
    return { error: "Evento não encontrado." };
  }

  const {
    eventoId,
    data,
    solicitaIntervencao,
    intervencaoDescricao,
    parcelasSugeridasIds: parcelaIds,
    ...rest
  } = parsed.data;

  const vistoria = await db.vistoria.create({
    data: {
      eventoId,
      autorId: session.userId,
      data: new Date(data),
      solicitaIntervencao,
      intervencaoDescricao: solicitaIntervencao ? intervencaoDescricao : null,
      parcelasSugeridas:
        parcelaIds.length > 0
          ? { connect: parcelaIds.map((id) => ({ id })) }
          : undefined,
      ...rest,
    },
  });

  revalidatePath("/vistorias");
  redirect(`/vistorias/${vistoria.id}`);
}

export async function deleteVistoria(formData: FormData) {
  await requireAdmin();
  const vistoriaId = formData.get("vistoriaId") as string;
  await db.vistoria.delete({ where: { id: vistoriaId } });
  revalidatePath("/vistorias");
  redirect("/vistorias");
}
