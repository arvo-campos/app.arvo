"use client";

import { deleteFotoVistoria, updateFotoVistoriaLegenda } from "@/lib/actions/fotosVistoria";

type Foto = {
  id: string;
  url: string;
  legenda: string | null;
  criadoEm: Date;
  parcela: { id: string; nome: string } | null;
};

function formatarData(data: Date) {
  return new Intl.DateTimeFormat("pt-BR").format(data);
}

export function FotosVistoriaGaleria({
  vistoriaId,
  fotos,
  podeEditar,
}: {
  vistoriaId: string;
  fotos: Foto[];
  podeEditar: boolean;
}) {
  if (fotos.length === 0) return null;

  return (
    <div className="rounded-2xl border border-arvo-terracota/10 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-arvo-grafite">Fotos</h2>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {fotos.map((foto) => (
          <div key={foto.id}>
            <div className="group relative aspect-square overflow-hidden rounded-lg border border-arvo-grafite/10 bg-arvo-bg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={foto.url}
                alt={foto.legenda ?? "Foto da vistoria"}
                className="h-full w-full object-cover"
              />
              {podeEditar && (
                <form
                  action={deleteFotoVistoria}
                  className="absolute top-1 right-1"
                >
                  <input type="hidden" name="fotoId" value={foto.id} />
                  <input type="hidden" name="vistoriaId" value={vistoriaId} />
                  <button
                    type="submit"
                    title="Remover foto"
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs leading-none text-white"
                  >
                    ×
                  </button>
                </form>
              )}
            </div>
            <p className="mt-1 text-[11px] text-arvo-grafite/40">
              {formatarData(foto.criadoEm)}
              {foto.parcela ? ` · ${foto.parcela.nome}` : ""}
            </p>
            {podeEditar ? (
              <form action={updateFotoVistoriaLegenda}>
                <input type="hidden" name="fotoId" value={foto.id} />
                <input type="hidden" name="vistoriaId" value={vistoriaId} />
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
    </div>
  );
}
