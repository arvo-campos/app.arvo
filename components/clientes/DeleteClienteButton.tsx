"use client";

import { deleteCliente } from "@/lib/actions/clientes";
import { Button } from "@/components/ui/Button";

export function DeleteClienteButton({
  clienteId,
  clienteNome,
}: {
  clienteId: string;
  clienteNome: string;
}) {
  return (
    <form
      action={deleteCliente}
      onSubmit={(e) => {
        const confirmado = window.confirm(
          `Excluir "${clienteNome}"? Isso também apaga todos os eventos e manejos ligados a esse cliente. Essa ação não pode ser desfeita.`
        );
        if (!confirmado) e.preventDefault();
      }}
    >
      <input type="hidden" name="clienteId" value={clienteId} />
      <Button type="submit" variant="danger">
        Excluir cliente
      </Button>
    </form>
  );
}
