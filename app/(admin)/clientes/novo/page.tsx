import { ClienteForm } from "@/components/clientes/ClienteForm";

export default function NovoClientePage() {
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-bold text-arvo-grafite">
        Novo cliente
      </h1>
      <p className="mt-1 text-sm text-arvo-grafite/60">
        Cadastre um novo cliente para vincular eventos e manejos a ele.
      </p>
      <div className="mt-6">
        <ClienteForm />
      </div>
    </div>
  );
}
