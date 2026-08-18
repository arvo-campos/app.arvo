import { z } from "zod";

export const senhaSchema = z
  .string()
  .min(6, "A senha precisa ter ao menos 6 caracteres.");

export const usuarioClienteSchema = z.object({
  nome: z.string().min(1, "Informe o nome."),
  email: z.email("Informe um e-mail válido."),
  senha: senhaSchema,
});

export const resetSenhaSchema = z.object({
  senha: senhaSchema,
});

export type UsuarioClienteInput = z.infer<typeof usuarioClienteSchema>;
