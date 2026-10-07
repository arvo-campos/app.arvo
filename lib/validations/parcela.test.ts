import { describe, it, expect } from "vitest";
import { parcelaSchema } from "./parcela";

describe("parcelaSchema", () => {
  it("aceita uma parcela com medidas e fileira vindas como string (FormData)", () => {
    const resultado = parcelaSchema.safeParse({
      eventoId: "evento-1",
      nome: "GH 2459",
      largura: "4,5",
      comprimento: "10",
      fileira: "1",
      tipo: "parcela",
    });
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data.largura).toBe(4.5);
      expect(resultado.data.comprimento).toBe(10);
      expect(resultado.data.fileira).toBe(1);
    }
  });

  it("aceita 'nova' como fileira", () => {
    const resultado = parcelaSchema.safeParse({
      eventoId: "evento-1",
      nome: "GH 2459",
      fileira: "nova",
      tipo: "parcela",
    });
    expect(resultado.success).toBe(true);
    if (resultado.success) expect(resultado.data.fileira).toBe("nova");
  });

  it("campos opcionais vazios viram undefined em vez de erro", () => {
    const resultado = parcelaSchema.safeParse({
      eventoId: "evento-1",
      nome: "Corredor 1",
      linhas: "",
      largura: "",
      comprimento: "",
      fileira: "3",
      tipo: "corredor",
    });
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data.linhas).toBeUndefined();
      expect(resultado.data.largura).toBeUndefined();
      expect(resultado.data.comprimento).toBeUndefined();
    }
  });

  it("rejeita medida que não é número ou é zero", () => {
    const base = { eventoId: "e", nome: "X", fileira: "0", tipo: "parcela" };
    expect(parcelaSchema.safeParse({ ...base, largura: "abc" }).success).toBe(false);
    expect(parcelaSchema.safeParse({ ...base, comprimento: "0" }).success).toBe(false);
  });

  it("rejeita tipo inválido", () => {
    const resultado = parcelaSchema.safeParse({
      eventoId: "evento-1",
      nome: "X",
      fileira: "0",
      tipo: "estrada",
    });
    expect(resultado.success).toBe(false);
  });
});
