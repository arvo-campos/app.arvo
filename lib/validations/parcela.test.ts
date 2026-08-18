import { describe, it, expect } from "vitest";
import { parcelaSchema } from "./parcela";

describe("parcelaSchema", () => {
  it("aceita uma parcela válida com posições numéricas vindas como string (FormData)", () => {
    const resultado = parcelaSchema.safeParse({
      eventoId: "evento-1",
      nome: "GH 2459",
      posX: "3",
      posY: "1",
      tipo: "parcela",
    });
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data.posX).toBe(3);
      expect(resultado.data.posY).toBe(1);
    }
  });

  it("linhas vazio vira undefined em vez de erro", () => {
    const resultado = parcelaSchema.safeParse({
      eventoId: "evento-1",
      nome: "Corredor 1",
      linhas: "",
      posX: "0",
      posY: "3",
      tipo: "corredor",
    });
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data.linhas).toBeUndefined();
    }
  });

  it("rejeita tipo inválido", () => {
    const resultado = parcelaSchema.safeParse({
      eventoId: "evento-1",
      nome: "X",
      posX: "0",
      posY: "0",
      tipo: "estrada",
    });
    expect(resultado.success).toBe(false);
  });
});
