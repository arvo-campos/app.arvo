import { z } from "zod";

export const clienteSchema = z.object({
  nome: z.string().min(1, "Informe o nome do cliente."),
  responsavel: z.string().min(1, "Informe o responsável."),
  email: z.email("Informe um e-mail válido."),
  telefone: z.string().optional(),
});

export type ClienteInput = z.infer<typeof clienteSchema>;
