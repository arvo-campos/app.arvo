import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { EventoDocument } from "@/lib/pdf/EventoDocument";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await requireSession();

  const evento = await db.evento.findUnique({
    where: { id },
    include: {
      cliente: true,
      manejos: {
        orderBy: { data: "asc" },
        include: { fotos: { orderBy: { criadoEm: "asc" } } },
      },
    },
  });

  if (!evento) {
    return NextResponse.json({ error: "Evento não encontrado." }, { status: 404 });
  }
  if (session.role === "cliente" && evento.clienteId !== session.clienteId) {
    return NextResponse.json({ error: "Evento não encontrado." }, { status: 404 });
  }

  const buffer = await renderToBuffer(<EventoDocument evento={evento} />);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="evento-${evento.nome.replace(/[^a-z0-9]+/gi, "-")}.pdf"`,
    },
  });
}
