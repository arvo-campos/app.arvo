"use client";

import { useActionState } from "react";
import { uploadFotos, deleteFoto, updateFotoLegenda } from "@/lib/actions/fotos";
import type { FormState } from "@/lib/actions/clientes";
import { Button } from "@/components/ui/Button";

type Foto = {
  id: string;
  url: string;
  legenda: string | null;
  criadoEm: Date;
};

function formatarData(data: Date) {
  return new Intl.DateTimeFormat("pt-BR").format(data);
}

export function FotosGaleria({
  manejoId,
  fotos,
  podeEditar,
}: {
  manejoId: string;
  fotos: Foto[];
  podeEditar: boolean;
}) {
  const action = uploadFotos.bind(null, manejoId);
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    undefined
  );

  if (fotos.length === 0 && !podeEditar) return null;

  return (
    <div className="rounded-2xl border border-arvo-terracota/10 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-arvo-grafite">Fotos</h2>

      {fotos.length === 0 ? (
        <p className="mb-4 text-sm text-arvo-grafite/50">
          Nenhuma foto enviada ainda.
        </p>
      ) : (
        <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {fotos.map((foto) => (
            <div key={foto.id}>
              <div className="group relative aspect-square overflow-hidden rounded-lg border border-arvo-grafite/10 bg-arvo-bg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={foto.url}
                  alt={foto.legenda ?? "Foto do manejo"}
                  className="h-full w-full object-cover"
                />
                {podeEditar && (
                  <form
                    action={deleteFoto}
                    className="absolute top-1 right-1 hidden group-hover:block"
                  >
                    <input type="hidden" name="fotoId" value={foto.id} />
                    <input type="hidden" name="manejoId" value={manejoId} />
                    <button
                      type="submit"
                      title="Remover foto"
                      className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs leading-none text-white"
                    >
                      ×
                    </button>
                  </form>
                )}
              </div>
              <p className="mt-1 text-[11px] text-arvo-grafite/40">
                {formatarData(foto.criadoEm)}
              </p>
              {podeEditar ? (
                <form action={updateFotoLegenda}>
                  <input type="hidden" name="fotoId" value={foto.id} />
                  <input type="hidden" name="manejoId" value={manejoId} />
                  <input
                    name="legenda"
                    defaultValue={foto.legenda ?? ""}
                    placeholder="Adicionar legenda..."
                    onBlur={(e) => e.currentTarget.form?.requestSubmit()}
                    className="mt-0.5 w-full rounded border-none bg-transparent px-0 text-xs text-arvo-grafite/70 outline-none placeholder:text-arvo-grafite/30 focus:bg-arvo-bg focus:px-1"
                  />
                </form>
              ) : (
                foto.legenda && (
                  <p className="mt-0.5 text-xs text-arvo-grafite/70">
                    {foto.legenda}
                  </p>
                )
              )}
            </div>
          ))}
        </div>
      )}

      {podeEditar && (
        <form action={formAction} className="flex flex-wrap items-center gap-3">
          <input
            type="file"
            name="fotos"
            accept="image/*"
            multiple
            className="text-sm text-arvo-grafite/70"
          />
          <Button type="submit" disabled={pending}>
            {pending ? "Enviando..." : "Enviar fotos"}
          </Button>
        </form>
      )}
      {state?.error && (
        <p className="mt-2 text-xs text-red-600">{state.error}</p>
      )}
    </div>
  );
}
