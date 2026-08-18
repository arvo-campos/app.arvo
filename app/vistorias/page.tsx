import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { LinkButton } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";

const TAMANHO_PAGINA = 20;

function formatarData(data: Date) {
  return new Intl.DateTimeFormat("pt-BR").format(data);
}

export default async function VistoriasPage(props: PageProps<"/vistorias">) {
  const session = await requireSession();
  const ehAdmin = session.role === "admin";

  const searchParams = await props.searchParams;
  const pagina = Math.max(1, Number(searchParams.pagina) || 1);

  const where = ehAdmin
    ? {}
    : { evento: { clienteId: session.clienteId! } };

  const totalVistorias = await db.vistoria.count({ where });
  const totalPaginas = Math.max(1, Math.ceil(totalVistorias / TAMANHO_PAGINA));

  const vistorias = await db.vistoria.findMany({
    where,
    orderBy: { data: "desc" },
    include: { evento: { include: { cliente: true } }, autor: true },
    skip: (pagina - 1) * TAMANHO_PAGINA,
    take: TAMANHO_PAGINA,
  });

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-arvo-grafite">
            Vistorias
          </h1>
          <p className="mt-1 text-sm text-arvo-grafite/60">
            {totalVistorias} vistoria{totalVistorias === 1 ? "" : "s"} registrada
            {totalVistorias === 1 ? "" : "s"}.
          </p>
        </div>
        <LinkButton href="/vistorias/nova">Nova vistoria</LinkButton>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {vistorias.length === 0 && (
          <p className="col-span-full rounded-2xl border border-arvo-terracota/10 bg-white px-5 py-6 text-center text-sm text-arvo-grafite/50 shadow-sm">
            Nenhuma vistoria registrada ainda.
          </p>
        )}
        {vistorias.map((vistoria) => (
          <Link
            key={vistoria.id}
            href={`/vistorias/${vistoria.id}`}
            className="block rounded-2xl border border-arvo-terracota/10 bg-white p-5 shadow-sm transition hover:border-arvo-terracota/40"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="font-medium text-arvo-grafite">
                {formatarData(vistoria.data)}
              </p>
              {vistoria.solicitaIntervencao && (
                <span className="inline-flex items-center rounded-full bg-arvo-terracota/15 px-2.5 py-1 text-xs font-medium text-arvo-terracota">
                  Intervenção solicitada
                </span>
              )}
            </div>
            <div className="mt-3 text-sm text-arvo-grafite/70">
              {ehAdmin && <div>{vistoria.evento.cliente.nome}</div>}
              <div className={ehAdmin ? "text-xs text-arvo-grafite/50" : ""}>
                {vistoria.evento.nome}
              </div>
            </div>
            <p className="mt-2 text-xs text-arvo-grafite/50">
              Autor: {vistoria.autor.nome}
            </p>
          </Link>
        ))}
      </div>

      <Pagination
        paginaAtual={pagina}
        totalPaginas={totalPaginas}
        hrefFor={(p) => `/vistorias?pagina=${p}`}
      />
    </div>
  );
}
