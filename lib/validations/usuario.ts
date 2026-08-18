import { z } from "zod";

export const usuarioClienteSchema = z.object({
  nome: z.string().min(1, "Informe o nome."),
  email: z.email("Informe um e-mail válido."),
  senha: z.string().min(6, "A senha precisa ter ao menos 6 caracteres."),
});

export type UsuarioClienteInput = z.infer<typeof usuarioClienteSchema>;
