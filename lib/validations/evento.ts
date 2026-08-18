import { z } from "zod";

export const eventoSchema = z.object({
  nome: z.string().min(1, "Informe o nome do evento."),
  clienteId: z.string().min(1, "Selecione um cliente."),
  local: z.string().min(1, "Informe o local."),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  dataInicio: z.string().min(1, "Informe a data de início."),
  dataFim: z.string().optional(),
  status: z.enum(["em_andamento", "concluido"], {
    error: "Selecione um status válido.",
  }),
});

export type EventoInput = z.infer<typeof eventoSchema>;
