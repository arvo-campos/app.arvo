import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { ManejoForm } from "@/components/manejos/ManejoForm";
import { TIPO_MANEJO_LABEL } from "@/lib/constants";

export default async function EditarManejoPage(
  props: PageProps<"/manejos/[id]/editar">
) {
  await requireAdmin();
  const { id } = await props.params;

  const [manejo, eventos, parcelas] = await Promise.all([
    db.manejo.findUnique({
      where: { id },
      include: { produtos: true, parcelas: { select: { id: true } } },
    }),
    db.evento.findMany({
      orderBy: { dataInicio: "desc" },
      include: { cliente: { select: { nome: true } } },
    }),
    db.parcela.findMany({
      where: { tipo: "parcela" },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true, eventoId: true },
    }),
  ]);

  if (!manejo) notFound();
  if (manejo.status !== "pendente") {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          Esse manejo já foi avaliado pelo cliente e não pode mais ser
          editado.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-arvo-grafite">
        Editar manejo
      </h1>
      <p className="mt-1 text-sm text-arvo-grafite/60">
        {TIPO_MANEJO_LABEL[manejo.tipo as keyof typeof TIPO_MANEJO_LABEL]}
      </p>
      <div className="mt-6">
        <ManejoForm eventos={eventos} parcelas={parcelas} manejo={manejo} />
      </div>
    </div>
  );
}
