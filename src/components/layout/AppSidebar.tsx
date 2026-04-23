import { Link, useLocation } from "@tanstack/react-router";
import { Home, LayoutDashboard, BarChart3, Filter, Mail, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Início", icon: Home, exact: true },
  { to: "/visao-geral", label: "Visão Geral", icon: LayoutDashboard },
  { to: "/visao-detalhada", label: "Visão Detalhada", icon: BarChart3 },
  { to: "/filtros", label: "Filtros", icon: Filter },
  { to: "/contato", label: "Contato", icon: Mail },
] as const;

export function AppSidebar() {
  const { pathname } = useLocation();
  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
      <div className="flex flex-col items-center gap-3 px-6 pb-6 pt-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sidebar-accent">
          <Building2 className="h-8 w-8 text-sidebar-primary" />
        </div>
        <div className="text-center">
          <p className="text-xs uppercase tracking-wider text-sidebar-foreground/70">
            Transparência
          </p>
          <p className="text-sm font-semibold">Emendas Parlamentares</p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {items.map((it) => {
          const active = it.exact ? pathname === it.to : pathname.startsWith(it.to);
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                  : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{it.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="px-6 py-4 text-[10px] leading-relaxed text-sidebar-foreground/60">
        Dados públicos da Assembleia Legislativa do Estado de São Paulo (ALESP).
      </div>
    </aside>
  );
}

export function MobileNav() {
  const { pathname } = useLocation();
  return (
    <nav className="flex gap-1 overflow-x-auto bg-sidebar px-2 py-2 md:hidden">
      {items.map((it) => {
        const active = it.exact ? pathname === it.to : pathname.startsWith(it.to);
        const Icon = it.icon;
        return (
          <Link
            key={it.to}
            to={it.to}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-xs font-medium",
              active
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground/85",
            )}
          >
            <Icon className="h-4 w-4" />
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
