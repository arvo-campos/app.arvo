import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LinkButton } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import {
  STATUS_MANEJO_LABEL,
  STATUS_MANEJO_CLASSES,
  TIPO_MANEJO_LABEL,
} from "@/lib/constants";
import type { Prisma } from "@/generated/prisma/client";

const TAMANHO_PAGINA = 20;

function formatarData(data: Date) {
  return new Intl.DateTimeFormat("pt-BR").format(data);
}

export default async function ManejosPage(props: PageProps<"/manejos">) {
  const session = await requireSession();
  const ehAdmin = session.role === "admin";

  const searchParams = await props.searchParams;
  const clienteId = ehAdmin ? firstValue(searchParams.clienteId) : undefined;
  const eventoId = firstValue(searchParams.eventoId);
  const parcelaId = firstValue(searchParams.parcelaId);
  const tipo = firstValue(searchParams.tipo);
  const status = firstValue(searchParams.status);
  const de = firstValue(searchParams.de);
  const ate = firstValue(searchParams.ate);
  const pagina = Math.max(1, Number(firstValue(searchParams.pagina)) || 1);

  const where: Prisma.ManejoWhereInput = {
    ...(eventoId ? { eventoId } : {}),
    ...(parcelaId ? { parcelas: { some: { id: parcelaId } } } : {}),
    ...(ehAdmin
      ? clienteId
        ? { evento: { clienteId } }
        : {}
      : { evento: { clienteId: session.clienteId! } }),
    ...(tipo ? { tipo } : {}),
    ...(status ? { status } : {}),
    ...(de || ate
      ? {
          data: {
            ...(de ? { gte: new Date(de) } : {}),
            ...(ate ? { lte: new Date(ate) } : {}),
          },
        }
      : {}),
  };

  const totalManejos = await db.manejo.count({ where });
  const totalPaginas = Math.max(1, Math.ceil(totalManejos / TAMANHO_PAGINA));

  const [manejos, clientes, eventos, parcela] = await Promise.all([
    db.manejo.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { evento: { include: { cliente: true } } },
      skip: (pagina - 1) * TAMANHO_PAGINA,
      take: TAMANHO_PAGINA,
    }),
    ehAdmin
      ? db.cliente.findMany({ orderBy: { nome: "asc" }, select: { id: true, nome: true } })
      : Promise.resolve([]),
    db.evento.findMany({
      where: ehAdmin ? undefined : { clienteId: session.clienteId! },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true },
    }),
    parcelaId ? db.parcela.findUnique({ where: { id: parcelaId } }) : null,
  ]);

  function hrefComPagina(p: number) {
    const params = new URLSearchParams();
    if (clienteId) params.set("clienteId", clienteId);
    if (eventoId) params.set("eventoId", eventoId);
    if (parcelaId) params.set("parcelaId", parcelaId);
    if (tipo) params.set("tipo", tipo);
    if (status) params.set("status", status);
    if (de) params.set("de", de);
    if (ate) params.set("ate", ate);
    params.set("pagina", String(p));
    return `/manejos?${params.toString()}`;
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-arvo-grafite">
            Manejos
          </h1>
          <p className="mt-1 text-sm text-arvo-grafite/60">
            {totalManejos} manejo{totalManejos === 1 ? "" : "s"} encontrado
            {totalManejos === 1 ? "" : "s"}.
          </p>
        </div>
        {ehAdmin && <LinkButton href="/manejos/novo">Novo manejo</LinkButton>}
      </div>

      {parcela && (
        <div className="mt-4 flex items-center justify-between rounded-lg bg-arvo-terracota/10 px-4 py-2 text-sm text-arvo-terracota">
          <span>Filtrando pela parcela &ldquo;{parcela.nome}&rdquo;</span>
          <Link href={`/manejos?eventoId=${eventoId ?? ""}`} className="font-medium hover:underline">
            Remover filtro
          </Link>
        </div>
      )}

      <form
        method="get"
        className="mt-6 grid grid-cols-1 gap-3 rounded-2xl border border-arvo-terracota/10 bg-white p-4 shadow-sm sm:grid-cols-2 md:grid-cols-6"
      >
        {ehAdmin && (
          <select
            name="clienteId"
            defaultValue={clienteId ?? ""}
            className="rounded-lg border border-arvo-grafite/15 bg-white px-2 py-3 text-xs"
          >
            <option value="">Cliente (todos)</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        )}
        <select
          name="eventoId"
          defaultValue={eventoId ?? ""}
          className="rounded-lg border border-arvo-grafite/15 bg-white px-2 py-3 text-xs"
        >
          <option value="">Evento (todos)</option>
          {eventos.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nome}
            </option>
          ))}
        </select>
        <select
          name="tipo"
          defaultValue={tipo ?? ""}
          className="rounded-lg border border-arvo-grafite/15 bg-white px-2 py-3 text-xs"
        >
          <option value="">Tipo (todos)</option>
          {Object.entries(TIPO_MANEJO_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          name="status"
          defaultValue={status ?? ""}
          className="rounded-lg border border-arvo-grafite/15 bg-white px-2 py-3 text-xs"
        >
          <option value="">Status (todos)</option>
          {Object.entries(STATUS_MANEJO_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <input
          type="date"
          name="de"
          defaultValue={de ?? ""}
          className="rounded-lg border border-arvo-grafite/15 px-2 py-3 text-xs"
        />
        <input
          type="date"
          name="ate"
          defaultValue={ate ?? ""}
          className="rounded-lg border border-arvo-grafite/15 px-2 py-3 text-xs"
        />
        <button
          type="submit"
          className="rounded-lg border border-arvo-grafite/15 px-3 py-3 text-xs font-medium text-arvo-grafite transition hover:bg-arvo-bg sm:col-span-2 md:col-span-1"
        >
          Filtrar
        </button>
        <Link
          href="/manejos"
          className="flex items-center justify-center rounded-lg text-xs font-medium text-arvo-grafite/50 hover:underline sm:col-span-2 md:col-span-1"
        >
          Limpar filtros
        </Link>
      </form>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {manejos.length === 0 && (
          <p className="col-span-full rounded-2xl border border-arvo-terracota/10 bg-white px-5 py-6 text-center text-sm text-arvo-grafite/50 shadow-sm">
            Nenhum manejo encontrado com esses filtros.
          </p>
        )}
        {manejos.map((manejo) => (
          <Link
            key={manejo.id}
            href={`/manejos/${manejo.id}`}
            className="block rounded-2xl border border-arvo-terracota/10 bg-white p-5 shadow-sm transition hover:border-arvo-terracota/40"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="font-medium text-arvo-grafite">
                {TIPO_MANEJO_LABEL[manejo.tipo]}
              </p>
              <StatusBadge
                label={STATUS_MANEJO_LABEL[manejo.status]}
                className={STATUS_MANEJO_CLASSES[manejo.status]}
              />
            </div>
            <div className="mt-3 text-sm text-arvo-grafite/70">
              {ehAdmin && <div>{manejo.evento.cliente.nome}</div>}
              <div className={ehAdmin ? "text-xs text-arvo-grafite/50" : ""}>
                {manejo.evento.nome}
              </div>
            </div>
            <p className="mt-2 text-xs text-arvo-grafite/50">
              {formatarData(manejo.data)}
            </p>
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
