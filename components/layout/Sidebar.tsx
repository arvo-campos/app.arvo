"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  ClipboardList,
  ClipboardCheck,
  BarChart3,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { logout } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/auth";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const ADMIN_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/eventos", label: "Eventos", icon: CalendarDays },
  { href: "/manejos", label: "Manejos", icon: ClipboardList },
  { href: "/vistorias", label: "Vistorias", icon: ClipboardCheck },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
];

const CLIENTE_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/meus-eventos", label: "Meus Eventos", icon: ClipboardList },
  { href: "/vistorias", label: "Vistorias", icon: ClipboardCheck },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
];

export function Sidebar({
  role,
  nome,
  pendingCount,
}: {
  role: Role;
  nome: string;
  pendingCount: number;
}) {
  const pathname = usePathname();
  const checkboxRef = useRef<HTMLInputElement>(null);
  const items = role === "admin" ? ADMIN_NAV : CLIENTE_NAV;

  // Fecha o menu automaticamente ao navegar — só roda se o JavaScript
  // estiver funcionando; o abrir/fechar em si (abaixo) não depende disso.
  useEffect(() => {
    if (checkboxRef.current) checkboxRef.current.checked = false;
  }, [pathname]);

  return (
    <>
      {/*
        Checkbox escondido controla o menu via CSS puro (":checked"), não via
        onClick do React. Assim o menu abre/fecha mesmo se, por algum motivo,
        o JavaScript da página não tiver terminado de carregar no celular.
      */}
      <input
        ref={checkboxRef}
        type="checkbox"
        id="menu-mobile"
        className="peer hidden"
        aria-hidden="true"
      />

      <div className="flex items-center justify-between border-b border-arvo-terracota/10 bg-white px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/arvo-simbolo-terracota.svg" alt="" className="h-6 w-6" />
          <span className="font-display font-bold text-arvo-grafite">Arvo</span>
        </div>
        <label
          htmlFor="menu-mobile"
          aria-label="Abrir menu"
          className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-lg text-arvo-grafite active:bg-arvo-bg"
        >
          <Menu className="h-7 w-7" />
        </label>
      </div>

      <label
        htmlFor="menu-mobile"
        aria-hidden="true"
        className="fixed inset-0 z-40 hidden bg-black/40 peer-checked:block md:hidden"
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full w-64 shrink-0 -translate-x-full flex-col border-r border-arvo-terracota/10 bg-white transition-transform duration-200 peer-checked:translate-x-0 md:static md:z-auto md:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between gap-2 px-6 py-6">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/arvo-simbolo-terracota.svg"
              alt=""
              className="h-8 w-8"
            />
            <div>
              <p className="font-display text-lg leading-none font-bold text-arvo-grafite">
                Arvo
              </p>
              <p className="text-[10px] tracking-widest text-arvo-terracota uppercase">
                Caderno de Campo
              </p>
            </div>
          </div>
          <label
            htmlFor="menu-mobile"
            aria-label="Fechar menu"
            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg text-arvo-grafite/60 active:bg-arvo-bg md:hidden"
          >
            <X className="h-6 w-6" />
          </label>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {items.map((item) => {
            const active = pathname === item.href;
            const badgeHref = role === "admin" ? "/manejos" : "/meus-eventos";
            const showBadge = item.href === badgeHref && pendingCount > 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition",
                  active
                    ? "bg-arvo-terracota text-arvo-bg"
                    : "text-arvo-grafite/70 hover:bg-arvo-bg"
                )}
              >
                <span className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </span>
                {showBadge && (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-arvo-terracota px-1.5 text-[11px] font-semibold text-white">
                    {pendingCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-arvo-terracota/10 px-4 py-4">
          <p className="truncate px-2 text-sm font-medium text-arvo-grafite">
            {nome}
          </p>
          <p className="px-2 text-xs text-arvo-grafite/50">
            {role === "admin" ? "Administrador" : "Cliente"}
          </p>
          <form action={logout} className="mt-2">
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-arvo-grafite/70 transition hover:bg-arvo-bg"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
