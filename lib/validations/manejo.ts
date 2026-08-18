import { z } from "zod";

const optionalNumber = () =>
  z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.coerce.number().optional()
  );

const optionalText = () =>
  z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.string().optional()
  );

export const produtoSchema = z.object({
  numTrat: z.coerce.number().int("Informe um número inteiro."),
  nome: z.string().min(1, "Informe o nome do produto."),
  ingrediente: z.string().min(1, "Informe o ingrediente ativo."),
  doseHa: z.string().min(1, "Informe a dose por hectare."),
});

export const produtosArraySchema = z.array(produtoSchema);

// Só o evento é exigido (é preciso saber a quem o manejo pertence). Todo o
// resto é opcional de propósito: quem preenche em campo nem sempre tem a
// informação completa na hora, e o formulário não deve travar por isso.
export const manejoSchema = z.object({
  eventoId: z.string().min(1, "Selecione um evento."),
  parcelaIds: z.array(z.string()).default([]),
  tipo: z.enum(["plantio", "aplicacao", "montagem", "organizacao"], {
    error: "Selecione o tipo de manejo.",
  }),
  statusInicial: z.enum(["a_realizar", "realizado"]).default("a_realizar"),
  responsavel: optionalText(),
  acompanhamento: optionalText(),
  data: optionalText(),
  horaInicio: optionalText(),
  horaFim: optionalText(),

  tempInicio: optionalNumber(),
  tempFim: optionalNumber(),
  umidInicio: optionalNumber(),
  umidFim: optionalNumber(),
  ventoInicio: optionalNumber(),
  ventoFim: optionalNumber(),
  ultimaChuva: optionalText(),

  equipamento: optionalText(),
  qtdLinhas: optionalNumber(),
  espLinhas: optionalNumber(),
  profundidade: optionalNumber(),
  sementesPorMetro: optionalText(),

  tipoAplicacao: optionalText(),
  ponta: optionalText(),
  volumePonta: optionalText(),
  numPontas: optionalNumber(),
  espPontas: optionalNumber(),
  altBarra: optionalNumber(),
  pressao: optionalNumber(),
  volCalda: optionalNumber(),
  velocidade: optionalNumber(),

  anotacoes: optionalText(),
});

export type ManejoInput = z.infer<typeof manejoSchema>;
export type ProdutoInput = z.infer<typeof produtoSchema>;
