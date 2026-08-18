import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCliente } from "@/lib/auth";
import { db } from "@/lib/db";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LinkButton } from "@/components/ui/Button";
import { ContadorD0 } from "@/components/eventos/ContadorD0";
import { CroquiGrid } from "@/components/eventos/CroquiGrid";
import {
  STATUS_MANEJO_LABEL,
  STATUS_MANEJO_CLASSES,
  STATUS_EVENTO_LABEL,
  TIPO_MANEJO_LABEL,
} from "@/lib/constants";

function formatarData(data: Date) {
  return new Intl.DateTimeFormat("pt-BR").format(data);
}

export default async function MeuEventoDetalhePage(
  props: PageProps<"/meus-eventos/[id]">
) {
  const { id } = await props.params;
  const session = await requireCliente();

  const evento = await db.evento.findUnique({
    where: { id },
    include: {
      manejos: { orderBy: { data: "desc" } },
      parcelas: { orderBy: [{ posY: "asc" }, { posX: "asc" }] },
    },
  });

  if (!evento || evento.clienteId !== session.clienteId) notFound();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <p className="text-xs font-medium text-arvo-terracota uppercase">
        {STATUS_EVENTO_LABEL[evento.status]}
      </p>
      <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-bold text-arvo-grafite">
          {evento.nome}
        </h1>
        <LinkButton
          href={`/api/eventos/${evento.id}/pdf`}
          target="_blank"
          rel="noopener noreferrer"
          variant="secondary"
          className="self-start"
        >
          Baixar relatório PDF
        </LinkButton>
      </div>
      <p className="mt-1 text-sm text-arvo-grafite/60">{evento.local}</p>
      <div className="mt-3">
        <ContadorD0 dataInicio={evento.dataInicio} status={evento.status} />
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-arvo-terracota/10 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-arvo-terracota/10 bg-arvo-bg/50 text-left text-xs text-arvo-grafite/60 uppercase">
              <th className="px-5 py-3 font-medium">Tipo</th>
              <th className="px-5 py-3 font-medium">Data</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {evento.manejos.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-6 text-center text-arvo-grafite/50">
                  Nenhum manejo registrado neste evento ainda.
                </td>
              </tr>
            )}
            {evento.manejos.map((manejo) => (
              <tr
                key={manejo.id}
                className="border-b border-arvo-terracota/5 last:border-0"
              >
                <td className="px-5 py-3 font-medium text-arvo-grafite">
                  {TIPO_MANEJO_LABEL[manejo.tipo]}
                </td>
                <td className="px-5 py-3 text-arvo-grafite/70">
                  {formatarData(manejo.data)}
                </td>
                <td className="px-5 py-3">
                  <StatusBadge
                    label={STATUS_MANEJO_LABEL[manejo.status]}
                    className={STATUS_MANEJO_CLASSES[manejo.status]}
                  />
                </td>
                <td className="px-5 py-3 text-right">
                  <Link
                    href={`/manejos/${manejo.id}`}
                    className="text-sm font-medium text-arvo-terracota hover:underline"
                  >
                    {manejo.status === "pendente" ? "Avaliar" : "Ver"}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-10">
        <h2 className="font-display text-lg font-bold text-arvo-grafite">
          Croqui
        </h2>
        <p className="mt-1 text-sm text-arvo-grafite/60">
          Layout das parcelas, corredores e ruas do evento.
        </p>
        <div className="mt-4">
          <CroquiGrid
            eventoId={evento.id}
            parcelas={evento.parcelas}
            podeEditar={false}
          />
        </div>
      </div>
    </div>
  );
}
