"use client";

import {
  useActionState,
  useEffect,
  useMemo,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ClipboardList,
  Move,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import {
  atualizarParcela,
  createParcela,
  deleteParcela,
  moverParcela,
  type ParcelaFormState,
} from "@/lib/actions/parcelas";
import {
  agruparEmFileiras,
  formatarMedidas,
  moverNaGrade,
  removerDaGrade,
} from "@/lib/croqui";
import { cn } from "@/lib/utils";

// Distância mínima (em pixels) que o dedo/mouse precisa se mover a partir do
// ícone de mover pra contar como um arraste de verdade. Abaixo disso, é
// tratado como um toque simples (seleciona a parcela).
const LIMIAR_ARRASTE_PX = 8;

// Desenho em escala: cada metro vira alguns pixels, calculados pra que a
// fileira mais comprida caiba na tela. Parcela sem medida usa o padrão.
const MEDIDA_PADRAO_M = 4;
const ESPACO_PX = 8;
const LARGURA_MIN_PX = 76;
const ALTURA_MIN_PX = 56;
const ALTURA_MAX_PX = 220;
const ALTURA_SEM_MEDIDA_PX = 72;

type Parcela = {
  id: string;
  nome: string;
  tipo: string;
  posX: number;
  posY: number;
  linhas: number | null;
  largura: number | null;
  comprimento: number | null;
};

type Movimento =
  | { tipo: "mover"; id: string; fileira: number; indice: number }
  | { tipo: "remover"; id: string };

type Alvo = { fileira: number; indice: number; parcelaId?: string };

const TIPO_ESTILO: Record<string, string> = {
  parcela: "bg-arvo-terracota/10 border-arvo-terracota/40 text-arvo-terracota",
  corredor: "bg-arvo-grafite/5 border-arvo-grafite/15 text-arvo-grafite/50",
  rua: "bg-blue-50 border-blue-300 text-blue-700",
};

const TIPO_LABEL: Record<string, string> = {
  parcela: "Parcela",
  corredor: "Corredor",
  rua: "Rua",
};

const limitar = (valor: number, min: number, max: number) =>
  Math.min(max, Math.max(min, valor));

function localizar(fileiras: string[][], id: string) {
  for (let fileira = 0; fileira < fileiras.length; fileira++) {
    const indice = fileiras[fileira].indexOf(id);
    if (indice !== -1) return { fileira, indice };
  }
  return null;
}

export function CroquiGrid({
  eventoId,
  parcelas,
  podeEditar = true,
}: {
  eventoId: string;
  parcelas: Parcela[];
  podeEditar?: boolean;
}) {
  const porId = useMemo(() => new Map(parcelas.map((p) => [p.id, p])), [parcelas]);
  const fileirasServidor = useMemo(() => agruparEmFileiras(parcelas), [parcelas]);

  // Mostra a mudança na hora, sem esperar o servidor responder (importante
  // com internet fraca no campo). Se o servidor falhar, volta sozinho.
  const [fileiras, aplicarOtimista] = useOptimistic(
    fileirasServidor,
    (atual, movimento: Movimento) =>
      movimento.tipo === "remover"
        ? removerDaGrade(atual, movimento.id)
        : moverNaGrade(atual, movimento.id, movimento.fileira, movimento.indice)
  );
  const [, startTransition] = useTransition();

  const [selecionada, setSelecionada] = useState<string | null>(null);
  const [editando, setEditando] = useState(false);
  const [confirmandoRemocao, setConfirmandoRemocao] = useState(false);

  function selecionar(id: string | null) {
    setSelecionada((atual) => (atual === id ? null : id));
    setEditando(false);
    setConfirmandoRemocao(false);
  }

  function mover(id: string, fileira: number, indice: number) {
    startTransition(async () => {
      aplicarOtimista({ tipo: "mover", id, fileira, indice });
      await moverParcela(id, fileira, indice);
    });
  }

  function remover(id: string) {
    selecionar(null);
    startTransition(async () => {
      aplicarOtimista({ tipo: "remover", id });
      await deleteParcela(id);
    });
  }

  // Mede a largura disponível pra calcular a escala do desenho.
  const areaRef = useRef<HTMLDivElement>(null);
  const [larguraArea, setLarguraArea] = useState(800);
  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const observador = new ResizeObserver(([entrada]) =>
      setLarguraArea(entrada.contentRect.width)
    );
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  const pxPorMetro = useMemo(() => {
    const larguraFileiraM = (fileira: string[]) =>
      fileira.reduce((soma, id) => {
        const p = porId.get(id);
        if (!p || p.tipo === "rua") return soma;
        return soma + (p.largura ?? MEDIDA_PADRAO_M);
      }, 0);
    const maiorFileiraM = Math.max(1, ...fileiras.map(larguraFileiraM));
    const maiorQtd = Math.max(1, ...fileiras.map((f) => f.length));
    return limitar((larguraArea - ESPACO_PX * (maiorQtd - 1)) / maiorFileiraM, 6, 60);
  }, [fileiras, porId, larguraArea]);

  // Estado do arraste (mouse ou toque, via Pointer Events — funciona igual
  // nos dois). O alvo é onde a parcela vai cair ao soltar.
  const [arrastandoId, setArrastandoId] = useState<string | null>(null);
  const [alvo, setAlvo] = useState<Alvo | null>(null);
  const gestoRef = useRef<{
    origemId: string;
    inicioX: number;
    inicioY: number;
    arrastando: boolean;
    alvo: Alvo | null;
  } | null>(null);
  const suprimirCliqueRef = useRef(false);

  function encerrarGesto() {
    gestoRef.current = null;
    setArrastandoId(null);
    setAlvo(null);
  }

  function iniciarArraste(e: ReactPointerEvent<HTMLButtonElement>, parcelaId: string) {
    e.currentTarget.setPointerCapture(e.pointerId);
    gestoRef.current = {
      origemId: parcelaId,
      inicioX: e.clientX,
      inicioY: e.clientY,
      arrastando: false,
      alvo: null,
    };
  }

  function moverArraste(e: ReactPointerEvent<HTMLButtonElement>) {
    const gesto = gestoRef.current;
    if (!gesto) return;

    if (!gesto.arrastando) {
      const distancia = Math.hypot(e.clientX - gesto.inicioX, e.clientY - gesto.inicioY);
      if (distancia < LIMIAR_ARRASTE_PX) return;
      gesto.arrastando = true;
      setArrastandoId(gesto.origemId);
    }

    const elemento = document.elementFromPoint(e.clientX, e.clientY);
    const cartao = elemento?.closest<HTMLElement>("[data-parcela-id]");
    const linha = elemento?.closest<HTMLElement>("[data-fileira]");
    let novoAlvo: Alvo | null = null;

    if (cartao && cartao.dataset.parcelaId !== gesto.origemId) {
      // Soltar em cima de outra parcela: ocupa o lugar dela.
      const pos = localizar(fileiras, cartao.dataset.parcelaId!);
      if (pos) novoAlvo = { ...pos, parcelaId: cartao.dataset.parcelaId };
    } else if (!cartao && linha) {
      // Soltar no espaço vazio de uma fileira: vai pro fim dela.
      const fileira = Number(linha.dataset.fileira);
      novoAlvo = { fileira, indice: fileiras[fileira]?.length ?? 0 };
    }

    gesto.alvo = novoAlvo;
    setAlvo(novoAlvo);
  }

  function soltarArraste() {
    const gesto = gestoRef.current;
    if (gesto?.arrastando) {
      suprimirCliqueRef.current = true;
      if (gesto.alvo) mover(gesto.origemId, gesto.alvo.fileira, gesto.alvo.indice);
    }
    encerrarGesto();
  }

  function aoClicarAlca(parcelaId: string) {
    if (suprimirCliqueRef.current) {
      suprimirCliqueRef.current = false;
      return;
    }
    selecionar(parcelaId);
  }

  const parcelaSelecionada = selecionada ? porId.get(selecionada) : undefined;
  const posSelecionada = selecionada ? localizar(fileiras, selecionada) : null;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-arvo-terracota/10 bg-white p-5 shadow-sm">
        <div ref={areaRef}>
          {fileiras.length === 0 ? (
            <p className="text-sm text-arvo-grafite/50">
              Nenhuma parcela cadastrada ainda.
              {podeEditar && " Adicione a primeira abaixo."}
            </p>
          ) : (
            <>
              <p className="mb-4 text-xs text-arvo-grafite/50">
                {podeEditar
                  ? "Toque numa parcela para mover com as setas, editar ou remover. Também dá pra arrastar pelo ícone de mover."
                  : "Toque numa parcela para ver os manejos feitos nela."}
              </p>
              <div className="overflow-x-auto pb-1">
                <div className="w-max min-w-full space-y-3">
                  {fileiras.map((fileira, indiceFileira) => (
                    <div
                      key={indiceFileira}
                      data-fileira={indiceFileira}
                      className={cn(
                        "rounded-lg transition",
                        alvo &&
                          !alvo.parcelaId &&
                          alvo.fileira === indiceFileira &&
                          "bg-arvo-terracota/5 ring-2 ring-arvo-terracota ring-dashed ring-offset-2"
                      )}
                    >
                      <p className="mb-1 text-[11px] font-medium tracking-wide text-arvo-grafite/40 uppercase">
                        Fileira {indiceFileira + 1}
                      </p>
                      <div className="flex items-start" style={{ gap: ESPACO_PX }}>
                        {fileira.map((id) => {
                          const parcela = porId.get(id);
                          if (!parcela) return null;
                          return (
                            <CartaoParcela
                              key={id}
                              parcela={parcela}
                              eventoId={eventoId}
                              pxPorMetro={pxPorMetro}
                              podeEditar={podeEditar}
                              selecionada={selecionada === id}
                              arrastando={arrastandoId === id}
                              ehAlvo={alvo?.parcelaId === id}
                              aoSelecionar={() => selecionar(id)}
                              alca={{
                                onPointerDown: (e) => iniciarArraste(e, id),
                                onPointerMove: moverArraste,
                                onPointerUp: soltarArraste,
                                onPointerCancel: encerrarGesto,
                                onClick: () => aoClicarAlca(id),
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  {arrastandoId && (
                    <div
                      data-fileira={fileiras.length}
                      className={cn(
                        "rounded-lg border-2 border-dashed border-arvo-grafite/20 p-4 text-center text-xs text-arvo-grafite/50",
                        alvo?.fileira === fileiras.length &&
                          "border-arvo-terracota bg-arvo-terracota/5 text-arvo-terracota"
                      )}
                    >
                      Solte aqui para criar uma nova fileira
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {podeEditar && parcelaSelecionada && posSelecionada && (
        <div className="sticky bottom-[calc(env(safe-area-inset-bottom,0px)+1rem)] z-10 rounded-2xl border border-arvo-terracota/30 bg-white p-4 shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-arvo-grafite">
                {parcelaSelecionada.nome}
              </p>
              <p className="text-xs text-arvo-grafite/50">
                {TIPO_LABEL[parcelaSelecionada.tipo]} · Fileira {posSelecionada.fileira + 1},
                posição {posSelecionada.indice + 1}
                {formatarMedidas(parcelaSelecionada.largura, parcelaSelecionada.comprimento) &&
                  ` · ${formatarMedidas(parcelaSelecionada.largura, parcelaSelecionada.comprimento)}`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => selecionar(null)}
              aria-label="Fechar"
              className="rounded-full p-1 text-arvo-grafite/50 hover:bg-arvo-grafite/5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <BarraDeMovimento
            fileiras={fileiras}
            id={parcelaSelecionada.id}
            pos={posSelecionada}
            mover={mover}
          />

          <div className="mt-3 flex flex-wrap gap-2">
            {parcelaSelecionada.tipo === "parcela" && (
              <Link
                href={`/manejos?eventoId=${eventoId}&parcelaId=${parcelaSelecionada.id}`}
                className="flex items-center gap-1.5 rounded-lg border border-arvo-grafite/15 px-3 py-2 text-xs font-medium text-arvo-grafite hover:bg-arvo-grafite/5"
              >
                <ClipboardList className="h-3.5 w-3.5" /> Ver manejos
              </Link>
            )}
            <button
              type="button"
              onClick={() => {
                setEditando((v) => !v);
                setConfirmandoRemocao(false);
              }}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium",
                editando
                  ? "border-arvo-terracota bg-arvo-terracota/10 text-arvo-terracota"
                  : "border-arvo-grafite/15 text-arvo-grafite hover:bg-arvo-grafite/5"
              )}
            >
              <Pencil className="h-3.5 w-3.5" /> Editar
            </button>
            {confirmandoRemocao ? (
              <span className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-1 text-xs text-red-700">
                Remover mesmo?
                <button
                  type="button"
                  onClick={() => remover(parcelaSelecionada.id)}
                  className="rounded-md bg-red-600 px-2 py-1 font-semibold text-white"
                >
                  Sim, remover
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmandoRemocao(false)}
                  className="rounded-md px-2 py-1 font-medium hover:bg-red-100"
                >
                  Cancelar
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setConfirmandoRemocao(true);
                  setEditando(false);
                }}
                className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remover
              </button>
            )}
          </div>

          {editando && (
            <FormEditarParcela
              key={parcelaSelecionada.id}
              parcela={parcelaSelecionada}
              aoSalvar={() => setEditando(false)}
            />
          )}
        </div>
      )}

      {podeEditar && <FormAdicionarParcela eventoId={eventoId} totalFileiras={fileiras.length} />}
    </div>
  );
}

function CartaoParcela({
  parcela,
  eventoId,
  pxPorMetro,
  podeEditar,
  selecionada,
  arrastando,
  ehAlvo,
  aoSelecionar,
  alca,
}: {
  parcela: Parcela;
  eventoId: string;
  pxPorMetro: number;
  podeEditar: boolean;
  selecionada: boolean;
  arrastando: boolean;
  ehAlvo: boolean;
  aoSelecionar: () => void;
  alca: {
    onPointerDown: (e: ReactPointerEvent<HTMLButtonElement>) => void;
    onPointerMove: (e: ReactPointerEvent<HTMLButtonElement>) => void;
    onPointerUp: () => void;
    onPointerCancel: () => void;
    onClick: () => void;
  };
}) {
  const ehRua = parcela.tipo === "rua";
  // A rua ocupa a fileira toda; a altura dela representa a largura da rua.
  const estilo = ehRua
    ? {
        height: parcela.largura
          ? limitar(parcela.largura * pxPorMetro, 32, 96)
          : 40,
      }
    : {
        width: Math.max(LARGURA_MIN_PX, (parcela.largura ?? MEDIDA_PADRAO_M) * pxPorMetro),
        height: parcela.comprimento
          ? limitar(parcela.comprimento * pxPorMetro, ALTURA_MIN_PX, ALTURA_MAX_PX)
          : ALTURA_SEM_MEDIDA_PX,
      };

  const medidas = formatarMedidas(parcela.largura, parcela.comprimento);
  const conteudo = (
    <>
      <span className="max-w-full truncate font-semibold">{parcela.nome}</span>
      {medidas && !ehRua && <span className="opacity-70">{medidas}</span>}
      {parcela.linhas && <span className="opacity-70">{parcela.linhas} linhas</span>}
    </>
  );
  const classeConteudo =
    "flex h-full w-full flex-col items-center justify-center gap-0.5 overflow-hidden rounded-lg p-2 text-center";

  return (
    <div
      data-parcela-id={parcela.id}
      style={estilo}
      className={cn(
        "relative shrink-0 rounded-lg border text-xs transition",
        ehRua && "min-w-[160px] flex-1",
        TIPO_ESTILO[parcela.tipo],
        selecionada && "ring-2 ring-arvo-terracota ring-offset-1",
        arrastando && "opacity-40",
        ehAlvo && "bg-arvo-terracota/5 ring-2 ring-arvo-terracota ring-dashed"
      )}
    >
      {podeEditar ? (
        <button
          type="button"
          onClick={aoSelecionar}
          aria-pressed={selecionada}
          className={classeConteudo}
        >
          {conteudo}
        </button>
      ) : parcela.tipo === "parcela" ? (
        <Link
          href={`/manejos?eventoId=${eventoId}&parcelaId=${parcela.id}`}
          className={classeConteudo}
        >
          {conteudo}
        </Link>
      ) : (
        <div className={classeConteudo}>{conteudo}</div>
      )}
      {podeEditar && (
        <button
          type="button"
          {...alca}
          title="Arrastar para mover"
          aria-label={`Arrastar ${parcela.nome}`}
          className={cn(
            "absolute top-0.5 left-0.5 flex h-7 w-7 touch-none items-center justify-center rounded-full text-white select-none",
            selecionada || arrastando ? "bg-arvo-terracota" : "bg-arvo-grafite/40"
          )}
        >
          <Move className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

function BarraDeMovimento({
  fileiras,
  id,
  pos,
  mover,
}: {
  fileiras: string[][];
  id: string;
  pos: { fileira: number; indice: number };
  mover: (id: string, fileira: number, indice: number) => void;
}) {
  const { fileira, indice } = pos;
  const tamanhoFileira = fileiras[fileira].length;
  const ultimaFileira = fileira === fileiras.length - 1;
  // Descer da última fileira cria uma nova — só faz sentido se a parcela
  // não estiver sozinha (senão ela só "trocaria" de fileira vazia).
  const podeDescer = !ultimaFileira || tamanhoFileira > 1;

  const botoes = [
    {
      rotulo: "Mover para a esquerda",
      icone: ArrowLeft,
      ativo: indice > 0,
      acao: () => mover(id, fileira, indice - 1),
    },
    {
      rotulo: "Mover para a direita",
      icone: ArrowRight,
      ativo: indice < tamanhoFileira - 1,
      acao: () => mover(id, fileira, indice + 1),
    },
    {
      rotulo: "Mover para a fileira de cima",
      icone: ArrowUp,
      ativo: fileira > 0,
      acao: () => mover(id, fileira - 1, indice),
    },
    {
      rotulo: ultimaFileira ? "Mover para uma nova fileira abaixo" : "Mover para a fileira de baixo",
      icone: ArrowDown,
      ativo: podeDescer,
      acao: () => mover(id, fileira + 1, ultimaFileira ? 0 : indice),
    },
  ];

  return (
    <div className="mt-3 flex gap-2">
      {botoes.map(({ rotulo, icone: Icone, ativo, acao }) => (
        <button
          key={rotulo}
          type="button"
          onClick={acao}
          disabled={!ativo}
          title={rotulo}
          aria-label={rotulo}
          className="flex h-11 flex-1 items-center justify-center rounded-lg bg-arvo-grafite/5 text-arvo-grafite transition hover:bg-arvo-terracota/10 hover:text-arvo-terracota disabled:opacity-30 disabled:hover:bg-arvo-grafite/5 disabled:hover:text-arvo-grafite"
        >
          <Icone className="h-5 w-5" />
        </button>
      ))}
    </div>
  );
}

const CLASSE_CAMPO = "w-full rounded-lg border border-arvo-grafite/15 bg-white px-2 py-2 text-sm";
const CLASSE_ROTULO = "mb-1 block text-xs font-medium text-arvo-grafite/60";

// Sugere o próximo nome da sequência: "GH 2459" → "GH 2460", "P09" → "P10".
function proximoNome(nome: string) {
  return nome.replace(/(\d+)(\D*)$/, (_, numero: string, resto: string) => {
    const proximo = String(Number(numero) + 1).padStart(numero.length, "0");
    return proximo + resto;
  });
}

function FormAdicionarParcela({
  eventoId,
  totalFileiras,
}: {
  eventoId: string;
  totalFileiras: number;
}) {
  const [state, formAction, pending] = useActionState<ParcelaFormState, FormData>(
    createParcela,
    undefined
  );

  // Campos controlados: depois de adicionar, mantemos tipo, medidas e
  // fileira (normalmente várias parcelas seguidas têm o mesmo tamanho) e
  // já sugerimos o próximo nome da sequência.
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("parcela");
  const [largura, setLargura] = useState("");
  const [comprimento, setComprimento] = useState("");
  const [linhas, setLinhas] = useState("");
  const [fileira, setFileira] = useState(
    totalFileiras > 0 ? String(totalFileiras - 1) : "nova"
  );
  const nomeRef = useRef<HTMLInputElement>(null);

  // Ajuste de estado quando chega uma resposta nova do servidor
  // (padrão do React pra reagir a uma mudança sem useEffect).
  const [ultimaResposta, setUltimaResposta] = useState(state);
  if (state !== ultimaResposta) {
    setUltimaResposta(state);
    if (state && "ok" in state) {
      setNome(proximoNome(nome) === nome ? "" : proximoNome(nome));
      // Se criou uma fileira nova, as próximas parcelas continuam nela.
      if (fileira === "nova") setFileira(String(totalFileiras - 1));
    }
  }
  // Se a fileira escolhida deixou de existir (ex: parcelas movidas), volta pra última.
  if (fileira !== "nova" && Number(fileira) >= totalFileiras) {
    setFileira(totalFileiras > 0 ? String(totalFileiras - 1) : "nova");
  }

  useEffect(() => {
    if (state && "ok" in state) nomeRef.current?.focus();
  }, [state]);

  return (
    <div className="rounded-2xl border border-arvo-terracota/10 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-arvo-grafite">Adicionar parcela</h2>
      <form action={formAction} className="grid grid-cols-2 gap-3 md:grid-cols-6">
        <input type="hidden" name="eventoId" value={eventoId} />
        <label className="col-span-2">
          <span className={CLASSE_ROTULO}>Nome</span>
          <input
            ref={nomeRef}
            name="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="ex: GH 2459"
            required
            className={CLASSE_CAMPO}
          />
        </label>
        <label>
          <span className={CLASSE_ROTULO}>Tipo</span>
          <select
            name="tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className={CLASSE_CAMPO}
          >
            <option value="parcela">Parcela</option>
            <option value="corredor">Corredor</option>
            <option value="rua">Rua</option>
          </select>
        </label>
        <label>
          <span className={CLASSE_ROTULO}>Fileira</span>
          <select
            name="fileira"
            value={fileira}
            onChange={(e) => setFileira(e.target.value)}
            className={CLASSE_CAMPO}
          >
            {Array.from({ length: totalFileiras }, (_, i) => (
              <option key={i} value={String(i)}>
                Fileira {i + 1}
              </option>
            ))}
            <option value="nova">+ Nova fileira</option>
          </select>
        </label>
        <div className="col-span-2 flex items-end gap-2">
          <label className="flex-1">
            <span className={CLASSE_ROTULO}>Largura (m)</span>
            <input
              name="largura"
              inputMode="decimal"
              value={largura}
              onChange={(e) => setLargura(e.target.value)}
              placeholder="4,5"
              className={CLASSE_CAMPO}
            />
          </label>
          <span className="pb-2 text-arvo-grafite/40">×</span>
          <label className="flex-1">
            <span className={CLASSE_ROTULO}>Comprimento (m)</span>
            <input
              name="comprimento"
              inputMode="decimal"
              value={comprimento}
              onChange={(e) => setComprimento(e.target.value)}
              placeholder="10"
              className={CLASSE_CAMPO}
            />
          </label>
        </div>
        <label>
          <span className={CLASSE_ROTULO}>Nº linhas (opcional)</span>
          <input
            name="linhas"
            type="number"
            inputMode="numeric"
            min={1}
            value={linhas}
            onChange={(e) => setLinhas(e.target.value)}
            className={CLASSE_CAMPO}
          />
        </label>
        <div className="flex items-end md:col-span-5 md:justify-end">
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-arvo-terracota px-4 py-2 text-sm font-semibold text-arvo-bg transition hover:opacity-90 disabled:opacity-60 md:w-auto"
          >
            {pending ? "Adicionando..." : "Adicionar"}
          </button>
        </div>
      </form>
      {state && "error" in state && state.error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{state.error}</p>
      )}
    </div>
  );
}

function FormEditarParcela({
  parcela,
  aoSalvar,
}: {
  parcela: Parcela;
  aoSalvar: () => void;
}) {
  const [state, formAction, pending] = useActionState<ParcelaFormState, FormData>(
    atualizarParcela,
    undefined
  );

  useEffect(() => {
    if (state && "ok" in state) aoSalvar();
  }, [state, aoSalvar]);

  const numeroParaCampo = (n: number | null) =>
    n == null ? "" : n.toLocaleString("pt-BR", { maximumFractionDigits: 2, useGrouping: false });

  return (
    <form action={formAction} className="mt-4 grid grid-cols-2 gap-3 border-t border-arvo-grafite/10 pt-4">
      <input type="hidden" name="parcelaId" value={parcela.id} />
      <label className="col-span-2">
        <span className={CLASSE_ROTULO}>Nome</span>
        <input name="nome" defaultValue={parcela.nome} required className={CLASSE_CAMPO} />
      </label>
      <label>
        <span className={CLASSE_ROTULO}>Largura (m)</span>
        <input
          name="largura"
          inputMode="decimal"
          defaultValue={numeroParaCampo(parcela.largura)}
          className={CLASSE_CAMPO}
        />
      </label>
      <label>
        <span className={CLASSE_ROTULO}>Comprimento (m)</span>
        <input
          name="comprimento"
          inputMode="decimal"
          defaultValue={numeroParaCampo(parcela.comprimento)}
          className={CLASSE_CAMPO}
        />
      </label>
      <label>
        <span className={CLASSE_ROTULO}>Tipo</span>
        <select name="tipo" defaultValue={parcela.tipo} className={CLASSE_CAMPO}>
          <option value="parcela">Parcela</option>
          <option value="corredor">Corredor</option>
          <option value="rua">Rua</option>
        </select>
      </label>
      <label>
        <span className={CLASSE_ROTULO}>Nº linhas</span>
        <input
          name="linhas"
          type="number"
          inputMode="numeric"
          min={1}
          defaultValue={parcela.linhas ?? ""}
          className={CLASSE_CAMPO}
        />
      </label>
      {state && "error" in state && state.error && (
        <p className="col-span-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="col-span-2 rounded-lg bg-arvo-terracota px-4 py-2 text-sm font-semibold text-arvo-bg transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Salvar alterações"}
      </button>
    </form>
  );
}
