import type { ReactNode } from "react";
import { AppSidebar, MobileNav } from "./AppSidebar";

export function AppLayout({
  children,
  title,
  subtitle,
  filterBar,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  filterBar?: ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNav />
        {title && (
          <header className="border-b border-border bg-card px-6 py-5">
            <h1 className="text-2xl font-semibold text-primary">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </header>
        )}
        {filterBar}
        <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
        <footer className="border-t border-border px-6 py-4 text-center text-xs text-muted-foreground">
          Dashboard de Emendas Parlamentares · Tesouro Nacional + ALESP · Sem inferências sobre valores
        </footer>
      </div>
    </div>
  );
}
