import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteVistoria } from "@/lib/actions/vistorias";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  ESTAGIO_CULTURA_LABEL,
  NIVEL_VISTORIA_LABEL,
  NIVEL_VISTORIA_CLASSES,
} from "@/lib/constants";

function formatarData(data: Date) {
  return new Intl.DateTimeFormat("pt-BR").format(data);
}

const CATEGORIAS_AVALIACAO = [
  { campo: "nivelPragas", label: "Pragas" },
  { campo: "nivelDoencas", label: "Doenças" },
  { campo: "nivelPlantasDaninhas", label: "Plantas daninhas" },
  { campo: "nivelEstresseHidrico", label: "Estresse hídrico / clima" },
] as const;

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
      parcelasSugeridas: { select: { id: true, nome: true } },
    },
  });

  if (!vistoria) notFound();
  if (session.role === "cliente" && vistoria.evento.clienteId !== session.clienteId) {
    notFound();
  }

  const categoriasAvaliadas = CATEGORIAS_AVALIACAO.filter(
    ({ campo }) => vistoria[campo]
  );
  const temSugestaoManejo =
    vistoria.sugestaoProduto ||
    vistoria.sugestaoDosagem ||
    vistoria.parcelasSugeridas.length > 0;

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
        {vistoria.estagioCultura &&
          ` · Estágio: ${ESTAGIO_CULTURA_LABEL[vistoria.estagioCultura]}`}
      </p>

      {categoriasAvaliadas.length > 0 && (
        <div className="mt-6 rounded-2xl border border-arvo-terracota/10 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-arvo-grafite">
            Avaliação do campo
          </h2>
          <div className="flex flex-wrap gap-2">
            {categoriasAvaliadas.map(({ campo, label }) => {
              const nivel = vistoria[campo] as string;
              return (
                <div key={campo} className="flex items-center gap-2 text-sm">
                  <span className="text-arvo-grafite/60">{label}:</span>
                  <StatusBadge
                    label={NIVEL_VISTORIA_LABEL[nivel]}
                    className={NIVEL_VISTORIA_CLASSES[nivel]}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

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

      {temSugestaoManejo && (
        <div className="mt-6 rounded-2xl border border-arvo-terracota/10 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-arvo-grafite">
            Sugestão de manejo
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {vistoria.sugestaoProduto && (
              <div>
                <p className="text-xs text-arvo-grafite/50">Produto</p>
                <p className="text-sm text-arvo-grafite">
                  {vistoria.sugestaoProduto}
                </p>
              </div>
            )}
            {vistoria.sugestaoDosagem && (
              <div>
                <p className="text-xs text-arvo-grafite/50">Dosagem</p>
                <p className="text-sm text-arvo-grafite">
                  {vistoria.sugestaoDosagem}
                </p>
              </div>
            )}
          </div>
          {vistoria.parcelasSugeridas.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-arvo-grafite/50">Parcelas</p>
              <p className="text-sm text-arvo-grafite">
                {vistoria.parcelasSugeridas.map((p) => p.nome).join(", ")}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
