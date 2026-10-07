import { z } from "zod";

// Campo vazio vira undefined (opcional) em vez de erro.
const vazioParaUndefined = (v: unknown) => (v === "" || v == null ? undefined : v);

// Medida em metros: aceita "4,5" ou "4.5" (no celular o teclado costuma ter só vírgula).
const medidaEmMetros = (nomeCampo: string) =>
  z.preprocess(
    (v) => {
      const valor = vazioParaUndefined(v);
      return typeof valor === "string" ? valor.trim().replace(",", ".") : valor;
    },
    z.coerce
      .number({ error: `${nomeCampo} precisa ser um número.` })
      .positive(`${nomeCampo} precisa ser maior que zero.`)
      .max(10000, `${nomeCampo} parece grande demais.`)
      .optional()
  );

const camposParcela = {
  nome: z.string().trim().min(1, "Informe o nome da parcela."),
  tipo: z.enum(["parcela", "corredor", "rua"], {
    error: "Selecione um tipo válido.",
  }),
  largura: medidaEmMetros("A largura"),
  comprimento: medidaEmMetros("O comprimento"),
  linhas: z.preprocess(vazioParaUndefined, z.coerce.number().int().positive().optional()),
};

export const parcelaSchema = z.object({
  eventoId: z.string().min(1),
  ...camposParcela,
  // Número da fileira (0 = primeira) ou "nova" pra começar uma fileira no fim.
  fileira: z.union([z.literal("nova"), z.coerce.number().int().min(0)], {
    error: "Escolha a fileira.",
  }),
});

export const atualizarParcelaSchema = z.object({
  parcelaId: z.string().min(1),
  ...camposParcela,
});

export type ParcelaInput = z.infer<typeof parcelaSchema>;
