import { describe, it, expect } from "vitest";
import { manejoSchema, produtoSchema, produtosArraySchema } from "./manejo";

const base = {
  eventoId: "evento-1",
  tipo: "plantio",
};

describe("manejoSchema", () => {
  it("aceita um manejo só com o evento e o tipo — nenhum outro campo é obrigatório", () => {
    const resultado = manejoSchema.safeParse(base);
    expect(resultado.success).toBe(true);
  });

  it("sem eventoId é rejeitado", () => {
    const resultado = manejoSchema.safeParse({ tipo: "plantio" });
    expect(resultado.success).toBe(false);
  });

  it("sem tipo é rejeitado", () => {
    const resultado = manejoSchema.safeParse({ eventoId: "evento-1" });
    expect(resultado.success).toBe(false);
  });

  it("plantio aceito com equipamento preenchido", () => {
    const resultado = manejoSchema.safeParse({
      ...base,
      equipamento: "Semeadora Pneumática 9 linhas",
    });
    expect(resultado.success).toBe(true);
  });

  it("aplicação aceita mesmo sem tipoAplicacao preenchido", () => {
    const resultado = manejoSchema.safeParse({ ...base, tipo: "aplicacao" });
    expect(resultado.success).toBe(true);
  });

  it("aplicação com tipoAplicacao é aceita", () => {
    const resultado = manejoSchema.safeParse({
      ...base,
      tipo: "aplicacao",
      tipoAplicacao: "Herbicida em pós-emergência",
    });
    expect(resultado.success).toBe(true);
  });

  it("campos numéricos opcionais vazios (como vêm de um <input> em branco) não quebram a validação", () => {
    const resultado = manejoSchema.safeParse({
      ...base,
      equipamento: "Semeadora",
      tempInicio: "",
      qtdLinhas: "",
    });
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data.tempInicio).toBeUndefined();
      expect(resultado.data.qtdLinhas).toBeUndefined();
    }
  });

  it("campos numéricos preenchidos (string do formulário) são convertidos para number", () => {
    const resultado = manejoSchema.safeParse({
      ...base,
      equipamento: "Semeadora",
      tempInicio: "24.5",
      qtdLinhas: "9",
    });
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data.tempInicio).toBe(24.5);
      expect(resultado.data.qtdLinhas).toBe(9);
    }
  });

  it("tipo inválido é rejeitado", () => {
    const resultado = manejoSchema.safeParse({ ...base, tipo: "colheita" });
    expect(resultado.success).toBe(false);
  });

  it("tipos antigos (irrigação, cerca, sombrite, desfolha) não são mais aceitos isoladamente", () => {
    for (const tipoAntigo of ["irrigacao", "cerca", "sombrite", "desfolha", "outro"]) {
      const resultado = manejoSchema.safeParse({ ...base, tipo: tipoAntigo });
      expect(resultado.success).toBe(false);
    }
  });

  it("montagem é aceita sem exigir equipamento", () => {
    const resultado = manejoSchema.safeParse({ ...base, tipo: "montagem" });
    expect(resultado.success).toBe(true);
  });

  it("organização é aceita sem exigir equipamento", () => {
    const resultado = manejoSchema.safeParse({ ...base, tipo: "organizacao" });
    expect(resultado.success).toBe(true);
  });
});

describe("produtoSchema / produtosArraySchema", () => {
  it("aceita um produto válido", () => {
    const resultado = produtoSchema.safeParse({
      numTrat: "1",
      nome: "Produto X",
      ingrediente: "Glifosato",
      doseHa: "2,5 L/ha",
    });
    expect(resultado.success).toBe(true);
  });

  it("óleo e adjuvante viram produtos próprios na lista, não campos à parte", () => {
    const resultado = produtosArraySchema.safeParse([
      {
        numTrat: 1,
        nome: "Produto X",
        ingrediente: "Glifosato",
        doseHa: "2,5 L/ha",
      },
      {
        numTrat: 2,
        nome: "Óleo mineral",
        ingrediente: "Óleo mineral",
        doseHa: "0,5 L/ha",
      },
    ]);
    expect(resultado.success).toBe(true);
    if (resultado.success) {
      expect(resultado.data).toHaveLength(2);
    }
  });

  it("rejeita produto sem nome", () => {
    const resultado = produtoSchema.safeParse({
      numTrat: 1,
      nome: "",
      ingrediente: "Glifosato",
      doseHa: "2,5 L/ha",
    });
    expect(resultado.success).toBe(false);
  });
});
