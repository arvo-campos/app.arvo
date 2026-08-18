import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Lê um parâmetro de mês no formato "YYYY-MM" (ex: da URL) e devolve {ano, mes}, com mes 0-indexado. */
export function parseMesParam(
  valor: string | string[] | undefined
): { ano: number; mes: number } | null {
  const texto = Array.isArray(valor) ? valor[0] : valor;
  if (!texto) return null;
  const match = /^(\d{4})-(\d{2})$/.exec(texto);
  if (!match) return null;
  return { ano: Number(match[1]), mes: Number(match[2]) - 1 };
}

/** Diferença em minutos entre dois horários "HH:MM". Devolve null se algum estiver ausente/inválido ou se o fim vier antes do início. */
export function minutosEntreHorarios(
  inicio: string | null | undefined,
  fim: string | null | undefined
): number | null {
  const match = /^(\d{1,2}):(\d{2})$/;
  const mInicio = inicio ? match.exec(inicio) : null;
  const mFim = fim ? match.exec(fim) : null;
  if (!mInicio || !mFim) return null;
  const minutosInicio = Number(mInicio[1]) * 60 + Number(mInicio[2]);
  const minutosFim = Number(mFim[1]) * 60 + Number(mFim[2]);
  const diferenca = minutosFim - minutosInicio;
  return diferenca > 0 ? diferenca : null;
}

/** Formata um total de minutos como "8h30" (ou só "45min" quando for menos de 1h). */
export function formatarDuracao(minutosTotais: number): string {
  const horas = Math.floor(minutosTotais / 60);
  const minutos = minutosTotais % 60;
  if (horas === 0) return `${minutos}min`;
  return minutos === 0 ? `${horas}h` : `${horas}h${String(minutos).padStart(2, "0")}`;
}
