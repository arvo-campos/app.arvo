"use server";

import { revalidatePath } from "next/cache";
import { requireCliente } from "@/lib/auth";
import { db } from "@/lib/db";
import type { FormState } from "./clientes";

export async function registrarAprovacao(
  manejoId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireCliente();

  const acao = formData.get("acao");
  const observacao = ((formData.get("observacao") as string) || "").trim();

  if (acao !== "aprovado" && acao !== "reprovado") {
    return { error: "Ação inválida." };
  }
  if (acao === "reprovado" && !observacao) {
    return {
      error: "Informe o motivo da reprovação.",
      fieldErrors: { observacao: ["Obrigatório para reprovar."] },
    };
  }

  const manejo = await db.manejo.findUnique({
    where: { id: manejoId },
    include: { evento: true },
  });

  if (!manejo || manejo.evento.clienteId !== session.clienteId) {
    return { error: "Manejo não encontrado." };
  }
  if (manejo.status !== "pendente") {
    return { error: "Este manejo já foi avaliado." };
  }

  await db.$transaction([
    db.manejo.update({ where: { id: manejoId }, data: { status: acao } }),
    db.historicoAprovacao.create({
      data: {
        manejoId,
        usuarioId: session.userId,
        acao,
        observacao: observacao || null,
      },
    }),
  ]);

  revalidatePath(`/manejos/${manejoId}`);
  revalidatePath("/meus-eventos");
  revalidatePath(`/meus-eventos/${manejo.eventoId}`);
  revalidatePath("/dashboard");
  revalidatePath("/manejos");
  return undefined;
}
