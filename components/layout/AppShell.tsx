import { Sidebar } from "./Sidebar";
import type { Role } from "@/lib/auth";

export function AppShell({
  role,
  nome,
  pendingCount,
  children,
}: {
  role: Role;
  nome: string;
  pendingCount: number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col md:flex-row">
      <Sidebar role={role} nome={nome} pendingCount={pendingCount} />
      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}
