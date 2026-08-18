"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { manejoSchema, produtosArraySchema } from "@/lib/validations/manejo";
import { enviarEmailManejoPendente } from "@/lib/email";
import { TIPO_MANEJO_LABEL } from "@/lib/constants";
import type { FormState } from "./clientes";

function parseManejo(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parcelaIds = formData
    .getAll("parcelaIds")
    .filter((v): v is string => typeof v === "string" && v.length > 0);
  return manejoSchema.safeParse({ ...raw, parcelaIds });
}

function parseProdutos(formData: FormData) {
  const json = formData.get("produtosJson");
  let raw: unknown = [];
  if (typeof json === "string" && json.length > 0) {
    try {
      raw = JSON.parse(json);
    } catch {
      raw = [];
    }
  }
  return produtosArraySchema.safeParse(raw);
}

export async function createManejo(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  const parsed = parseManejo(formData);
  if (!parsed.success) {
    return {
      error: "Verifique os campos destacados.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const produtosParsed = parseProdutos(formData);
  if (!produtosParsed.success) {
    return { error: "Verifique os produtos informados." };
  }

  const { eventoId, data: dataManejo, parcelaIds, statusInicial, ...rest } =
    parsed.data;
  const status = statusInicial === "realizado" ? "concluido" : "pendente";

  const manejoCriado = await db.manejo.create({
    data: {
      eventoId,
      data: dataManejo ? new Date(dataManejo) : new Date(),
      ...rest,
      status,
      parcelas:
        parcelaIds.length > 0
          ? { connect: parcelaIds.map((id) => ({ id })) }
          : undefined,
      produtos:
        parsed.data.tipo === "aplicacao"
          ? { create: produtosParsed.data }
          : undefined,
    },
    include: { evento: { include: { cliente: true } } },
  });

  if (status === "pendente") {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    await enviarEmailManejoPendente({
      clienteNome: manejoCriado.evento.cliente.nome,
      clienteEmail: manejoCriado.evento.cliente.email,
      eventoNome: manejoCriado.evento.nome,
      manejoTitulo: TIPO_MANEJO_LABEL[manejoCriado.tipo],
      manejoUrl: `${baseUrl}/manejos/${manejoCriado.id}`,
    });
  }

  revalidatePath("/manejos");
  redirect("/manejos");
}

export async function updateManejo(
  manejoId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireAdmin();

  const atual = await db.manejo.findUnique({ where: { id: manejoId } });
  if (!atual) {
    return { error: "Manejo não encontrado." };
  }
  if (atual.status !== "pendente") {
    return {
      error:
        "Esse manejo já foi avaliado pelo cliente e não pode mais ser editado.",
    };
  }

  const parsed = parseManejo(formData);
  if (!parsed.success) {
    return {
      error: "Verifique os campos destacados.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const produtosParsed = parseProdutos(formData);
  if (!produtosParsed.success) {
    return { error: "Verifique os produtos informados." };
  }

  const { eventoId, data: dataManejo, parcelaIds, statusInicial: _ignorado, ...rest } =
    parsed.data;

  await db.$transaction([
    db.produto.deleteMany({ where: { manejoId } }),
    db.manejo.update({
      where: { id: manejoId },
      data: {
        eventoId,
        data: dataManejo ? new Date(dataManejo) : new Date(),
        ...rest,
        parcelas: { set: parcelaIds.map((id) => ({ id })) },
        produtos:
          parsed.data.tipo === "aplicacao"
            ? { create: produtosParsed.data }
            : undefined,
      },
    }),
  ]);

  revalidatePath("/manejos");
  revalidatePath(`/manejos/${manejoId}`);
  redirect(`/manejos/${manejoId}`);
}

export async function concluirManejo(formData: FormData) {
  await requireAdmin();
  const manejoId = formData.get("manejoId") as string;

  const manejo = await db.manejo.findUnique({ where: { id: manejoId } });
  if (!manejo || manejo.status !== "aprovado") return;

  await db.manejo.update({ where: { id: manejoId }, data: { status: "concluido" } });
  revalidatePath(`/manejos/${manejoId}`);
  revalidatePath("/manejos");
  revalidatePath("/dashboard");
}
