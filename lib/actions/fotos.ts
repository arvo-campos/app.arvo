"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { put, del } from "@vercel/blob";
import sharp from "sharp";
import { requireAdmin, requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { MAX_ARQUIVOS_FOTO } from "@/lib/constants";
import type { FormState } from "./clientes";

const TIPOS_ACEITOS = ["image/jpeg", "image/png", "image/webp", "image/heic"];
const TAMANHO_MAXIMO = 8 * 1024 * 1024; // 8MB por foto
const LARGURA_MAXIMA = 1600;

function extensaoDe(nomeArquivo: string) {
  const ext = nomeArquivo.split(".").pop()?.toLowerCase();
  return ext || "jpg";
}

export async function uploadFotos(
  manejoId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireSession();

  const manejo = await db.manejo.findUnique({
    where: { id: manejoId },
    include: { evento: true },
  });
  if (!manejo) return { error: "Manejo não encontrado." };
  if (session.role === "cliente" && manejo.evento.clienteId !== session.clienteId) {
    return { error: "Manejo não encontrado." };
  }

  const arquivos = formData
    .getAll("fotos")
    .filter((item): item is File => item instanceof File && item.size > 0);

  if (arquivos.length === 0) {
    return { error: "Selecione ao menos uma foto." };
  }
  if (arquivos.length > MAX_ARQUIVOS_FOTO) {
    return { error: `Envie no máximo ${MAX_ARQUIVOS_FOTO} fotos por vez.` };
  }

  for (const arquivo of arquivos) {
    if (!TIPOS_ACEITOS.includes(arquivo.type)) {
      return { error: `Arquivo "${arquivo.name}" não é uma imagem aceita.` };
    }
    if (arquivo.size > TAMANHO_MAXIMO) {
      return { error: `Arquivo "${arquivo.name}" passa de 8MB.` };
    }
  }

  for (const arquivo of arquivos) {
    const bytesOriginais = Buffer.from(await arquivo.arrayBuffer());
    const ehJpegOuPng = arquivo.type === "image/jpeg" || arquivo.type === "image/png";

    let bytesFinais: Buffer = bytesOriginais;
    let extensaoFinal = extensaoDe(arquivo.name);
    let contentType = arquivo.type;

    if (ehJpegOuPng) {
      bytesFinais = await sharp(bytesOriginais)
        .rotate()
        .resize({ width: LARGURA_MAXIMA, withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();
      extensaoFinal = "jpg";
      contentType = "image/jpeg";
    }

    const nomeArquivo = `${randomUUID()}.${extensaoFinal}`;
    const blob = await put(`manejos/${manejoId}/${nomeArquivo}`, bytesFinais, {
      access: "public",
      contentType,
    });

    await db.foto.create({
      data: {
        manejoId,
        url: blob.url,
      },
    });
  }

  revalidatePath(`/manejos/${manejoId}`);
  return undefined;
}

export async function deleteFoto(formData: FormData) {
  await requireAdmin();
  const fotoId = formData.get("fotoId") as string;
  const manejoId = formData.get("manejoId") as string;
  const foto = await db.foto.delete({ where: { id: fotoId } });
  await del(foto.url).catch(() => {});
  revalidatePath(`/manejos/${manejoId}`);
}

export async function updateFotoLegenda(formData: FormData) {
  await requireAdmin();
  const fotoId = formData.get("fotoId") as string;
  const manejoId = formData.get("manejoId") as string;
  const legenda = ((formData.get("legenda") as string) || "").trim();
  await db.foto.update({
    where: { id: fotoId },
    data: { legenda: legenda || null },
  });
  revalidatePath(`/manejos/${manejoId}`);
}
