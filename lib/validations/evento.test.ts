import { describe, it, expect } from "vitest";
import { eventoSchema } from "./evento";

const base = {
  nome: "Show Rural Coopavel 2026",
  clienteId: "cliente-1",
  local: "Cascavel - PR",
  dataInicio: "2026-02-02",
  status: "em_andamento",
};

describe("eventoSchema", () => {
  it("aceita um evento válido sem data de fim", () => {
    expect(eventoSchema.safeParse(base).success).toBe(true);
  });

  it("aceita status concluido", () => {
    const resultado = eventoSchema.safeParse({ ...base, status: "concluido" });
    expect(resultado.success).toBe(true);
  });

  it("rejeita status desconhecido", () => {
    const resultado = eventoSchema.safeParse({ ...base, status: "cancelado" });
    expect(resultado.success).toBe(false);
  });

  it("exige clienteId", () => {
    const resultado = eventoSchema.safeParse({ ...base, clienteId: "" });
    expect(resultado.success).toBe(false);
  });

  it("exige data de início", () => {
    const resultado = eventoSchema.safeParse({ ...base, dataInicio: "" });
    expect(resultado.success).toBe(false);
  });
});
