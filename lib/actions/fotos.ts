"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import sharp from "sharp";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import type { FormState } from "./clientes";

const TIPOS_ACEITOS = ["image/jpeg", "image/png", "image/webp", "image/heic"];
const TAMANHO_MAXIMO = 8 * 1024 * 1024; // 8MB por foto
const LARGURA_MAXIMA = 1600;

function extensaoDe(nomeArquivo: string) {
  const ext = path.extname(nomeArquivo).replace(".", "").toLowerCase();
  return ext || "jpg";
}

export async function uploadFotos(
  manejoId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  const manejo = await db.manejo.findUnique({ where: { id: manejoId } });
  if (!manejo) return { error: "Manejo não encontrado." };

  const arquivos = formData
    .getAll("fotos")
    .filter((item): item is File => item instanceof File && item.size > 0);

  if (arquivos.length === 0) {
    return { error: "Selecione ao menos uma foto." };
  }

  for (const arquivo of arquivos) {
    if (!TIPOS_ACEITOS.includes(arquivo.type)) {
      return { error: `Arquivo "${arquivo.name}" não é uma imagem aceita.` };
    }
    if (arquivo.size > TAMANHO_MAXIMO) {
      return { error: `Arquivo "${arquivo.name}" passa de 8MB.` };
    }
  }

  const pastaDestino = path.join(
    process.cwd(),
    "public",
    "uploads",
    "manejos",
    manejoId
  );
  await mkdir(pastaDestino, { recursive: true });

  for (const arquivo of arquivos) {
    const bytesOriginais = Buffer.from(await arquivo.arrayBuffer());
    const ehJpegOuPng = arquivo.type === "image/jpeg" || arquivo.type === "image/png";

    let bytesFinais = bytesOriginais;
    let extensaoFinal = extensaoDe(arquivo.name);

    if (ehJpegOuPng) {
      bytesFinais = await sharp(bytesOriginais)
        .rotate()
        .resize({ width: LARGURA_MAXIMA, withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();
      extensaoFinal = "jpg";
    }

    const nomeArquivo = `${randomUUID()}.${extensaoFinal}`;
    await writeFile(path.join(pastaDestino, nomeArquivo), bytesFinais);

    await db.foto.create({
      data: {
        manejoId,
        url: `/uploads/manejos/${manejoId}/${nomeArquivo}`,
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
  await db.foto.delete({ where: { id: fotoId } });
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
