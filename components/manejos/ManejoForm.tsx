"use client";

import { useRef, useState } from "react";
import { useActionState } from "react";
import Link from "next/link";
import { updateManejo } from "@/lib/actions/manejos";
import type { FormState } from "@/lib/actions/clientes";
import { criarManejoComFallbackOffline } from "@/lib/offline/manejoQueue";
import { Field } from "@/components/ui/Field";
import { SelectField } from "@/components/ui/SelectField";
import { Button } from "@/components/ui/Button";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";
import { cn } from "@/lib/utils";
import { TIPO_MANEJO_LABEL, TIPO_MANEJO_DESCRICAO, PRESETS_APLICACAO } from "@/lib/constants";

type ManejoFormState = (FormState & { offline?: boolean }) | undefined;

type TipoManejo = keyof typeof TIPO_MANEJO_LABEL;
const TIPOS: TipoManejo[] = ["plantio", "aplicacao", "montagem", "organizacao"];

type ProdutoRow = {
  numTrat: number;
  nome: string;
  ingrediente: string;
  doseHa: string;
};

function novoProduto(numTrat: number): ProdutoRow {
  return {
    numTrat,
    nome: "",
    ingrediente: "",
    doseHa: "",
  };
}

type ManejoDefaults = {
  id: string;
  eventoId: string;
  parcelas: { id: string }[];
  tipo: string;
  status: string;
  responsavel: string | null;
  acompanhamento: string | null;
  data: Date;
  horaInicio: string | null;
  horaFim: string | null;
  tempInicio: number | null;
  tempFim: number | null;
  umidInicio: number | null;
  umidFim: number | null;
  ventoInicio: number | null;
  ventoFim: number | null;
  ultimaChuva: string | null;
  equipamento: string | null;
  qtdLinhas: number | null;
  espLinhas: number | null;
  profundidade: number | null;
  sementesPorMetro: string | null;
  tipoAplicacao: string | null;
  ponta: string | null;
  volumePonta: string | null;
  numPontas: number | null;
  espPontas: number | null;
  altBarra: number | null;
  pressao: number | null;
  volCalda: number | null;
  velocidade: number | null;
  anotacoes: string | null;
  produtos: {
    numTrat: number;
    nome: string;
    ingrediente: string;
    doseHa: string;
  }[];
};

function toDateInputValue(data: Date) {
  return data.toISOString().slice(0, 10);
}

