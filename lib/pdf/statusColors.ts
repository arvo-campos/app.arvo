import { PDF_COLORS } from "./fonts";

export const STATUS_MANEJO_PDF_COLOR: Record<string, string> = {
  pendente: PDF_COLORS.terracota,
  aprovado: "#2563EB",
  reprovado: "#DC2626",
  concluido: PDF_COLORS.grafiteMuted,
};

export const NIVEL_VISTORIA_PDF_COLOR: Record<string, string> = {
  nao_observado: PDF_COLORS.grafiteMuted,
  leve: "#2563EB",
  moderado: PDF_COLORS.terracota,
  severo: "#DC2626",
};
