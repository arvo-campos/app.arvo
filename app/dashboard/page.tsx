import Link from "next/link";
import { requireSession, type Session } from "@/lib/auth";
import { db } from "@/lib/db";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatusAprovacaoCard } from "@/components/dashboard/StatusAprovacaoCard";
import { CalendarioMes } from "@/components/dashboard/CalendarioMes";
import { ChartPorTipo } from "@/components/dashboard/ChartPorTipo";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ContadorD0 } from "@/components/eventos/ContadorD0";
import { ClimaWidget } from "@/components/eventos/ClimaWidget";
import { buscarClima } from "@/lib/weather";
import {
  STATUS_MANEJO_LABEL,
  STATUS_MANEJO_CLASSES,
  TIPO_MANEJO_LABEL,
} from "@/lib/constants";
import { parseMesParam } from "@/lib/utils";

async function DashboardAdmin({
  mesSelecionado,
}: {
  mesSelecionado: { ano: number; mes: number } | null;
}) {
  const [
    totalClientes,
    eventosEmAndamento,
    manejosPendentes,
    manejosAprovados,
    manejosReprovados,
  ] = await Promise.all([
    db.cliente.count(),
    db.evento.count({ where: { status: "em_andamento" } }),
    db.manejo.count({ where: { status: "pendente" } }),
    db.manejo.count({ where: { status: "aprovado" } }),
    db.manejo.count({ where: { status: "reprovado" } }),
  ]);

  const ultimosManejos = await db.manejo.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { evento: { include: { cliente: true } } },
  });

  const todosManejos = await db.manejo.findMany({
    select: { data: true },
  });

  const eventosAtivos = await db.evento.findMany({
    where: { status: "em_andamento" },
    orderBy: { dataInicio: "asc" },
    include: { cliente: true },
  });

  // Vários eventos costumam acontecer na mesma cidade — agrupa por local
  // pra pedir o clima uma única vez por cidade, não uma vez por evento.
  const gruposPorCidade = new Map<string, typeof eventosAtivos>();
  for (const evento of eventosAtivos) {
    const grupo = gruposPorCidade.get(evento.local) ?? [];
    grupo.push(evento);
    gruposPorCidade.set(evento.local, grupo);
  }
  const climasPorCidade = await Promise.all(
    Array.from(gruposPorCidade.entries()).map(async ([local, eventos]) => ({
      local,
      eventos,
      clima: await buscarClima(eventos[0].latitude, eventos[0].longitude),
    }))
  );

  const clientesParaAprovacao = await db.cliente.findMany({
    select: { id: true, nome: true },
    orderBy: { nome: "asc" },
  });
  const porCliente = await Promise.all(
    clientesParaAprovacao.map(async (c) => ({
      clienteId: c.id,
      clienteNome: c.nome,
      pendentes: await db.manejo.count({
        where: { status: "pendente", evento: { clienteId: c.id } },
      }),
    }))
  );
  porCliente.sort(
    (a, b) => b.pendentes - a.pendentes || a.clienteNome.localeCompare(b.clienteNome)
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-arvo-grafite">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-arvo-grafite/60">
        Visão geral de clientes, eventos e manejos.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Clientes" value={totalClientes} />
        <StatCard label="Eventos em andamento" value={eventosEmAndamento} />
        <StatCard label="Manejos pendentes" value={manejosPendentes} accent />
        <StatCard label="Manejos aprovados" value={manejosAprovados} />
      </div>

      {eventosAtivos.length > 0 && (
        <div className="mt-6 rounded-2xl border border-arvo-terracota/10 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-arvo-grafite">
            Eventos em andamento
          </h2>
          <div className="mt-3 space-y-2">
            {eventosAtivos.map((evento) => (
              <div
                key={evento.id}
                className="flex items-center justify-between rounded-lg bg-arvo-bg px-4 py-3 text-sm"
              >
                <span>
                  <span className="font-medium text-arvo-grafite">
                    {evento.cliente.nome}
                  </span>
                  <span className="text-arvo-grafite/50"> — {evento.nome}</span>
                </span>
                <ContadorD0
                  dataInicio={evento.dataInicio}
                  status={evento.status}
                  tamanho="grande"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {climasPorCidade.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {climasPorCidade.map(({ local, eventos, clima }) => (
            <ClimaWidget
              key={local}
              clima={clima}
              local={local}
              eventos={eventos.map((e) => `${e.cliente.nome} — ${e.nome}`)}
            />
          ))}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <CalendarioMes
            eventos={todosManejos}
            ano={mesSelecionado?.ano}
            mes={mesSelecionado?.mes}
            baseHref="/dashboard"
          />
        </div>
        <div className="rounded-2xl border border-arvo-terracota/10 bg-white p-5 shadow-sm lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-arvo-grafite">
              Últimos manejos
            </h2>
            <Link
              href="/manejos"
              className="text-xs font-medium text-arvo-terracota hover:underline"
            >
              Ver todos
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {ultimosManejos.length === 0 && (
              <p className="text-sm text-arvo-grafite/50">
                Nenhum manejo registrado ainda.
              </p>
            )}
            {ultimosManejos.map((manejo) => (
              <li key={manejo.id}>
                <Link
                  href={`/manejos/${manejo.id}`}
                  className="flex items-center justify-between rounded-lg px-2 py-2 text-sm transition hover:bg-arvo-bg"
                >
                  <span>
                    <span className="font-medium text-arvo-grafite">
                      {TIPO_MANEJO_LABEL[manejo.tipo]}
                    </span>
                    <span className="block text-xs text-arvo-grafite/50">
                      {manejo.evento.cliente.nome} · {manejo.evento.nome}
                    </span>
                  </span>
                  <StatusBadge
                    label={STATUS_MANEJO_LABEL[manejo.status]}
                    className={STATUS_MANEJO_CLASSES[manejo.status]}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6">
        <StatusAprovacaoCard
          aprovados={manejosAprovados}
          pendentes={manejosPendentes}
          reprovados={manejosReprovados}
          porCliente={porCliente}
        />
      </div>
    </div>
  );
}

async function DashboardCliente({
  session,
  mesSelecionado,
}: {
  session: Session;
  mesSelecionado: { ano: number; mes: number } | null;
}) {
  const eventos = await db.evento.findMany({
    where: { clienteId: session.clienteId! },
    orderBy: { dataInicio: "desc" },
  });

  const manejos = await db.manejo.findMany({
    where: { evento: { clienteId: session.clienteId! } },
    select: { tipo: true, data: true, status: true },
  });

  const totalEventos = eventos.length;
  const eventosEmAndamento = eventos.filter(
    (e) => e.status === "em_andamento"
  ).length;
  const manejosPendentes = manejos.filter((m) => m.status === "pendente").length;
  const manejosAprovados = manejos.filter((m) => m.status === "aprovado").length;

  const totalPorTipo = new Map<string, number>();
  for (const m of manejos) {
    totalPorTipo.set(m.tipo, (totalPorTipo.get(m.tipo) ?? 0) + 1);
  }
  const dadosGrafico = Array.from(totalPorTipo, ([tipo, total]) => ({
    tipo: TIPO_MANEJO_LABEL[tipo] ?? tipo,
    total,
  }));

  const eventoAtivo = eventos.find((e) => e.status === "em_andamento") ?? eventos[0];
  const clima = eventoAtivo
    ? await buscarClima(eventoAtivo.latitude, eventoAtivo.longitude)
    : null;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-arvo-grafite">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-arvo-grafite/60">
        Visão geral dos seus eventos e manejos.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Eventos" value={totalEventos} />
        <StatCard label="Em andamento" value={eventosEmAndamento} />
        <StatCard
          label="Aguardando sua aprovação"
          value={manejosPendentes}
          accent
        />
        <StatCard label="Aprovados" value={manejosAprovados} />
      </div>

      {eventos.length === 0 ? (
        <p className="mt-6 text-sm text-arvo-grafite/50">
          Nenhum evento vinculado à sua conta ainda.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="rounded-2xl border border-arvo-terracota/10 bg-white p-5 shadow-sm lg:col-span-3">
            <h2 className="text-sm font-semibold text-arvo-grafite">
              Intervenções realizadas
            </h2>
            <div className="mt-4">
              <ChartPorTipo data={dadosGrafico} />
            </div>
          </div>
          <div className="lg:col-span-2">
            <CalendarioMes
              eventos={manejos}
              ano={mesSelecionado?.ano}
              mes={mesSelecionado?.mes}
              baseHref="/dashboard"
            />
          </div>
          {eventoAtivo && (
            <div className="lg:col-span-5">
              <ClimaWidget clima={clima} local={eventoAtivo.local} />
            </div>
          )}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <Link
          href="/meus-eventos"
          className="text-sm font-medium text-arvo-terracota hover:underline"
        >
          Ver todos os meus eventos →
        </Link>
      </div>
    </div>
  );
}

export default async function DashboardPage(props: PageProps<"/dashboard">) {
  const session = await requireSession();
  const searchParams = await props.searchParams;
  const mesSelecionado = parseMesParam(searchParams.mes);

  if (session.role === "admin") {
    return <DashboardAdmin mesSelecionado={mesSelecionado} />;
  }
  return <DashboardCliente session={session} mesSelecionado={mesSelecionado} />;
}
