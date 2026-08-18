import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button, LinkButton } from "@/components/ui/Button";
import { AprovacaoActions } from "@/components/manejos/AprovacaoActions";
import { ComentariosThread } from "@/components/manejos/ComentariosThread";
import { FotosGaleria } from "@/components/manejos/FotosGaleria";
import { concluirManejo } from "@/lib/actions/manejos";
import {
  STATUS_MANEJO_LABEL,
  STATUS_MANEJO_CLASSES,
  TIPO_MANEJO_LABEL,
} from "@/lib/constants";

function formatarData(data: Date) {
  return new Intl.DateTimeFormat("pt-BR").format(data);
}

function formatarDataHora(data: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(data);
}

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div>
      <p className="text-xs text-arvo-grafite/50">{label}</p>
      <p className="text-sm text-arvo-grafite">{value}</p>
    </div>
  );
}

export default async function ManejoDetailPage(props: PageProps<"/manejos/[id]">) {
  const { id } = await props.params;
  const session = await requireSession();

  const manejo = await db.manejo.findUnique({
    where: { id },
    include: {
      evento: { include: { cliente: true } },
      parcelas: { select: { id: true, nome: true } },
      produtos: true,
      fotos: { orderBy: { criadoEm: "asc" } },
      historico: { include: { usuario: true }, orderBy: { criadoEm: "asc" } },
      comentarios: { include: { usuario: true }, orderBy: { criadoEm: "asc" } },
    },
  });

  if (!manejo) notFound();
  if (session.role === "cliente" && manejo.evento.clienteId !== session.clienteId) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <p className="text-xs font-medium text-arvo-terracota uppercase">
        {manejo.evento.cliente.nome} · {manejo.evento.nome}
      </p>
      <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-bold text-arvo-grafite">
          {TIPO_MANEJO_LABEL[manejo.tipo]}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          {session.role === "admin" && manejo.status === "pendente" && (
            <LinkButton href={`/manejos/${manejo.id}/editar`} variant="secondary">
              Editar
            </LinkButton>
          )}
          <LinkButton
            href={`/api/manejos/${manejo.id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            variant="secondary"
          >
            Baixar PDF
          </LinkButton>
          <StatusBadge
            label={STATUS_MANEJO_LABEL[manejo.status]}
            className={STATUS_MANEJO_CLASSES[manejo.status]}
          />
        </div>
      </div>

      {session.role === "cliente" && manejo.status === "pendente" && (
        <div className="mt-6">
          <AprovacaoActions manejoId={manejo.id} />
        </div>
      )}

      {session.role === "admin" && manejo.status === "aprovado" && (
        <form action={concluirManejo} className="mt-6">
          <input type="hidden" name="manejoId" value={manejo.id} />
          <Button type="submit" variant="secondary">
            Marcar como concluído
          </Button>
        </form>
      )}

      <div className="mt-6 rounded-2xl border border-arvo-terracota/10 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-arvo-grafite">Geral</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <InfoItem label="Responsável" value={manejo.responsavel} />
          <InfoItem label="Acompanhamento" value={manejo.acompanhamento} />
          <InfoItem label="Data" value={formatarData(manejo.data)} />
          <InfoItem
            label="Horário"
            value={
              manejo.horaInicio && manejo.horaFim
                ? `${manejo.horaInicio} – ${manejo.horaFim}`
                : null
            }
          />
          <InfoItem
            label="Parcelas"
            value={
              manejo.parcelas.length > 0
                ? manejo.parcelas.map((p) => p.nome).join(", ")
                : null
            }
          />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-arvo-terracota/10 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-arvo-grafite">Clima</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <InfoItem
            label="Temperatura"
            value={
              manejo.tempInicio != null
                ? `${manejo.tempInicio}°C – ${manejo.tempFim ?? "?"}°C`
                : null
            }
          />
          <InfoItem
            label="Umidade"
            value={
              manejo.umidInicio != null
                ? `${manejo.umidInicio}% – ${manejo.umidFim ?? "?"}%`
                : null
            }
          />
          <InfoItem
            label="Vento"
            value={
              manejo.ventoInicio != null
                ? `${manejo.ventoInicio} – ${manejo.ventoFim ?? "?"} km/h`
                : null
            }
          />
          <InfoItem label="Última chuva" value={manejo.ultimaChuva} />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-arvo-terracota/10 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-arvo-grafite">
          Dados específicos
        </h2>
        {manejo.tipo === "plantio" ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <InfoItem label="Equipamento" value={manejo.equipamento} />
            <InfoItem label="Qtd. linhas" value={manejo.qtdLinhas} />
            <InfoItem
              label="Esp. linhas"
              value={manejo.espLinhas ? `${manejo.espLinhas} m` : null}
            />
            <InfoItem
              label="Profundidade"
              value={manejo.profundidade ? `${manejo.profundidade} cm` : null}
            />
            <InfoItem
              label="Sementes por metro"
              value={manejo.sementesPorMetro}
            />
          </div>
        ) : manejo.tipo === "aplicacao" ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <InfoItem label="Tipo de aplicação" value={manejo.tipoAplicacao} />
            <InfoItem label="Ponta" value={manejo.ponta} />
            <InfoItem label="Volume da ponta" value={manejo.volumePonta} />
            <InfoItem label="Nº de pontas" value={manejo.numPontas} />
            <InfoItem
              label="Esp. pontas"
              value={manejo.espPontas ? `${manejo.espPontas} m` : null}
            />
            <InfoItem
              label="Altura da barra"
              value={manejo.altBarra ? `${manejo.altBarra} m` : null}
            />
            <InfoItem
              label="Pressão"
              value={manejo.pressao ? `${manejo.pressao} bar` : null}
            />
            <InfoItem
              label="Volume de calda"
              value={manejo.volCalda ? `${manejo.volCalda} L/ha` : null}
            />
            <InfoItem
              label="Velocidade"
              value={manejo.velocidade ? `${manejo.velocidade} km/h` : null}
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <InfoItem label="Equipamento / material" value={manejo.equipamento} />
          </div>
        )}
      </div>

      {manejo.tipo === "aplicacao" && manejo.produtos.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-arvo-terracota/10 bg-white shadow-sm">
          <h2 className="px-5 pt-5 text-sm font-semibold text-arvo-grafite">
            Produtos
          </h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-arvo-terracota/10 bg-arvo-bg/50 text-left text-xs text-arvo-grafite/60 uppercase">
                  <th className="px-5 py-2 font-medium">Trat.</th>
                  <th className="px-5 py-2 font-medium">Produto</th>
                  <th className="px-5 py-2 font-medium">Ingrediente</th>
                  <th className="px-5 py-2 font-medium">Dose/ha</th>
                </tr>
              </thead>
              <tbody>
                {manejo.produtos.map((produto) => (
                  <tr key={produto.id} className="border-b border-arvo-terracota/5 last:border-0">
                    <td className="px-5 py-2 text-arvo-grafite/70">{produto.numTrat}</td>
                    <td className="px-5 py-2 font-medium text-arvo-grafite">{produto.nome}</td>
                    <td className="px-5 py-2 text-arvo-grafite/70">{produto.ingrediente}</td>
                    <td className="px-5 py-2 text-arvo-grafite/70">{produto.doseHa}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {manejo.anotacoes && (
        <div className="mt-6 rounded-2xl border border-arvo-terracota/10 bg-white p-5 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-arvo-grafite">
            Anotações
          </h2>
          <p className="text-sm text-arvo-grafite/80">{manejo.anotacoes}</p>
        </div>
      )}

      {manejo.historico.length > 0 && (
        <div className="mt-6 rounded-2xl border border-arvo-terracota/10 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-arvo-grafite">
            Histórico de aprovação
          </h2>
          <ul className="space-y-3">
            {manejo.historico.map((h) => (
              <li key={h.id} className="flex items-start gap-3 text-sm">
                <StatusBadge
                  label={h.acao === "aprovado" ? "Aprovado" : "Reprovado"}
                  className={
                    h.acao === "aprovado"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-red-100 text-red-700"
                  }
                />
                <div>
                  <p className="text-arvo-grafite">
                    {h.usuario.nome}{" "}
                    <span className="text-xs text-arvo-grafite/40">
                      em {formatarDataHora(h.criadoEm)}
                    </span>
                  </p>
                  {h.observacao && (
                    <p className="mt-1 text-arvo-grafite/70">{h.observacao}</p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6">
        <FotosGaleria
          manejoId={manejo.id}
          fotos={manejo.fotos}
          podeEditar={session.role === "admin"}
        />
      </div>

      <div className="mt-6">
        <ComentariosThread manejoId={manejo.id} comentarios={manejo.comentarios} />
      </div>
    </div>
  );
}
