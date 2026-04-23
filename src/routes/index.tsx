import { createFileRoute, Link } from "@tanstack/react-router";
import { LayoutDashboard, Landmark, Building2, Mail, ArrowRight, CalendarClock } from "lucide-react";
import { dataset } from "@/lib/emendas/tesouro/data";
import { datasetAlesp } from "@/lib/emendas/alesp/data";
import { Card, CardContent } from "@/components/ui/card";
import { AppSidebar, MobileNav } from "@/components/layout/AppSidebar";

function formatISODate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}
function formatIntBRL(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Início — Dashboard de Emendas Parlamentares" },
      {
        name: "description",
        content:
          "Painel de transparência das emendas parlamentares — duas fontes oficiais: Tesouro Nacional (SIAFI, federal) e ALESP (Assembleia Legislativa de SP, estadual).",
      },
    ],
  }),
  component: Index,
});

const cards = [
  {
    to: "/visao-geral" as const,
    title: "Visão Geral",
    desc: "Comparativo consolidado entre as duas fontes — Tesouro Nacional e ALESP.",
    icon: LayoutDashboard,
  },
  {
    to: "/dados-tesouro" as const,
    title: "Dados Tesouro Nacional",
    desc: "Transferências federais (SIAFI) — KPIs, UF, ranking de entes e tabela exportável.",
    icon: Landmark,
  },
  {
    to: "/dados-alesp" as const,
    title: "Dados ALESP",
    desc: "Emendas estaduais SP (LOA) — parlamentares, partidos, municípios e estágios.",
    icon: Building2,
  },
  {
    to: "/contato" as const,
    title: "Contato",
    desc: "Fale com a equipe responsável pelo painel.",
    icon: Mail,
  },
];

function Index() {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNav />
        <section
          className="relative overflow-hidden px-6 py-16 text-primary-foreground md:px-12 md:py-24"
          style={{ background: "var(--gradient-hero)" }}
        >
          <div className="absolute inset-0 opacity-10">
            <svg
              className="h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden
            >
              <path d="M0,80 L20,60 L40,70 L60,40 L80,55 L100,30 L100,100 L0,100 Z" fill="white" />
            </svg>
          </div>
          <div className="relative max-w-4xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-primary-foreground/80">
              Transparência · Dados Abertos
            </p>
            <h1 className="text-4xl font-bold leading-tight md:text-6xl">
              Dashboard
              <br />
              <span className="text-primary-foreground/90">Emendas Parlamentares</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base text-primary-foreground/85 md:text-lg">
              Duas fontes oficiais lado a lado: <strong>Tesouro Nacional (SIAFI)</strong> para
              transferências federais a estados, DF e municípios, e <strong>ALESP</strong> para as
              emendas estaduais paulistas (LOA). Sem inferências sobre valores indicados ou
              empenhados.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-4 py-2 text-xs backdrop-blur">
                <CalendarClock className="h-3.5 w-3.5" />
                Tesouro: {formatISODate(dataset.gerado_em)} ·{" "}
                {formatIntBRL(dataset.registros.length)} transferências
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-4 py-2 text-xs backdrop-blur">
                <CalendarClock className="h-3.5 w-3.5" />
                ALESP: {formatISODate(datasetAlesp.gerado_em)} ·{" "}
                {formatIntBRL(datasetAlesp.registros.length)} emendas
              </span>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 py-12 md:px-12">
          <h2 className="mb-6 text-lg font-semibold text-primary">Navegue pelo painel</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {cards.map(({ to, title, desc, icon: Icon }) => (
              <Link key={to} to={to} className="group">
                <Card className="h-full border-border bg-card shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]">
                  <CardContent className="flex h-full flex-col gap-4 p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-primary">{title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
                    </div>
                    <div className="flex items-center gap-1 text-sm font-medium text-secondary">
                      Acessar
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="mt-10 rounded-xl border border-border bg-muted/40 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-primary">Fontes e metodologia</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  <strong>Tesouro Nacional (SIAFI):</strong> {dataset.fonte}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  <strong>ALESP:</strong> {datasetAlesp.fonte}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Os datasets são independentes — filtros e métricas não se misturam. Veja a página
                  de Metodologia para entender como cada KPI é calculado em cada fonte.
                </p>
              </div>
              <Link
                to="/metodologia"
                className="shrink-0 rounded-md border border-border bg-card px-3 py-2 text-xs font-medium text-secondary transition-colors hover:bg-accent"
              >
                Ver metodologia →
              </Link>
            </div>
          </div>
        </section>
        <footer className="border-t border-border px-6 py-4 text-center text-xs text-muted-foreground">
          Dashboard de Emendas Parlamentares · Tesouro Nacional (SIAFI) + ALESP
        </footer>
      </div>
    </div>
  );
}
