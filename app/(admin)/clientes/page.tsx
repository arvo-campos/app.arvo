import Link from "next/link";
import { db } from "@/lib/db";
import { LinkButton } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";

const TAMANHO_PAGINA = 20;

export default async function ClientesPage(props: PageProps<"/clientes">) {
  const searchParams = await props.searchParams;
  const busca = firstValue(searchParams.busca);
  const pagina = Math.max(1, Number(searchParams.pagina) || 1);

  const where = busca
    ? { nome: { contains: busca, mode: "insensitive" as const } }
    : undefined;

  const totalClientes = await db.cliente.count({ where });
  const totalPaginas = Math.max(1, Math.ceil(totalClientes / TAMANHO_PAGINA));

  const clientes = await db.cliente.findMany({
    where,
    orderBy: { nome: "asc" },
    include: { _count: { select: { eventos: true } } },
    skip: (pagina - 1) * TAMANHO_PAGINA,
    take: TAMANHO_PAGINA,
  });

  function hrefComPagina(p: number) {
    const params = new URLSearchParams();
    if (busca) params.set("busca", busca);
    params.set("pagina", String(p));
    return `/clientes?${params.toString()}`;
  }

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

      <form
        method="get"
        className="mt-6 flex gap-3 rounded-2xl border border-arvo-terracota/10 bg-white p-4 shadow-sm"
      >
        <input
          type="text"
          name="busca"
          defaultValue={busca ?? ""}
          placeholder="Buscar por nome..."
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
            href="/clientes"
            className="flex items-center px-2 text-sm font-medium text-arvo-grafite/50 hover:underline"
          >
            Limpar
          </Link>
        )}
      </form>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {clientes.length === 0 && (
          <p className="col-span-full rounded-2xl border border-arvo-terracota/10 bg-white px-5 py-6 text-center text-sm text-arvo-grafite/50 shadow-sm">
            Nenhum cliente encontrado com esse nome.
          </p>
        )}
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
        hrefFor={hrefComPagina}
      />
    </div>
  );
}

function firstValue(v: string | string[] | undefined) {
  if (Array.isArray(v)) return v[0];
  return v || undefined;
}