export function ManejoForm({
  eventos,
  parcelas,
  eventoIdInicial,
  manejo,
}: {
  eventos: { id: string; nome: string; cliente: { nome: string } }[];
  parcelas: { id: string; nome: string; eventoId: string }[];
  eventoIdInicial?: string;
  manejo?: ManejoDefaults;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [tipo, setTipo] = useState<TipoManejo>(
    (manejo?.tipo as TipoManejo) ?? "plantio"
  );
  const [statusInicial, setStatusInicial] = useState<"a_realizar" | "realizado">(
    manejo?.status === "concluido" ? "realizado" : "a_realizar"
  );
  const [produtos, setProdutos] = useState<ProdutoRow[]>(
    manejo && manejo.produtos.length > 0
      ? manejo.produtos.map((p) => ({
          numTrat: p.numTrat,
          nome: p.nome,
          ingrediente: p.ingrediente,
          doseHa: p.doseHa,
        }))
      : [novoProduto(1)]
  );
  const [eventoId, setEventoId] = useState(
    manejo?.eventoId ?? eventoIdInicial ?? ""
  );
  const [parcelaIds, setParcelaIds] = useState<string[]>(
    manejo?.parcelas.map((p) => p.id) ?? []
  );

  const action = manejo
    ? updateManejo.bind(null, manejo.id)
    : (prevState: ManejoFormState, formData: FormData) =>
        criarManejoComFallbackOffline(prevState, formData, {
          eventoNome:
            eventos.find((e) => e.id === eventoId)?.nome ?? "Evento",
          tipoLabel: TIPO_MANEJO_LABEL[tipo],
        });
  const [state, formAction, pending] = useActionState<ManejoFormState, FormData>(
    action,
    undefined
  );

  const parcelasDoEvento = parcelas.filter((p) => p.eventoId === eventoId);
  const todasSelecionadas =
    parcelasDoEvento.length > 0 &&
    parcelasDoEvento.every((p) => parcelaIds.includes(p.id));

  function alternarParcela(id: string) {
    setParcelaIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  function alternarTodas() {
    if (todasSelecionadas) {
      setParcelaIds((prev) =>
        prev.filter((id) => !parcelasDoEvento.some((p) => p.id === id))
      );
    } else {
      setParcelaIds((prev) => [
        ...prev,
        ...parcelasDoEvento.map((p) => p.id).filter((id) => !prev.includes(id)),
      ]);
    }
  }

  function aplicarPreset(nome: string) {
    const preset = PRESETS_APLICACAO[nome];
    if (!preset || !formRef.current) return;
    const setar = (campo: string, valor: string | number | undefined) => {
      if (valor === undefined) return;
      const input = formRef.current!.querySelector<HTMLInputElement>(
        `[name="${campo}"]`
      );
      if (input) input.value = String(valor);
    };
    setar("ponta", preset.ponta);
    setar("volumePonta", preset.volumePonta);
    setar("pressao", preset.pressao);
    setar("volCalda", preset.volCalda);
  }

  function addProduto() {
    setProdutos((prev) => [...prev, novoProduto(prev.length + 1)]);
  }

  function removeProduto(index: number) {
    setProdutos((prev) => prev.filter((_, i) => i !== index));
  }

  function updateProduto(
    index: number,
    field: keyof ProdutoRow,
    value: string
  ) {
    setProdutos((prev) =>
      prev.map((p, i) =>
        i === index
          ? { ...p, [field]: field === "numTrat" ? Number(value) : value }
          : p
      )
    );
  }

  if (state?.offline) {
    return (
      <div className="rounded-2xl border border-arvo-terracota/10 bg-white p-6 shadow-sm">
        <p className="font-display text-lg font-bold text-arvo-grafite">
          Salvo no celular
        </p>
        <p className="mt-1 text-sm text-arvo-grafite/60">
          Sem conexão no momento — o manejo de {TIPO_MANEJO_LABEL[tipo]} fica
          guardado aqui e é enviado sozinho assim que a internet voltar.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/manejos/novo"
            className="rounded-lg bg-arvo-terracota px-4 py-2.5 text-sm font-semibold text-arvo-bg"
          >
            Registrar outro manejo
          </Link>
          <Link
            href="/manejos"
            className="rounded-lg border border-arvo-grafite/15 px-4 py-2.5 text-sm font-semibold text-arvo-grafite"
          >
            Ver manejos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-2xl border border-arvo-terracota/10 bg-white p-6 shadow-sm"
    >
      <input type="hidden" name="tipo" value={tipo} />
      <input type="hidden" name="statusInicial" value={statusInicial} />
      {parcelaIds.map((id) => (
        <input key={id} type="hidden" name="parcelaIds" value={id} />
      ))}
      {tipo === "aplicacao" && (
        <input
          type="hidden"
          name="produtosJson"
          value={JSON.stringify(produtos)}
        />
      )}

      <div className="mb-6">
        <label className="mb-2 block text-sm font-medium text-arvo-grafite">
          Tipo de manejo
        </label>
        <div className="flex flex-wrap gap-2">
          {TIPOS.map((opcao) => (
            <button
              key={opcao}
              type="button"
              onClick={() => setTipo(opcao)}
              className={cn(
                "rounded-lg border px-3 py-2 text-sm font-semibold transition",
                tipo === opcao
                  ? "border-arvo-terracota bg-arvo-terracota text-arvo-bg"
                  : "border-arvo-grafite/15 text-arvo-grafite/70 hover:bg-arvo-bg"
              )}
            >
              {TIPO_MANEJO_LABEL[opcao]}
            </button>
          ))}
        </div>
        {TIPO_MANEJO_DESCRICAO[tipo] && (
          <p className="mt-1.5 text-xs text-arvo-grafite/50">
            {TIPO_MANEJO_DESCRICAO[tipo]}
          </p>
        )}
      </div>

      {!manejo && (
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-arvo-grafite">
            Situação
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStatusInicial("a_realizar")}
              className={cn(
                "flex-1 rounded-lg border px-4 py-2 text-left text-sm transition",
                statusInicial === "a_realizar"
                  ? "border-arvo-terracota bg-arvo-terracota/5"
                  : "border-arvo-grafite/15 hover:bg-arvo-bg"
              )}
            >
              <span className="block font-semibold text-arvo-grafite">
                A realizar
              </span>
              <span className="text-xs text-arvo-grafite/60">
                Fica pendente aguardando aprovação do cliente
              </span>
            </button>
            <button
              type="button"
              onClick={() => setStatusInicial("realizado")}
              className={cn(
                "flex-1 rounded-lg border px-4 py-2 text-left text-sm transition",
                statusInicial === "realizado"
                  ? "border-arvo-terracota bg-arvo-terracota/5"
                  : "border-arvo-grafite/15 hover:bg-arvo-bg"
              )}
            >
              <span className="block font-semibold text-arvo-grafite">
                Já realizado
              </span>
              <span className="text-xs text-arvo-grafite/60">
                Registro histórico, não precisa de aprovação
              </span>
            </button>
          </div>
        </div>
      )}

      <SelectField
        label="Evento"
        name="eventoId"
        value={eventoId}
        onChange={(e) => {
          setEventoId(e.target.value);
          setParcelaIds([]);
        }}
        error={state?.fieldErrors?.eventoId}
        placeholder="Selecione o evento"
        options={eventos.map((e) => ({
          value: e.id,
          label: `${e.cliente.nome} — ${e.nome}`,
        }))}
        required
      />

      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between">
          <label className="block text-sm font-medium text-arvo-grafite">
            Parcelas
          </label>
          {eventoId && parcelasDoEvento.length > 0 && (
            <button
              type="button"
              onClick={alternarTodas}
              className="text-xs font-medium text-arvo-terracota hover:underline"
            >
              {todasSelecionadas ? "Desmarcar todas" : "Selecionar todas"}
            </button>
          )}
        </div>
        {!eventoId ? (
          <p className="text-xs text-arvo-grafite/50">
            Selecione o evento primeiro.
          </p>
        ) : parcelasDoEvento.length === 0 ? (
          <p className="text-xs text-arvo-grafite/50">
            Esse evento ainda não tem parcelas cadastradas no croqui.
          </p>
        ) : (
          <div className="grid max-h-40 grid-cols-2 gap-1.5 overflow-y-auto rounded-lg border border-arvo-grafite/15 p-3 sm:grid-cols-3">
            {parcelasDoEvento.map((p) => (
              <label
                key={p.id}
                className="flex items-center gap-1.5 text-sm text-arvo-grafite"
              >
                <input
                  type="checkbox"
                  checked={parcelaIds.includes(p.id)}
                  onChange={() => alternarParcela(p.id)}
                  className="accent-arvo-terracota"
                />
                {p.nome}
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Responsável"
          name="responsavel"
          defaultValue={manejo?.responsavel ?? ""}
          error={state?.fieldErrors?.responsavel}
        />
        <Field
          label="Acompanhamento"
          name="acompanhamento"
          defaultValue={manejo?.acompanhamento ?? ""}
          error={state?.fieldErrors?.acompanhamento}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field
          label="Data"
          name="data"
          type="date"
          defaultValue={manejo ? toDateInputValue(manejo.data) : undefined}
          error={state?.fieldErrors?.data}
        />
        <Field
          label="Hora início"
          name="horaInicio"
          type="time"
          defaultValue={manejo?.horaInicio ?? ""}
          error={state?.fieldErrors?.horaInicio}
        />
        <Field
          label="Hora fim"
          name="horaFim"
          type="time"
          defaultValue={manejo?.horaFim ?? ""}
          error={state?.fieldErrors?.horaFim}
        />
      </div>

      <CollapsibleSection title="Clima">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Temp. início (°C)" name="tempInicio" type="number" step="0.1" defaultValue={manejo?.tempInicio ?? ""} />
          <Field label="Temp. fim (°C)" name="tempFim" type="number" step="0.1" defaultValue={manejo?.tempFim ?? ""} />
          <Field label="Umidade início (%)" name="umidInicio" type="number" step="0.1" defaultValue={manejo?.umidInicio ?? ""} />
          <Field label="Umidade fim (%)" name="umidFim" type="number" step="0.1" defaultValue={manejo?.umidFim ?? ""} />
          <Field label="Vento início (km/h)" name="ventoInicio" type="number" step="0.1" defaultValue={manejo?.ventoInicio ?? ""} />
          <Field label="Vento fim (km/h)" name="ventoFim" type="number" step="0.1" defaultValue={manejo?.ventoFim ?? ""} />
        </div>
        <Field label="Última chuva" name="ultimaChuva" placeholder="Ex: 2 dias atrás" defaultValue={manejo?.ultimaChuva ?? ""} />
      </CollapsibleSection>

      <CollapsibleSection title="Dados específicos" defaultOpen>
        {tipo === "plantio" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Equipamento"
              name="equipamento"
              defaultValue={manejo?.equipamento ?? ""}
              error={state?.fieldErrors?.equipamento}
            />
            <Field label="Qtd. linhas" name="qtdLinhas" type="number" defaultValue={manejo?.qtdLinhas ?? ""} />
            <Field label="Esp. linhas (m)" name="espLinhas" type="number" step="0.01" defaultValue={manejo?.espLinhas ?? ""} />
            <Field label="Profundidade (cm)" name="profundidade" type="number" step="0.1" defaultValue={manejo?.profundidade ?? ""} />
            <Field label="Sementes por metro" name="sementesPorMetro" defaultValue={manejo?.sementesPorMetro ?? ""} />
          </div>
        )}
        {tipo === "aplicacao" && (
          <div>
            <div className="mb-3">
              <span className="mr-2 text-xs text-arvo-grafite/50">
                Preencher padrão:
              </span>
              {Object.keys(PRESETS_APLICACAO).map((nome) => (
                <button
                  key={nome}
                  type="button"
                  onClick={() => aplicarPreset(nome)}
                  className="mr-2 rounded-full border border-arvo-terracota/30 px-2.5 py-1 text-xs font-medium text-arvo-terracota hover:bg-arvo-terracota/5"
                >
                  {nome}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="Tipo de aplicação"
                name="tipoAplicacao"
                defaultValue={manejo?.tipoAplicacao ?? ""}
                error={state?.fieldErrors?.tipoAplicacao}
              />
              <Field label="Ponta" name="ponta" defaultValue={manejo?.ponta ?? ""} />
              <Field label="Volume da ponta" name="volumePonta" defaultValue={manejo?.volumePonta ?? ""} />
              <Field label="Nº de pontas" name="numPontas" type="number" defaultValue={manejo?.numPontas ?? ""} />
              <Field label="Esp. pontas (m)" name="espPontas" type="number" step="0.01" defaultValue={manejo?.espPontas ?? ""} />
              <Field label="Altura da barra (m)" name="altBarra" type="number" step="0.01" defaultValue={manejo?.altBarra ?? ""} />
              <Field label="Pressão (bar)" name="pressao" type="number" step="0.1" defaultValue={manejo?.pressao ?? ""} />
              <Field label="Volume de calda (L/ha)" name="volCalda" type="number" step="0.1" defaultValue={manejo?.volCalda ?? ""} />
              <Field label="Velocidade (km/h)" name="velocidade" type="number" step="0.1" defaultValue={manejo?.velocidade ?? ""} />
            </div>
          </div>
        )}
        {!["plantio", "aplicacao"].includes(tipo) && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Equipamento / material"
              name="equipamento"
              defaultValue={manejo?.equipamento ?? ""}
              error={state?.fieldErrors?.equipamento}
            />
          </div>
        )}
      </CollapsibleSection>

      {tipo === "aplicacao" && (
        <CollapsibleSection title="Produtos" defaultOpen>
          <div className="space-y-4">
            {produtos.map((produto, index) => (
              <div
                key={index}
                className="rounded-lg border border-arvo-grafite/10 p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold text-arvo-grafite/60">
                    Tratamento {produto.numTrat}
                  </p>
                  {produtos.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeProduto(index)}
                      className="text-xs font-medium text-red-600 hover:underline"
                    >
                      Remover
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input
                    placeholder="Nome do produto"
                    value={produto.nome}
                    onChange={(e) => updateProduto(index, "nome", e.target.value)}
                    className="rounded-lg border border-arvo-grafite/15 px-3 py-3 text-sm outline-none focus:border-arvo-terracota"
                  />
                  <input
                    placeholder="Ingrediente ativo"
                    value={produto.ingrediente}
                    onChange={(e) =>
                      updateProduto(index, "ingrediente", e.target.value)
                    }
                    className="rounded-lg border border-arvo-grafite/15 px-3 py-3 text-sm outline-none focus:border-arvo-terracota"
                  />
                  <input
                    placeholder="Dose/ha"
                    value={produto.doseHa}
                    onChange={(e) => updateProduto(index, "doseHa", e.target.value)}
                    className="rounded-lg border border-arvo-grafite/15 px-3 py-3 text-sm outline-none focus:border-arvo-terracota"
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addProduto}
              className="text-sm font-medium text-arvo-terracota hover:underline"
            >
              + Adicionar produto
            </button>
          </div>
        </CollapsibleSection>
      )}

      <div className="mb-4">
        <label
          htmlFor="anotacoes"
          className="mb-1 block text-sm font-medium text-arvo-grafite"
        >
          Anotações
        </label>
        <textarea
          id="anotacoes"
          name="anotacoes"
          rows={3}
          defaultValue={manejo?.anotacoes ?? ""}
          className="w-full rounded-lg border border-arvo-grafite/15 px-3 py-2 text-sm outline-none focus:border-arvo-terracota"
        />
      </div>

      {state?.error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending
          ? "Salvando..."
          : manejo
            ? "Salvar alterações"
            : "Registrar manejo"}
      </Button>
    </form>
  );
}
