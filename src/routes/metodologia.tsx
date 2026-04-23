import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { Metodologia } from "@/components/dashboard/Metodologia";

export const Route = createFileRoute("/metodologia")({
  head: () => ({
    meta: [
      { title: "Metodologia e integridade — Dashboard de Emendas" },
      {
        name: "description",
        content:
          "Como cada KPI é calculado, quais campos entram nos filtros e quais dados são deliberadamente excluídos.",
      },
    ],
  }),
  component: MetodologiaPage,
});

function MetodologiaPage() {
  return (
    <AppLayout
      title="Metodologia e integridade"
      subtitle="Fórmulas, filtros e decisões de modelagem aplicadas ao painel"
      showFilters={false}
    >
      <Metodologia />
    </AppLayout>
  );
}
