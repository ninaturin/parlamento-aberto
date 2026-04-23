import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { Metodologia } from "@/components/dashboard/Metodologia";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/metodologia")({
  head: () => ({
    meta: [
      { title: "Metodologia e integridade — Dashboard de Emendas" },
      {
        name: "description",
        content:
          "Como cada KPI é calculado, quais campos entram nos filtros e quais dados são deliberadamente excluídos — separado por fonte (Tesouro Nacional e ALESP).",
      },
    ],
  }),
  component: MetodologiaPage,
});

function MetodologiaPage() {
  return (
    <AppLayout
      title="Metodologia e integridade"
      subtitle="Fórmulas, filtros e decisões de modelagem aplicadas ao painel — separadas por fonte"
    >
      <Tabs defaultValue="tesouro" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="tesouro">Tesouro Nacional (federal)</TabsTrigger>
          <TabsTrigger value="alesp">ALESP (estadual SP)</TabsTrigger>
        </TabsList>
        <TabsContent value="tesouro">
          <Metodologia fonte="tesouro" />
        </TabsContent>
        <TabsContent value="alesp">
          <Metodologia fonte="alesp" />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
