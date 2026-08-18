import { describe, it, expect } from "vitest";
import { clienteSchema } from "./cliente";

describe("clienteSchema", () => {
  it("aceita um cliente válido", () => {
    const resultado = clienteSchema.safeParse({
      nome: "Golden Harvest",
      responsavel: "Marcos Vinícius",
      email: "contato@goldenharvest.com.br",
      telefone: "(45) 99999-0000",
    });
    expect(resultado.success).toBe(true);
  });

  it("telefone é opcional", () => {
    const resultado = clienteSchema.safeParse({
      nome: "GDM",
      responsavel: "Ricardo Alves",
      email: "contato@gdm.com.br",
    });
    expect(resultado.success).toBe(true);
  });

  it("rejeita nome vazio", () => {
    const resultado = clienteSchema.safeParse({
      nome: "",
      responsavel: "X",
      email: "a@b.com",
    });
    expect(resultado.success).toBe(false);
  });

  it("rejeita e-mail inválido", () => {
    const resultado = clienteSchema.safeParse({
      nome: "X",
      responsavel: "Y",
      email: "nao-e-email",
    });
    expect(resultado.success).toBe(false);
  });
});
