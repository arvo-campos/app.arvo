import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { VistoriaDocument } from "@/lib/pdf/VistoriaDocument";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await requireSession();

  const vistoria = await db.vistoria.findUnique({
    where: { id },
    include: {
      evento: { include: { cliente: true } },
      autor: true,
      fotos: { include: { parcela: true }, orderBy: { criadoEm: "asc" } },
    },
  });

  if (!vistoria) {
    return NextResponse.json({ error: "Vistoria não encontrada." }, { status: 404 });
  }
  if (session.role === "cliente" && vistoria.evento.clienteId !== session.clienteId) {
    return NextResponse.json({ error: "Vistoria não encontrada." }, { status: 404 });
  }

  const buffer = await renderToBuffer(<VistoriaDocument vistoria={vistoria} />);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="vistoria-${vistoria.id}.pdf"`,
    },
  });
}
