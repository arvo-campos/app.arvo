import { describe, it, expect } from "vitest";
import {
  agruparEmFileiras,
  formatarMedidas,
  moverNaGrade,
  posicoesDaGrade,
  removerDaGrade,
} from "./croqui";

const grade = [
  ["a", "b", "c"],
  ["d", "e"],
];

describe("agruparEmFileiras", () => {
  it("agrupa por posY e ordena por posX, ignorando buracos da grade antiga", () => {
    const fileiras = agruparEmFileiras([
      { id: "e", posX: 4, posY: 7 },
      { id: "a", posX: 0, posY: 2 },
      { id: "d", posX: 1, posY: 7 },
      { id: "b", posX: 3, posY: 2 },
    ]);
    expect(fileiras).toEqual([
      ["a", "b"],
      ["d", "e"],
    ]);
  });
});

describe("moverNaGrade", () => {
  it("move pra direita dentro da fileira", () => {
    expect(moverNaGrade(grade, "a", 0, 1)).toEqual([["b", "a", "c"], ["d", "e"]]);
  });

  it("move pra esquerda dentro da fileira", () => {
    expect(moverNaGrade(grade, "c", 0, 1)).toEqual([["a", "c", "b"], ["d", "e"]]);
  });

  it("move pra outra fileira na posição pedida", () => {
    expect(moverNaGrade(grade, "b", 1, 1)).toEqual([["a", "c"], ["d", "b", "e"]]);
  });

  it("posição além do fim vai pro fim da fileira", () => {
    expect(moverNaGrade(grade, "a", 1, 99)).toEqual([["b", "c"], ["d", "e", "a"]]);
  });

  it("fileira igual ao total cria uma fileira nova no fim", () => {
    expect(moverNaGrade(grade, "a", 2, 0)).toEqual([["b", "c"], ["d", "e"], ["a"]]);
  });

  it("remove fileiras que ficam vazias", () => {
    const resultado = moverNaGrade([["a"], ["b"]], "a", 1, 0);
    expect(resultado).toEqual([["a", "b"]]);
  });

  it("ignora destino inválido ou parcela inexistente", () => {
    expect(moverNaGrade(grade, "a", 5, 0)).toBe(grade);
    expect(moverNaGrade(grade, "zz", 0, 0)).toBe(grade);
  });

  it("não altera a grade original", () => {
    moverNaGrade(grade, "a", 1, 0);
    expect(grade).toEqual([["a", "b", "c"], ["d", "e"]]);
  });
});

describe("removerDaGrade / posicoesDaGrade", () => {
  it("fecha o buraco e renumera posições consecutivas", () => {
    const posicoes = posicoesDaGrade(removerDaGrade([["a"], ["b", "c"]], "a"));
    expect(posicoes.get("b")).toEqual({ posX: 0, posY: 0 });
    expect(posicoes.get("c")).toEqual({ posX: 1, posY: 0 });
    expect(posicoes.has("a")).toBe(false);
  });
});

describe("formatarMedidas", () => {
  it("formata com vírgula decimal", () => {
    expect(formatarMedidas(4.5, 10)).toBe("4,5 × 10 m");
    expect(formatarMedidas(null, null)).toBeNull();
  });
});
