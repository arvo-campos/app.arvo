import { z } from "zod";

const optionalText = () =>
  z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.string().optional()
  );

const optionalEnum = <T extends readonly [string, ...string[]]>(valores: T) =>
  z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.enum(valores).optional()
  );

const NIVEIS_VISTORIA = ["nao_observado", "leve", "moderado", "severo"] as const;

export const vistoriaSchema = z
  .object({
    eventoId: z.string().min(1, "Selecione um evento."),
    data: z.string().min(1, "Informe a data da vistoria."),

    estagioCultura: optionalEnum([
      "emergencia",
      "vegetativo",
      "floracao",
      "enchimento_graos",
      "maturacao",
      "colhido",
    ]),
    nivelPragas: optionalEnum(NIVEIS_VISTORIA),
    nivelDoencas: optionalEnum(NIVEIS_VISTORIA),
    nivelPlantasDaninhas: optionalEnum(NIVEIS_VISTORIA),
    nivelEstresseHidrico: optionalEnum(NIVEIS_VISTORIA),

    condicoes: optionalText(),
    observacoes: optionalText(),
    solicitaIntervencao: z.preprocess(
      (v) => v === "on" || v === "true" || v === true,
      z.boolean()
    ),
    intervencaoDescricao: optionalText(),

    // Sugestão de manejo — opcional por completo, quem faz a vistoria pode
    // não ter uma sugestão pronta na hora.
    sugestaoProduto: optionalText(),
    sugestaoDosagem: optionalText(),
    parcelasSugeridasIds: z.array(z.string()).default([]),
  })
  .superRefine((data, ctx) => {
    if (data.solicitaIntervencao && !data.intervencaoDescricao) {
      ctx.addIssue({
        code: "custom",
        path: ["intervencaoDescricao"],
        message: "Descreva a intervenção solicitada.",
      });
    }
  });

export type VistoriaInput = z.infer<typeof vistoriaSchema>;
