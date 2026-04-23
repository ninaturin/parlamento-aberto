import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Wallet, FileText, Landmark, Building2, ArrowRight } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Kpi } from "@/components/dashboard/Kpi";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { Donut } from "@/components/dashboard/Donut";
import { dataset } from "@/lib/emendas/tesouro/data";
import { datasetAlesp } from "@/lib/emendas/alesp/data";
import { formatBRL, formatCompactBRL, formatNumber } from "@/lib/emendas/format";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/visao-geral")({
  head: () => ({
    meta: [
      { title: "Visão Geral — Comparativo Tesouro Nacional × ALESP" },
      {
        name: "description",
        content:
          "Comparativo consolidado entre as duas fontes de emendas parlamentares: Tesouro Nacional (federal) e ALESP (estadual SP).",
      },
    ],
  }),
  component: VisaoGeral,
});

function VisaoGeral() {
  const stats = useMemo(() => {
    let totalTesouro = 0;
    const obs = new Set<string>();
    const porAnoTesouro = new Map<number, number>();
    for (const r of dataset.registros) {
      totalTesouro += r.valor_pago;
      obs.add(r.ob);
      porAnoTesouro.set(r.ano, (porAnoTesouro.get(r.ano) || 0) + r.valor_pago);
    }

    let totalAlespIndicado = 0;
    let totalAlespPago = 0;
    let countPagas = 0;
    const porAnoAlespPago = new Map<number, number>();
    const porAnoAlespIndic = new Map<number, number>();
    for (const r of datasetAlesp.registros) {
      totalAlespIndicado += r.valor;
      porAnoAlespIndic.set(r.ano, (porAnoAlespIndic.get(r.ano) || 0) + r.valor);
      if (r.estagio === "Pagas") {
        totalAlespPago += r.valor;
        countPagas += 1;
        porAnoAlespPago.set(r.ano, (porAnoAlespPago.get(r.ano) || 0) + r.valor);
      }
    }

    const anos = [
      ...new Set([
        ...porAnoTesouro.keys(),
        ...porAnoAlespPago.keys(),
        ...porAnoAlespIndic.keys(),
      ]),
    ].sort((a, b) => a - b);

    const serieAnual = anos.map((ano) => ({
      ano: String(ano),
      Tesouro: porAnoTesouro.get(ano) || 0,
      "ALESP (Pago)": porAnoAlespPago.get(ano) || 0,
      "ALESP (Indicado)": porAnoAlespIndic.get(ano) || 0,
    }));

    return {
      totalTesouro,
      countTesouro: dataset.registros.length,
      countObsTesouro: obs.size,
      totalAlespIndicado,
      totalAlespPago,
      countAlesp: datasetAlesp.registros.length,
      countPagas,
      serieAnual,
    };
  }, []);

  const donutFontes = [
    { name: "Tesouro Nacional (Pago)", value: stats.totalTesouro },
    { name: "ALESP (Pago)", value: stats.totalAlespPago },
  ];

  return (
    <AppLayout
      title="Visão Geral"
      subtitle="Comparativo consolidado entre Tesouro Nacional (federal) e ALESP (estadual SP)"
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Kpi
          icon={Landmark}
          label="Tesouro · Total Pago"
          value={formatCompactBRL(stats.totalTesouro)}
          hint={formatBRL(stats.totalTesouro)}
        />
        <Kpi
          icon={FileText}
          label="Tesouro · Transferências"
          value={formatNumber(stats.countTesouro)}
          hint={`${formatNumber(stats.countObsTesouro)} OBs únicas`}
        />
        <Kpi
          icon={Building2}
          label="ALESP · Total Pago"
          value={formatCompactBRL(stats.totalAlespPago)}
          hint={`${formatNumber(stats.countPagas)} emendas pagas`}
        />
        <Kpi
          icon={Wallet}
          label="ALESP · Total Indicado"
          value={formatCompactBRL(stats.totalAlespIndicado)}
          hint={`${formatNumber(stats.countAlesp)} emendas no total`}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Distribuição por fonte"
          description="Volume relativo dos pagamentos das duas fontes"
        >
          <Donut data={donutFontes} />
        </SectionCard>
        <SectionCard
          title="Série temporal anual"
          description="Pagamentos do Tesouro × ALESP, com indicações da ALESP em destaque"
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.serieAnual} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="ano" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
              <YAxis
                tickFormatter={(v) => formatCompactBRL(v)}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                width={80}
              />
              <Tooltip
                formatter={(v: number, name) => [formatBRL(v), name as string]}
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Tesouro" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="ALESP (Pago)" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="ALESP (Indicado)" fill="var(--chart-4)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Link to="/dados-tesouro" className="group">
          <Card className="h-full border-border bg-card shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
                <Landmark className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-primary">
                  Aprofundar — Tesouro Nacional
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  KPIs, UF, ranking de entes, Pareto e tabela exportável.
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-secondary transition-transform group-hover:translate-x-1" />
            </CardContent>
          </Card>
        </Link>
        <Link to="/dados-alesp" className="group">
          <Card className="h-full border-border bg-card shadow-[var(--shadow-card)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-elevated)]">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-primary">Aprofundar — ALESP</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Parlamentares, partidos, municípios, estágios e funções.
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-secondary transition-transform group-hover:translate-x-1" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </AppLayout>
  );
}
