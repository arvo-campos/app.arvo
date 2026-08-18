import { PDF_COLORS } from "./fonts";

export const STATUS_MANEJO_PDF_COLOR: Record<string, string> = {
  pendente: PDF_COLORS.terracota,
  aprovado: "#2563EB",
  reprovado: "#DC2626",
  concluido: PDF_COLORS.grafiteMuted,
};
