import "server-only";
import { db } from "@/lib/db";

export async function buscarCapasPorEvento(
  eventoIds: string[]
): Promise<Map<string, string>> {
  if (eventoIds.length === 0) return new Map();

  const fotos = await db.foto.findMany({
    where: { manejo: { eventoId: { in: eventoIds } } },
    orderBy: { criadoEm: "asc" },
    select: { url: true, manejo: { select: { eventoId: true } } },
  });

  const capas = new Map<string, string>();
  for (const foto of fotos) {
    if (!capas.has(foto.manejo.eventoId)) {
      capas.set(foto.manejo.eventoId, foto.url);
    }
  }
  return capas;
}
