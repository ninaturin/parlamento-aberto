import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { FiltrosProvider } from "@/lib/emendas/tesouro/filters-context";
import { FiltrosAlespProvider } from "@/lib/emendas/alesp/filters-context";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A página que você procura não existe ou foi movida.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Dashboard de Emendas Parlamentares" },
      {
        name: "description",
        content:
          "Painel de transparência das emendas parlamentares impositivas — execução financeira, distribuição e análise temporal, sem inferências.",
      },
      { property: "og:title", content: "Dashboard de Emendas Parlamentares" },
      {
        property: "og:description",
        content:
          "Acompanhe a execução das emendas impositivas com filtros, rankings e séries temporais.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Dashboard de Emendas Parlamentares" },
      { name: "description", content: "Dashboard de Business Intelligence para análise de emendas parlamentares federais, focando em transparência e execução financeira." },
      { property: "og:description", content: "Dashboard de Business Intelligence para análise de emendas parlamentares federais, focando em transparência e execução financeira." },
      { name: "twitter:description", content: "Dashboard de Business Intelligence para análise de emendas parlamentares federais, focando em transparência e execução financeira." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/3dd2509e-99f0-4d71-a4ae-92ffadcaaf60/id-preview-e96f5060--f8b8af54-458c-42ec-9b2a-015f50999c4a.lovable.app-1776955800610.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/3dd2509e-99f0-4d71-a4ae-92ffadcaaf60/id-preview-e96f5060--f8b8af54-458c-42ec-9b2a-015f50999c4a.lovable.app-1776955800610.png" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <FiltrosProvider>
      <FiltrosAlespProvider>
        <Outlet />
        <Toaster />
      </FiltrosAlespProvider>
    </FiltrosProvider>
  );
}
