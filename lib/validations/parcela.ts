import { z } from "zod";

export const parcelaSchema = z.object({
  eventoId: z.string().min(1),
  nome: z.string().min(1, "Informe o nome da parcela."),
  linhas: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.coerce.number().int().optional()
  ),
  largura: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.string().optional()
  ),
  posX: z.coerce.number().int("Informe a coluna."),
  posY: z.coerce.number().int("Informe a linha."),
  tipo: z.enum(["parcela", "corredor", "rua"], {
    error: "Selecione um tipo válido.",
  }),
});

export type ParcelaInput = z.infer<typeof parcelaSchema>;
