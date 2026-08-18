import { db } from "@/lib/db";
import { ManejoForm } from "@/components/manejos/ManejoForm";

export default async function NovoManejoPage(props: PageProps<"/manejos/novo">) {
  const searchParams = await props.searchParams;
  const eventoIdInicial =
    typeof searchParams.eventoId === "string" ? searchParams.eventoId : undefined;

  const [eventos, parcelas] = await Promise.all([
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

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-arvo-grafite">
        Novo manejo
      </h1>
      <p className="mt-1 text-sm text-arvo-grafite/60">
        Registre um plantio ou uma aplicação realizada em campo.
      </p>
      <div className="mt-6">
        <ManejoForm
          eventos={eventos}
          parcelas={parcelas}
          eventoIdInicial={eventoIdInicial}
        />
      </div>
    </div>
  );
}
