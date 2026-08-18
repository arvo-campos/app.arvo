import { describe, it, expect } from "vitest";
import { usuarioClienteSchema } from "./usuario";

describe("usuarioClienteSchema", () => {
  it("aceita dados válidos", () => {
    const resultado = usuarioClienteSchema.safeParse({
      nome: "Fernanda Lopes",
      email: "fernanda@nk.com.br",
      senha: "segredo123",
    });
    expect(resultado.success).toBe(true);
  });

  it("rejeita senha curta", () => {
    const resultado = usuarioClienteSchema.safeParse({
      nome: "X",
      email: "a@b.com",
      senha: "123",
    });
    expect(resultado.success).toBe(false);
  });
});
