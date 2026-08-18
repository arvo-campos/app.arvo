import { requireCliente } from "@/lib/auth";
import { db } from "@/lib/db";
import { AppShell } from "@/components/layout/AppShell";

export default async function ClienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireCliente();
  const pendingCount = await db.manejo.count({
    where: { status: "pendente", evento: { clienteId: session.clienteId! } },
  });

  return (
    <AppShell role={session.role} nome={session.nome} pendingCount={pendingCount}>
      {children}
    </AppShell>
  );
}
