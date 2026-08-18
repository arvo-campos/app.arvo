import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { AppShell } from "@/components/layout/AppShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();
  const pendingCount = await db.manejo.count({
    where: { status: "pendente" },
  });

  return (
    <AppShell role={session.role} nome={session.nome} pendingCount={pendingCount}>
      {children}
    </AppShell>
  );
}
