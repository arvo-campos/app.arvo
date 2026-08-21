"use client";

import { useEffect, useState } from "react";
import {
  listarManejosPendentes,
  onFilaMudar,
  removerManejoPendente,
  sincronizarManejosPendentes,
  type ManejoPendente,
} from "@/lib/offline/manejoQueue";

function formatarHora(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ManejosPendentesBanner() {
  const [pendentes, setPendentes] = useState<ManejoPendente[]>([]);
  const [sincronizando, setSincronizando] = useState(false);
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    function recarregar() {
      listarManejosPendentes().then(setPendentes);
    }
    recarregar();
    const desinscrever = onFilaMudar(recarregar);

    async function tentarSincronizar() {
      setSincronizando(true);
      try {
        await sincronizarManejosPendentes();
      } finally {
        setSincronizando(false);
      }
    }
    if (navigator.onLine) tentarSincronizar();
    window.addEventListener("online", tentarSincronizar);

    return () => {
      desinscrever();
      window.removeEventListener("online", tentarSincronizar);
    };
  }, []);

  if (pendentes.length === 0) return null;

  return (
    <div className="sticky top-0 z-40 border-b border-arvo-terracota/20 bg-arvo-terracota/10">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-2 text-left"
      >
        <span className="text-sm font-medium text-arvo-terracota">
          {sincronizando
            ? "Enviando manejos pendentes…"
            : `${pendentes.length} manejo(s) salvo(s) offline, aguardando envio`}
        </span>
        <span className="text-xs font-medium text-arvo-terracota underline">
          {aberto ? "fechar" : "ver"}
        </span>
      </button>
      {aberto && (
        <ul className="space-y-2 px-4 pb-3">
          {pendentes.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm"
            >
              <div>
                <p className="font-medium text-arvo-grafite">
                  {item.tipoLabel} — {item.eventoNome}
                </p>
                <p className="text-xs text-arvo-grafite/50">
                  {item.erro
                    ? `Erro ao enviar: ${item.erro}`
                    : `Salvo às ${formatarHora(item.criadoEm)}, aguardando conexão`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removerManejoPendente(item.id)}
                className="text-xs font-medium text-red-600 hover:underline"
              >
                Descartar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
