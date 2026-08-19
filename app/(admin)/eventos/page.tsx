import Link from "next/link";
import { db } from "@/lib/db";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LinkButton } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { ContadorD0 } from "@/components/eventos/ContadorD0";
import { buscarCapasPorEvento } from "@/lib/eventoCapa";
import { STATUS_EVENTO_LABEL, STATUS_EVENTO_CLASSES } from "@/lib/constants";

const TAMANHO_PAGINA = 12;

function formatarData(data: Date) {
  return new Intl.DateTimeFormat("pt-BR").format(data);
}

export default async function EventosPage(props: PageProps<"/eventos">) {
  const searchParams = await props.searchParams;
  const busca = firstValue(searchParams.busca);
  const pagina = Math.max(1, Number(searchParams.pagina) || 1);

  const where = busca
    ? {
        OR: [
          { nome: { contains: busca, mode: "insensitive" as const } },
          { cliente: { nome: { contains: busca, mode: "insensitive" as const } } },
        ],
      }
    : undefined;

  const totalEventos = await db.evento.count({ where });
  const totalPaginas = Math.max(1, Math.ceil(totalEventos / TAMANHO_PAGINA));

  const eventos = await db.evento.findMany({
    where,
    orderBy: { dataInicio: "desc" },
    include: {
      cliente: true,
      _count: { select: { manejos: true, parcelas: true } },
    },
    skip: (pagina - 1) * TAMANHO_PAGINA,
    take: TAMANHO_PAGINA,
  });

  const capas = await buscarCapasPorEvento(eventos.map((e) => e.id));

  function hrefComPagina(p: number) {
    const params = new URLSearchParams();
    if (busca) params.set("busca", busca);
    params.set("pagina", String(p));
    return `/eventos?${params.toString()}`;
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-arvo-grafite">
            Eventos
          </h1>
          <p className="mt-1 text-sm text-arvo-grafite/60">
            {totalEventos} evento{totalEventos === 1 ? "" : "s"} cadastrado
            {totalEventos === 1 ? "" : "s"}.
          </p>
        </div>
        <LinkButton href="/eventos/novo">Novo evento</LinkButton>
      </div>

      <form
        method="get"
        className="mt-6 flex gap-3 rounded-2xl border border-arvo-terracota/10 bg-white p-4 shadow-sm"
      >
        <input
          type="text"
          name="busca"
          defaultValue={busca ?? ""}
          placeholder="Buscar por evento ou cliente..."
          className="flex-1 rounded-lg border border-arvo-grafite/15 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-lg border border-arvo-grafite/15 px-4 py-2 text-sm font-medium text-arvo-grafite transition hover:bg-arvo-bg"
        >
          Buscar
        </button>
        {busca && (
          <Link
            href="/eventos"
            className="flex items-center px-2 text-sm font-medium text-arvo-grafite/50 hover:underline"
          >
            Limpar
          </Link>
        )}
      </form>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        {eventos.length === 0 && (
          <p className="col-span-full rounded-2xl border border-arvo-terracota/10 bg-white px-5 py-6 text-center text-sm text-arvo-grafite/50 shadow-sm">
            Nenhum evento encontrado com essa busca.
          </p>
        )}
        {eventos.map((evento) => {
          const capa = capas.get(evento.id);
          return (
            <div
              key={evento.id}
              className="relative overflow-hidden rounded-2xl border border-arvo-terracota/10 bg-white shadow-sm transition hover:border-arvo-terracota/40"
            >
              <Link
                href={`/eventos/${evento.id}/editar`}
                className="absolute inset-0 z-0"
                aria-label={`Abrir ${evento.nome}`}
              />
              {capa && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={capa}
                  alt=""
                  className="h-32 w-full object-cover"
                />
              )}
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-arvo-terracota uppercase">
                      {evento.cliente.nome}
                    </p>
                    <h2 className="mt-1 font-display text-lg font-bold text-arvo-grafite">
                      {evento.nome}
                    </h2>
                  </div>
                  <StatusBadge
                    label={STATUS_EVENTO_LABEL[evento.status]}
                    className={STATUS_EVENTO_CLASSES[evento.status]}
                  />
                </div>
                <p className="mt-2 text-sm text-arvo-grafite/60">{evento.local}</p>
                <p className="mt-1 text-xs text-arvo-grafite/50">
                  {formatarData(evento.dataInicio)}
                  {evento.dataFim ? ` – ${formatarData(evento.dataFim)}` : ""}
                </p>
                <div className="mt-3">
                  <ContadorD0 dataInicio={evento.dataInicio} status={evento.status} />
                </div>
                <div className="mt-4 flex gap-4 text-xs text-arvo-grafite/60">
                  <span>{evento._count.parcelas} parcelas</span>
                  <span>{evento._count.manejos} manejos</span>
                </div>
                <div className="relative z-10 mt-3 flex flex-wrap gap-2">
                  <LinkButton
                    href={`/manejos/novo?eventoId=${evento.id}`}
                    variant="secondary"
                  >
                    + Manejo
                  </LinkButton>
                  <LinkButton
                    href={`/api/eventos/${evento.id}/pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="secondary"
                  >
                    PDF
                  </LinkButton>
                  <LinkButton href={`/eventos/${evento.id}/editar`} variant="secondary">
                    Editar
                  </LinkButton>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Pagination
        paginaAtual={pagina}
        totalPaginas={totalPaginas}
        hrefFor={hrefComPagina}
      />
    </div>
  );
}

function firstValue(v: string | string[] | undefined) {
  if (Array.isArray(v)) return v[0];
  return v || undefined;
}
