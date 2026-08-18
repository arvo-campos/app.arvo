import { requireSession, type Session } from "@/lib/auth";
import { db } from "@/lib/db";
import { StatCard } from "@/components/dashboard/StatCard";
import { ChartByCliente } from "@/components/dashboard/ChartByCliente";
import { ChartPorTipo } from "@/components/dashboard/ChartPorTipo";
import { minutosEntreHorarios, formatarDuracao } from "@/lib/utils";

const MESES_ABREV = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];

function formatarData(data: Date) {
  return new Intl.DateTimeFormat("pt-BR").format(data);
}

async function RelatorioAdmin() {
  const eventosComManejos = await db.evento.findMany({
    include: { cliente: true, _count: { select: { manejos: true } } },
  });

  const totalPorCliente = new Map<string, number>();
  for (const evento of eventosComManejos) {
    totalPorCliente.set(
      evento.cliente.nome,
      (totalPorCliente.get(evento.cliente.nome) ?? 0) + evento._count.manejos
    );
  }
  const dadosGrafico = Array.from(totalPorCliente, ([cliente, total]) => ({
    cliente,
    total,
  })).filter((d) => d.total > 0);

  const totalPorStatus = await db.manejo.groupBy({
    by: ["status"],
    _count: { _all: true },
  });

  const totalManejos = totalPorStatus.reduce((soma, s) => soma + s._count._all, 0);
  const aprovados = totalPorStatus.find((s) => s.status === "aprovado")?._count._all ?? 0;
  const reprovados = totalPorStatus.find((s) => s.status === "reprovado")?._count._all ?? 0;
  const avaliados = aprovados + reprovados;
  const taxaAprovacao = avaliados > 0 ? Math.round((aprovados / avaliados) * 100) : null;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-arvo-grafite">
        Relatórios
      </h1>
      <p className="mt-1 text-sm text-arvo-grafite/60">
        Visão consolidada de todos os clientes e eventos.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total de manejos" value={totalManejos} />
        <StatCard
          label="Taxa de aprovação"
          value={taxaAprovacao ?? 0}
          accent
        />
        <StatCard label="Aprovados" value={aprovados} />
        <StatCard label="Reprovados" value={reprovados} />
      </div>

      <div className="mt-6 rounded-2xl border border-arvo-terracota/10 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-arvo-grafite">
          Manejos por cliente
        </h2>
        <div className="mt-4">
          <ChartByCliente data={dadosGrafico} />
        </div>
      </div>
    </div>
  );
}

