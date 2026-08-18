import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ClienteForm } from "@/components/clientes/ClienteForm";
import { DeleteClienteButton } from "@/components/clientes/DeleteClienteButton";
import { UsuariosCliente } from "@/components/clientes/UsuariosCliente";

export default async function EditarClientePage(
  props: PageProps<"/clientes/[id]/editar">
) {
  const { id } = await props.params;
  const cliente = await db.cliente.findUnique({
    where: { id },
    include: { usuarios: { orderBy: { createdAt: "asc" }, select: { id: true, nome: true, email: true } } },
  });
  if (!cliente) notFound();

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-arvo-grafite">
        Editar cliente
      </h1>
      <p className="mt-1 text-sm text-arvo-grafite/60">{cliente.nome}</p>
      <div className="mt-6">
        <ClienteForm cliente={cliente} />
      </div>
      <div className="mt-4 flex justify-end">
        <DeleteClienteButton clienteId={cliente.id} clienteNome={cliente.nome} />
      </div>

      <div className="mt-8">
        <UsuariosCliente clienteId={cliente.id} usuarios={cliente.usuarios} />
      </div>
    </div>
  );
}
