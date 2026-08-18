"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireSession, requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { vistoriaSchema } from "@/lib/validations/vistoria";
import { validarFotos, salvarFotosValidas } from "@/lib/fotosVistoriaHelpers";
import type { FormState } from "./clientes";

export async function createVistoria(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireSession();

  const parsed = vistoriaSchema.safeParse(Object.fromEntries(formData.entries()));
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

  const arquivos = formData
    .getAll("fotos")
    .filter((item): item is File => item instanceof File && item.size > 0);
  const erroFotos = arquivos.length > 0 ? validarFotos(arquivos) : null;
  if (erroFotos) {
    return { error: erroFotos };
  }
  const parcelaId = (formData.get("parcelaId") as string) || null;

  const { eventoId, data, solicitaIntervencao, intervencaoDescricao, ...rest } =
    parsed.data;

  const vistoria = await db.vistoria.create({
    data: {
      eventoId,
      autorId: session.userId,
      data: new Date(data),
      solicitaIntervencao,
      intervencaoDescricao: solicitaIntervencao ? intervencaoDescricao : null,
      ...rest,
    },
  });

  if (arquivos.length > 0) {
    await salvarFotosValidas(vistoria.id, arquivos, parcelaId);
  }

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
