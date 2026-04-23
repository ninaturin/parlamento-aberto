import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { useFiltros } from "@/lib/emendas/filters-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/filtros")({
  head: () => ({
    meta: [{ title: "Filtros — Dashboard de Emendas" }],
  }),
  component: FiltrosPage,
});

function FiltrosPage() {
  const { filtros, reset, registrosFiltrados, registros } = useFiltros();
  const grupos: { label: string; values: (string | number)[] }[] = [
    { label: "Anos", values: filtros.anos },
    { label: "UFs", values: filtros.ufs },
    { label: "Tipo de Ente", values: filtros.tiposEnte },
    { label: "Tipo de Emenda", values: filtros.tiposEmenda },
    { label: "Categoria Econômica", values: filtros.categorias },
    { label: "Transferência Especial", values: filtros.transfEspecial },
  ];

  return (
    <AppLayout title="Filtros" subtitle="Refine os dados exibidos em todas as páginas">
      <SectionCard
        title="Filtros aplicados"
        description={`${registrosFiltrados.length.toLocaleString("pt-BR")} de ${registros.length.toLocaleString("pt-BR")} registros visíveis`}
        action={
          <Button onClick={reset} variant="outline" size="sm">
            Limpar todos
          </Button>
        }
      >
        <div className="space-y-4">
          {grupos.map((g) => (
            <div key={g.label}>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {g.label}
              </p>
              {g.values.length === 0 ? (
                <p className="text-xs italic text-muted-foreground">— sem filtros —</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {g.values.map((v) => (
                    <Badge key={String(v)} variant="secondary">
                      {String(v)}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          Use a barra de filtros no topo de cada página para selecionar múltiplos valores. Os
          filtros persistem ao navegar entre{" "}
          <Link to="/visao-geral" className="underline">
            Visão Geral
          </Link>{" "}
          e{" "}
          <Link to="/visao-detalhada" className="underline">
            Visão Detalhada
          </Link>
          .
        </p>
      </SectionCard>
    </AppLayout>
  );
}
