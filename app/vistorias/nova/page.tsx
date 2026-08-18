import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { VistoriaForm } from "@/components/vistorias/VistoriaForm";

export default async function NovaVistoriaPage(props: PageProps<"/vistorias/nova">) {
  const session = await requireSession();
  const searchParams = await props.searchParams;
  const eventoIdInicial =
    typeof searchParams.eventoId === "string" ? searchParams.eventoId : undefined;

  const eventos =
    session.role === "admin"
      ? await db.evento.findMany({
          orderBy: { dataInicio: "desc" },
          include: { cliente: { select: { nome: true } } },
        })
      : await db.evento.findMany({
          where: { clienteId: session.clienteId! },
          orderBy: { dataInicio: "desc" },
        });

  const parcelas = await db.parcela.findMany({
    where: {
      tipo: "parcela",
      eventoId: { in: eventos.map((e) => e.id) },
    },
    orderBy: { nome: "asc" },
    select: { id: true, nome: true, eventoId: true },
  });

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-arvo-grafite">
        Nova vistoria
      </h1>
      <p className="mt-1 text-sm text-arvo-grafite/60">
        Registre as condições do campo, observações e, se precisar, solicite
        uma intervenção.
      </p>
      <div className="mt-6">
        <VistoriaForm
          eventos={eventos}
          parcelas={parcelas}
          eventoIdInicial={eventoIdInicial}
        />
      </div>
    </div>
  );
}
