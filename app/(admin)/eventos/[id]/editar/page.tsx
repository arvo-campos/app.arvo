import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { EventoForm } from "@/components/eventos/EventoForm";
import { CroquiGrid } from "@/components/eventos/CroquiGrid";

export default async function EditarEventoPage(
  props: PageProps<"/eventos/[id]/editar">
) {
  const { id } = await props.params;
  const [evento, clientes] = await Promise.all([
    db.evento.findUnique({
      where: { id },
      include: { parcelas: { orderBy: [{ posY: "asc" }, { posX: "asc" }] } },
    }),
    db.cliente.findMany({ orderBy: { nome: "asc" }, select: { id: true, nome: true } }),
  ]);
  if (!evento) notFound();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-arvo-grafite">
        Editar evento
      </h1>
      <p className="mt-1 text-sm text-arvo-grafite/60">{evento.nome}</p>
      <div className="mt-6 max-w-lg">
        <EventoForm evento={evento} clientes={clientes} />
      </div>

      <div className="mt-10">
        <h2 className="font-display text-lg font-bold text-arvo-grafite">
          Croqui
        </h2>
        <p className="mt-1 text-sm text-arvo-grafite/60">
          Layout das parcelas, corredores e ruas do evento.
        </p>
        <div className="mt-4">
          <CroquiGrid eventoId={evento.id} parcelas={evento.parcelas} />
        </div>
      </div>
    </div>
  );
}
