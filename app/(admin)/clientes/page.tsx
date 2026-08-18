import Link from "next/link";
import { db } from "@/lib/db";
import { LinkButton } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";

const TAMANHO_PAGINA = 20;

export default async function ClientesPage(props: PageProps<"/clientes">) {
  const searchParams = await props.searchParams;
  const pagina = Math.max(1, Number(searchParams.pagina) || 1);

  const totalClientes = await db.cliente.count();
  const totalPaginas = Math.max(1, Math.ceil(totalClientes / TAMANHO_PAGINA));

  const clientes = await db.cliente.findMany({
    orderBy: { nome: "asc" },
    include: { _count: { select: { eventos: true } } },
    skip: (pagina - 1) * TAMANHO_PAGINA,
    take: TAMANHO_PAGINA,
  });

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-arvo-grafite">
            Clientes
          </h1>
          <p className="mt-1 text-sm text-arvo-grafite/60">
            {totalClientes} cliente{totalClientes === 1 ? "" : "s"}{" "}
            cadastrado{totalClientes === 1 ? "" : "s"}.
          </p>
        </div>
        <LinkButton href="/clientes/novo">Novo cliente</LinkButton>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {clientes.map((cliente) => (
          <Link
            key={cliente.id}
            href={`/clientes/${cliente.id}/editar`}
            className="block rounded-2xl border border-arvo-terracota/10 bg-white p-5 shadow-sm transition hover:border-arvo-terracota/40"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="font-medium text-arvo-grafite">{cliente.nome}</p>
              <span className="shrink-0 text-xs text-arvo-grafite/50">
                {cliente._count.eventos} evento
                {cliente._count.eventos === 1 ? "" : "s"}
              </span>
            </div>
            <p className="mt-1 text-sm text-arvo-grafite/70">
              {cliente.responsavel}
            </p>
            <p className="mt-3 text-sm text-arvo-grafite/70">{cliente.email}</p>
            {cliente.telefone && (
              <p className="text-xs text-arvo-grafite/50">{cliente.telefone}</p>
            )}
          </Link>
        ))}
      </div>

      <Pagination
        paginaAtual={pagina}
        totalPaginas={totalPaginas}
        hrefFor={(p) => `/clientes?pagina=${p}`}
      />
    </div>
  );
}
