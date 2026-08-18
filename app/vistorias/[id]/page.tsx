import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { FotosVistoriaGaleria } from "@/components/vistorias/FotosVistoriaGaleria";
import { deleteVistoria } from "@/lib/actions/vistorias";

function formatarData(data: Date) {
  return new Intl.DateTimeFormat("pt-BR").format(data);
}

export default async function VistoriaDetailPage(
  props: PageProps<"/vistorias/[id]">
) {
  const { id } = await props.params;
  const session = await requireSession();

  const vistoria = await db.vistoria.findUnique({
    where: { id },
    include: {
      evento: { include: { cliente: true } },
      autor: true,
      fotos: { include: { parcela: true }, orderBy: { criadoEm: "asc" } },
    },
  });

  if (!vistoria) notFound();
  if (session.role === "cliente" && vistoria.evento.clienteId !== session.clienteId) {
    notFound();
  }

  const podeEditarFotos =
    session.role === "admin" || vistoria.autorId === session.userId;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-xs font-medium text-arvo-terracota uppercase">
        {vistoria.evento.cliente.nome} · {vistoria.evento.nome}
      </p>
      <div className="mt-1 flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-arvo-grafite">
          Vistoria — {formatarData(vistoria.data)}
        </h1>
        <div className="flex items-center gap-3">
          <a
            href={`/api/vistorias/${vistoria.id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-arvo-terracota hover:underline"
          >
            Baixar PDF
          </a>
          {session.role === "admin" && (
            <form action={deleteVistoria}>
              <input type="hidden" name="vistoriaId" value={vistoria.id} />
              <button
                type="submit"
                className="text-sm font-medium text-red-600 hover:underline"
              >
                Excluir
              </button>
            </form>
          )}
        </div>
      </div>
      <p className="text-sm text-arvo-grafite/60">
        Registrada por {vistoria.autor.nome}
      </p>

      {vistoria.solicitaIntervencao && (
        <div className="mt-6 rounded-2xl border border-arvo-terracota/40 bg-arvo-terracota/5 p-5">
          <h2 className="text-sm font-semibold text-arvo-terracota">
            Intervenção solicitada
          </h2>
          <p className="mt-2 text-sm text-arvo-grafite/80">
            {vistoria.intervencaoDescricao}
          </p>
        </div>
      )}

      {(vistoria.condicoes || vistoria.observacoes) && (
        <div className="mt-6 rounded-2xl border border-arvo-terracota/10 bg-white p-5 shadow-sm">
          {vistoria.condicoes && (
            <div className="mb-4">
              <h2 className="mb-1 text-sm font-semibold text-arvo-grafite">
                Condições do campo
              </h2>
              <p className="text-sm text-arvo-grafite/80">{vistoria.condicoes}</p>
            </div>
          )}
          {vistoria.observacoes && (
            <div>
              <h2 className="mb-1 text-sm font-semibold text-arvo-grafite">
                Observações
              </h2>
              <p className="text-sm text-arvo-grafite/80">{vistoria.observacoes}</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-6">
        <FotosVistoriaGaleria
          vistoriaId={vistoria.id}
          fotos={vistoria.fotos}
          podeEditar={podeEditarFotos}
        />
      </div>
    </div>
  );
}
