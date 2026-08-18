import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { ManejoDocument } from "@/lib/pdf/ManejoDocument";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await requireSession();

  const manejo = await db.manejo.findUnique({
    where: { id },
    include: {
      evento: { include: { cliente: true } },
      produtos: true,
      fotos: { orderBy: { criadoEm: "asc" } },
      historico: { include: { usuario: true }, orderBy: { criadoEm: "asc" } },
    },
  });

  if (!manejo) {
    return NextResponse.json({ error: "Manejo não encontrado." }, { status: 404 });
  }
  if (session.role === "cliente" && manejo.evento.clienteId !== session.clienteId) {
    return NextResponse.json({ error: "Manejo não encontrado." }, { status: 404 });
  }

  const buffer = await renderToBuffer(<ManejoDocument manejo={manejo} />);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="manejo-${manejo.tipo}-${manejo.id}.pdf"`,
    },
  });
}
