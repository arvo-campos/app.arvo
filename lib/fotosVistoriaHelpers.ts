import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { db } from "@/lib/db";

const TIPOS_ACEITOS = ["image/jpeg", "image/png", "image/webp", "image/heic"];
const TAMANHO_MAXIMO = 8 * 1024 * 1024;
const LARGURA_MAXIMA = 1600;

function extensaoDe(nomeArquivo: string) {
  const ext = path.extname(nomeArquivo).replace(".", "").toLowerCase();
  return ext || "jpg";
}

export function validarFotos(arquivos: File[]): string | null {
  for (const arquivo of arquivos) {
    if (!TIPOS_ACEITOS.includes(arquivo.type)) {
      return `Arquivo "${arquivo.name}" não é uma imagem aceita.`;
    }
    if (arquivo.size > TAMANHO_MAXIMO) {
      return `Arquivo "${arquivo.name}" passa de 8MB.`;
    }
  }
  return null;
}

export async function salvarFotosValidas(
  vistoriaId: string,
  arquivos: File[],
  parcelaId: string | null
) {
  const pastaDestino = path.join(
    process.cwd(),
    "public",
    "uploads",
    "vistorias",
    vistoriaId
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

    await db.fotoVistoria.create({
      data: {
        vistoriaId,
        parcelaId: parcelaId || null,
        url: `/uploads/vistorias/${vistoriaId}/${nomeArquivo}`,
      },
    });
  }
}
