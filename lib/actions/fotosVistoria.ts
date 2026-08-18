"use server";

import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";

async function podeEditarVistoria(vistoriaId: string) {
  const session = await requireSession();
  const vistoria = await db.vistoria.findUnique({ where: { id: vistoriaId } });
  if (!vistoria) return null;
  if (session.role === "admin" || vistoria.autorId === session.userId) {
    return vistoria;
  }
  return null;
}

export async function deleteFotoVistoria(formData: FormData) {
  const vistoriaId = formData.get("vistoriaId") as string;
  const vistoria = await podeEditarVistoria(vistoriaId);
  if (!vistoria) return;

  const fotoId = formData.get("fotoId") as string;
  const foto = await db.fotoVistoria.delete({ where: { id: fotoId } });
  await del(foto.url).catch(() => {});
  revalidatePath(`/vistorias/${vistoriaId}`);
}

export async function updateFotoVistoriaLegenda(formData: FormData) {
  const vistoriaId = formData.get("vistoriaId") as string;
  const vistoria = await podeEditarVistoria(vistoriaId);
  if (!vistoria) return;

  const fotoId = formData.get("fotoId") as string;
  const legenda = ((formData.get("legenda") as string) || "").trim();
  await db.fotoVistoria.update({
    where: { id: fotoId },
    data: { legenda: legenda || null },
  });
  revalidatePath(`/vistorias/${vistoriaId}`);
}
