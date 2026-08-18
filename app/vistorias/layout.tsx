import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { AppShell } from "@/components/layout/AppShell";

export default async function VistoriaDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  const pendingCount = await db.manejo.count({
    where: {
      status: "pendente",
      ...(session.role === "cliente"
        ? { evento: { clienteId: session.clienteId! } }
        : {}),
    },
  });

  return (
    <AppShell role={session.role} nome={session.nome} pendingCount={pendingCount}>
      {children}
    </AppShell>
  );
}
