import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DIAS_SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];
const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export function CalendarioMes({
  eventos,
  ano: anoProp,
  mes: mesProp,
  baseHref,
}: {
  eventos: { data: Date }[];
  /** Ano a exibir. Se omitido, usa o ano atual. */
  ano?: number;
  /** Mês a exibir (0 = janeiro). Se omitido, usa o mês atual. */
  mes?: number;
  /** Caminho da página (ex: "/dashboard"). Se informado, mostra setas pra navegar entre meses. */
  baseHref?: string;
}) {
  const hoje = new Date();
  const ano = anoProp ?? hoje.getFullYear();
  const mes = mesProp ?? hoje.getMonth();
  const ehMesAtual = ano === hoje.getFullYear() && mes === hoje.getMonth();

  const contagemPorDia = new Map<number, number>();
  for (const ev of eventos) {
    const d = new Date(ev.data);
    if (d.getFullYear() === ano && d.getMonth() === mes) {
      contagemPorDia.set(d.getDate(), (contagemPorDia.get(d.getDate()) ?? 0) + 1);
    }
  }

  const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
  const totalDias = new Date(ano, mes + 1, 0).getDate();
  const celulas: (number | null)[] = [
    ...Array(primeiroDiaSemana).fill(null),
    ...Array.from({ length: totalDias }, (_, i) => i + 1),
  ];

  function hrefMes(offsetMeses: number) {
    const d = new Date(ano, mes + offsetMeses, 1);
    return `${baseHref}?mes=${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }

  return (
    <div className="rounded-2xl border border-arvo-terracota/10 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-arvo-grafite">
          {MESES[mes]} de {ano}
        </h2>
        {baseHref && (
          <div className="flex items-center gap-2">
            <Link
              href={hrefMes(-1)}
              aria-label="Mês anterior"
              className="rounded p-0.5 text-arvo-grafite/50 hover:bg-arvo-bg hover:text-arvo-terracota"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
            {!ehMesAtual && (
              <Link
                href={baseHref}
                className="text-[10px] font-medium text-arvo-terracota hover:underline"
              >
                hoje
              </Link>
            )}
            <Link
              href={hrefMes(1)}
              aria-label="Próximo mês"
              className="rounded p-0.5 text-arvo-grafite/50 hover:bg-arvo-bg hover:text-arvo-terracota"
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
      <div className="mt-4 grid grid-cols-7 gap-1 text-center">
        {DIAS_SEMANA.map((d, i) => (
          <div key={i} className="text-[10px] font-medium text-arvo-grafite/40">
            {d}
          </div>
        ))}
        {celulas.map((dia, i) => {
          const contagem = dia ? contagemPorDia.get(dia) : undefined;
          const ehHoje = ehMesAtual && dia === hoje.getDate();
          return (
            <div
              key={i}
              className={`flex aspect-square flex-col items-center justify-center rounded-lg text-xs ${
                dia === null
                  ? ""
                  : ehHoje
                    ? "bg-arvo-terracota text-arvo-bg font-semibold"
                    : contagem
                      ? "bg-arvo-terracota/10 text-arvo-terracota font-medium"
                      : "text-arvo-grafite/70"
              }`}
            >
              {dia}
              {contagem ? (
                <span className="text-[9px] leading-none opacity-80">
                  {contagem}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
