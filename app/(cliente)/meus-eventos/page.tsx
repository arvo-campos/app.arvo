import Link from "next/link";
import { requireCliente } from "@/lib/auth";
import { db } from "@/lib/db";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ContadorD0 } from "@/components/eventos/ContadorD0";
import { buscarCapasPorEvento } from "@/lib/eventoCapa";
import { STATUS_EVENTO_LABEL, STATUS_EVENTO_CLASSES } from "@/lib/constants";

function formatarData(data: Date) {
  return new Intl.DateTimeFormat("pt-BR").format(data);
}

export default async function MeusEventosPage() {
  const session = await requireCliente();

  const eventos = await db.evento.findMany({
    where: { clienteId: session.clienteId! },
    orderBy: { dataInicio: "desc" },
    include: {
      _count: {
        select: { manejos: { where: { status: "pendente" } } },
      },
    },
  });

  const capas = await buscarCapasPorEvento(eventos.map((e) => e.id));

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-arvo-grafite">
        Meus Eventos
      </h1>
      <p className="mt-1 text-sm text-arvo-grafite/60">
        Acompanhe os manejos registrados nos seus eventos e aprove ou
        reprove cada um.
      </p>

      {eventos.length === 0 && (
        <p className="mt-6 text-sm text-arvo-grafite/50">
          Nenhum evento vinculado à sua conta ainda.
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {eventos.map((evento) => {
          const pendentes = evento._count.manejos;
          const capa = capas.get(evento.id);
          return (
            <Link
              key={evento.id}
              href={`/meus-eventos/${evento.id}`}
              className="relative block overflow-hidden rounded-2xl border border-arvo-terracota/10 bg-white shadow-sm transition hover:border-arvo-terracota/40"
            >
              {capa && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={capa} alt="" className="h-32 w-full object-cover" />
              )}
              <div className="relative p-5">
                {pendentes > 0 && (
                  <span className="absolute top-4 right-4 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-arvo-terracota px-1.5 text-xs font-semibold text-white">
                    {pendentes}
                  </span>
                )}
                <p className="pr-8 text-xs font-medium text-arvo-terracota uppercase">
                  {STATUS_EVENTO_LABEL[evento.status]}
                </p>
                <h2 className="mt-1 font-display text-lg font-bold text-arvo-grafite">
                  {evento.nome}
                </h2>
                <p className="mt-2 text-sm text-arvo-grafite/60">{evento.local}</p>
                <p className="mt-1 text-xs text-arvo-grafite/50">
                  {formatarData(evento.dataInicio)}
                  {evento.dataFim ? ` – ${formatarData(evento.dataFim)}` : ""}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <StatusBadge
                    label={STATUS_EVENTO_LABEL[evento.status]}
                    className={STATUS_EVENTO_CLASSES[evento.status]}
                  />
                  <ContadorD0 dataInicio={evento.dataInicio} status={evento.status} />
                </div>
                {pendentes > 0 && (
                  <p className="mt-3 text-xs font-medium text-arvo-terracota">
                    {pendentes} manejo{pendentes === 1 ? "" : "s"} aguardando
                    sua aprovação
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
