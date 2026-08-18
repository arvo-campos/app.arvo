import { db } from "@/lib/db";
import { EventoForm } from "@/components/eventos/EventoForm";

export default async function NovoEventoPage() {
  const clientes = await db.cliente.findMany({
    orderBy: { nome: "asc" },
    select: { id: true, nome: true },
  });

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-arvo-grafite">
        Novo evento
      </h1>
      <p className="mt-1 text-sm text-arvo-grafite/60">
        Cadastre um novo campo demonstrativo vinculado a um cliente.
      </p>
      <div className="mt-6">
        <EventoForm clientes={clientes} />
      </div>
    </div>
  );
}
