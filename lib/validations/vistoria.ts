import { z } from "zod";

const optionalText = () =>
  z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.string().optional()
  );

export const vistoriaSchema = z
  .object({
    eventoId: z.string().min(1, "Selecione um evento."),
    data: z.string().min(1, "Informe a data da vistoria."),
    condicoes: optionalText(),
    observacoes: optionalText(),
    solicitaIntervencao: z.preprocess(
      (v) => v === "on" || v === "true" || v === true,
      z.boolean()
    ),
    intervencaoDescricao: optionalText(),
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
