import Link from "next/link";

type Barra = {
  status: string;
  label: string;
  total: number;
  corBarra: string;
  corTexto: string;
};

type ClientePendencia = {
  clienteId: string;
  clienteNome: string;
  pendentes: number;
};

export function StatusAprovacaoCard({
  aprovados,
  pendentes,
  reprovados,
  porCliente,
}: {
  aprovados: number;
  pendentes: number;
  reprovados: number;
  porCliente: ClientePendencia[];
}) {
  const totalAvaliavel = aprovados + pendentes + reprovados;

  const barras: Barra[] = [
    { status: "aprovado", label: "Aprovados", total: aprovados, corBarra: "bg-blue-600", corTexto: "text-blue-700" },
    { status: "pendente", label: "Pendentes", total: pendentes, corBarra: "bg-arvo-terracota", corTexto: "text-arvo-terracota" },
    { status: "reprovado", label: "Reprovados", total: reprovados, corBarra: "bg-red-600", corTexto: "text-red-700" },
  ];

  return (
    <div className="rounded-2xl border border-arvo-terracota/10 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-arvo-grafite">
        Status de aprovações
      </h2>

      <div className="mt-4 space-y-3">
        {barras.map((barra) => {
          const percentual =
            totalAvaliavel > 0 ? Math.round((barra.total / totalAvaliavel) * 100) : 0;
          return (
            <Link
              key={barra.status}
              href={`/manejos?status=${barra.status}`}
              className="block rounded-lg transition hover:bg-arvo-bg"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="text-arvo-grafite/70">{barra.label}</span>
                <span className={`font-semibold ${barra.corTexto}`}>
                  {barra.total} ({percentual}%)
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-arvo-grafite/10">
                <div
                  className={`h-full rounded-full ${barra.corBarra}`}
                  style={{ width: `${percentual}%` }}
                />
              </div>
            </Link>
          );
        })}
      </div>

      {porCliente.length > 0 && (
        <>
          <p className="mt-5 mb-2 text-xs font-semibold tracking-wide text-arvo-grafite/40 uppercase">
            Por cliente
          </p>
          <div className="divide-y divide-arvo-grafite/5">
            {porCliente.map((c) => (
              <Link
                key={c.clienteId}
                href={
                  c.pendentes > 0
                    ? `/manejos?clienteId=${c.clienteId}&status=pendente`
                    : `/manejos?clienteId=${c.clienteId}`
                }
                className="flex items-center justify-between py-2.5 text-sm transition hover:bg-arvo-bg"
              >
                <span className="text-arvo-grafite">{c.clienteNome}</span>
                {c.pendentes > 0 ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-arvo-terracota/15 px-2.5 py-1 text-xs font-medium text-arvo-terracota">
                    <span className="h-1.5 w-1.5 rounded-full bg-arvo-terracota" />
                    {c.pendentes} pendente{c.pendentes === 1 ? "" : "s"}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                    Em dia
                  </span>
                )}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