async function RelatorioCliente({ session }: { session: Session }) {
  const clienteId = session.clienteId!;

  const eventos = await db.evento.findMany({
    where: { clienteId },
    orderBy: { dataInicio: "desc" },
  });

  const manejos = await db.manejo.findMany({
    where: { evento: { clienteId } },
    select: {
      eventoId: true,
      tipo: true,
      status: true,
      data: true,
      horaInicio: true,
      horaFim: true,
    },
  });

  const vistoriasPorEventoRaw = await db.vistoria.groupBy({
    by: ["eventoId"],
    where: { evento: { clienteId } },
    _count: { _all: true },
  });
  const vistoriasPorEvento = new Map(
    vistoriasPorEventoRaw.map((v) => [v.eventoId, v._count._all])
  );
  const totalVistorias = vistoriasPorEventoRaw.reduce(
    (soma, v) => soma + v._count._all,
    0
  );

  const totalFotosManejo = await db.foto.count({
    where: { manejo: { evento: { clienteId } } },
  });
  const totalFotosVistoria = await db.fotoVistoria.count({
    where: { vistoria: { evento: { clienteId } } },
  });
  const totalFotos = totalFotosManejo + totalFotosVistoria;

  const historicoAprovacao = await db.historicoAprovacao.groupBy({
    by: ["acao"],
    where: { manejo: { evento: { clienteId } } },
    _count: { _all: true },
  });
  const aprovados = historicoAprovacao.find((h) => h.acao === "aprovado")?._count._all ?? 0;
  const reprovados = historicoAprovacao.find((h) => h.acao === "reprovado")?._count._all ?? 0;
  const avaliados = aprovados + reprovados;
  const taxaAprovacao = avaliados > 0 ? Math.round((aprovados / avaliados) * 100) : null;

  const totalEventos = eventos.length;
  const manejosRealizados = manejos.filter((m) => m.status === "concluido").length;

  const resumoPorEvento = new Map<string, { manejos: number; minutos: number }>();
  const porMes = new Map<string, number>();
  let minutosTotais = 0;
  for (const m of manejos) {
    const atual = resumoPorEvento.get(m.eventoId) ?? { manejos: 0, minutos: 0 };
    atual.manejos += 1;
    const diferenca = minutosEntreHorarios(m.horaInicio, m.horaFim);
    if (diferenca) {
      atual.minutos += diferenca;
      minutosTotais += diferenca;
    }
    resumoPorEvento.set(m.eventoId, atual);

    const d = new Date(m.data);
    const chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    porMes.set(chave, (porMes.get(chave) ?? 0) + 1);
  }

  const dadosPorMes = Array.from(porMes.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([chave, total]) => {
      const [ano, mes] = chave.split("-").map(Number);
      return { tipo: `${MESES_ABREV[mes - 1]}/${String(ano).slice(2)}`, total };
    });

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-arvo-grafite">
        Relatórios
      </h1>
      <p className="mt-1 text-sm text-arvo-grafite/60">
        Um resumo de tudo o que já foi feito nos seus eventos.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Eventos atendidos" value={totalEventos} />
        <StatCard label="Manejos realizados" value={manejosRealizados} accent />
        <StatCard label="Vistorias realizadas" value={totalVistorias} />
        <StatCard label="Fotos documentadas" value={totalFotos} />
      </div>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-arvo-terracota/10 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-arvo-grafite/60">
            Horas de campo dedicadas
          </p>
          <p className="mt-2 font-display text-3xl font-bold text-arvo-grafite">
            {minutosTotais > 0 ? formatarDuracao(minutosTotais) : "—"}
          </p>
          <p className="mt-1 text-xs text-arvo-grafite/50">
            Soma do tempo registrado nos manejos já realizados.
          </p>
        </div>
        <div className="rounded-2xl border border-arvo-terracota/10 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-arvo-grafite/60">
            Taxa de aprovação
          </p>
          <p className="mt-2 font-display text-3xl font-bold text-arvo-grafite">
            {taxaAprovacao !== null ? `${taxaAprovacao}%` : "—"}
          </p>
          <p className="mt-1 text-xs text-arvo-grafite/50">
            {avaliados > 0
              ? `${aprovados} aprovado${aprovados === 1 ? "" : "s"} de ${avaliados} avaliado${avaliados === 1 ? "" : "s"}.`
              : "Ainda não há manejos avaliados."}
          </p>
        </div>
      </div>

      {dadosPorMes.length > 0 && (
        <div className="mt-6 rounded-2xl border border-arvo-terracota/10 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-arvo-grafite">
            Manejos ao longo do tempo
          </h2>
          <div className="mt-4">
            <ChartPorTipo data={dadosPorMes} />
          </div>
        </div>
      )}

      {eventos.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-arvo-terracota/10 bg-white shadow-sm">
          <h2 className="px-5 pt-5 text-sm font-semibold text-arvo-grafite">
            Por evento
          </h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-arvo-terracota/10 bg-arvo-bg/50 text-left text-xs text-arvo-grafite/60 uppercase">
                  <th className="px-5 py-2 font-medium">Evento</th>
                  <th className="px-5 py-2 font-medium">Período</th>
                  <th className="px-5 py-2 font-medium">Manejos</th>
                  <th className="px-5 py-2 font-medium">Vistorias</th>
                  <th className="px-5 py-2 font-medium">Horas dedicadas</th>
                </tr>
              </thead>
              <tbody>
                {eventos.map((evento) => {
                  const resumo = resumoPorEvento.get(evento.id) ?? {
                    manejos: 0,
                    minutos: 0,
                  };
                  return (
                    <tr
                      key={evento.id}
                      className="border-b border-arvo-terracota/5 last:border-0"
                    >
                      <td className="px-5 py-3 font-medium text-arvo-grafite">
                        {evento.nome}
                      </td>
                      <td className="px-5 py-3 text-arvo-grafite/70">
                        {formatarData(evento.dataInicio)}
                        {evento.dataFim ? ` – ${formatarData(evento.dataFim)}` : ""}
                      </td>
                      <td className="px-5 py-3 text-arvo-grafite/70">
                        {resumo.manejos}
                      </td>
                      <td className="px-5 py-3 text-arvo-grafite/70">
                        {vistoriasPorEvento.get(evento.id) ?? 0}
                      </td>
                      <td className="px-5 py-3 text-arvo-grafite/70">
                        {resumo.minutos > 0 ? formatarDuracao(resumo.minutos) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {eventos.length === 0 && (
        <p className="mt-6 text-sm text-arvo-grafite/50">
          Ainda não há dados suficientes para montar um relatório.
        </p>
      )}
    </div>
  );
}

export default async function RelatoriosPage() {
  const session = await requireSession();

  if (session.role === "admin") {
    return <RelatorioAdmin />;
  }
  return <RelatorioCliente session={session} />;
}
