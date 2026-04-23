import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Wallet, FileText, TrendingUp, Building2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Kpi } from "@/components/dashboard/Kpi";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { Donut } from "@/components/dashboard/Donut";
import { useFiltros } from "@/lib/emendas/filters-context";
import { isPaga, valorPago } from "@/lib/emendas/data";
import { formatBRL, formatCompactBRL, formatNumber, MESES_PT } from "@/lib/emendas/format";

export const Route = createFileRoute("/visao-geral")({
  head: () => ({
    meta: [
      { title: "Visão Geral — Dashboard de Emendas" },
      {
        name: "description",
        content:
          "KPIs, distribuição por estágio, partido e análise temporal das emendas parlamentares impositivas.",
      },
    ],
  }),
  component: VisaoGeral,
});

function VisaoGeral() {
  const { registrosFiltrados } = useFiltros();
  const [anoDrill, setAnoDrill] = useState<number | null>(null);

  const stats = useMemo(() => {
    let totalPago = 0;
    let countPagas = 0;
    const municipios = new Set<string>();
    const parlamentares = new Set<string>();
    const porEstagio = new Map<string, number>();
    const porPartido = new Map<string, number>();
    const porOrgao = new Map<string, number>();
    const porAno = new Map<number, number>();
    const porAnoMes = new Map<string, number>();

    for (const r of registrosFiltrados) {
      const v = valorPago(r);
      if (isPaga(r)) {
        totalPago += v;
        countPagas++;
        if (r.municipio) municipios.add(r.municipio);
        if (r.parlamentar) parlamentares.add(r.parlamentar);
        if (r.partido) porPartido.set(r.partido, (porPartido.get(r.partido) || 0) + v);
        if (r.orgao) porOrgao.set(r.orgao, (porOrgao.get(r.orgao) || 0) + v);
        if (r.ano != null) porAno.set(r.ano, (porAno.get(r.ano) || 0) + v);
        if (r.data_pagamento) {
          const key = r.data_pagamento.slice(0, 7);
          porAnoMes.set(key, (porAnoMes.get(key) || 0) + v);
        }
      }
      if (r.estagio)
        porEstagio.set(r.estagio, (porEstagio.get(r.estagio) || 0) + (r.valor_decisao || 0));
    }

    return {
      totalPago,
      countPagas,
      ticketMedio: countPagas > 0 ? totalPago / countPagas : 0,
      nMunicipios: municipios.size,
      nParlamentares: parlamentares.size,
      porEstagio,
      porPartido,
      porOrgao,
      porAno,
      porAnoMes,
    };
  }, [registrosFiltrados]);

  const dataEstagio = [...stats.porEstagio.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const dataPartido = [...stats.porPartido.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const dataOrgao = [...stats.porOrgao.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const dataAnos = [...stats.porAno.entries()]
    .map(([ano, valor]) => ({ ano: String(ano), valor, anoNum: ano }))
    .sort((a, b) => a.anoNum - b.anoNum);

  const dataMensal = useMemo(() => {
    const ano = anoDrill ?? dataAnos[dataAnos.length - 1]?.anoNum;
    if (!ano) return [];
    return MESES_PT.map((m, i) => {
      const key = `${ano}-${String(i + 1).padStart(2, "0")}`;
      return { mes: m, valor: stats.porAnoMes.get(key) || 0 };
    });
  }, [anoDrill, dataAnos, stats.porAnoMes]);

  const anoSelecionado = anoDrill ?? dataAnos[dataAnos.length - 1]?.anoNum;

  return (
    <AppLayout
      title="Visão Geral"
      subtitle="Indicadores agregados das emendas parlamentares impositivas"
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Kpi
          icon={Wallet}
          label="Total Pago"
          value={formatCompactBRL(stats.totalPago)}
          hint={formatBRL(stats.totalPago)}
        />
        <Kpi
          icon={FileText}
          label="Nº de Pagamentos"
          value={formatNumber(stats.countPagas)}
          hint="emendas no estágio Pagas"
        />
        <Kpi
          icon={TrendingUp}
          label="Ticket Médio"
          value={formatBRL(stats.ticketMedio)}
          hint="por emenda paga"
        />
        <Kpi
          icon={Building2}
          label="Municípios Beneficiados"
          value={formatNumber(stats.nMunicipios)}
          hint={`${stats.nParlamentares} parlamentares`}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Distribuição por Estágio"
          description="Inclui todos os estágios (Pagas, Impedidas, Empenhadas, Em processamento)"
        >
          <Donut data={dataEstagio} />
        </SectionCard>
        <SectionCard title="Top Partidos por Valor Pago" description="Soma do valor pago por partido do parlamentar">
          <Donut data={dataPartido} />
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-4">
        <SectionCard
          title="Análise Temporal Anual"
          description="Clique em um ano para ver o detalhamento mensal"
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dataAnos} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="ano" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
              <YAxis
                tickFormatter={(v) => formatCompactBRL(v)}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                width={80}
              />
              <Tooltip
                formatter={(v: number) => [formatBRL(v), "Pago"]}
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar
                dataKey="valor"
                radius={[8, 8, 0, 0]}
                onClick={(d) => setAnoDrill((d as { anoNum: number }).anoNum)}
                style={{ cursor: "pointer" }}
              >
                {dataAnos.map((d) => (
                  <Cell
                    key={d.ano}
                    fill={
                      d.anoNum === anoSelecionado ? "var(--chart-1)" : "var(--chart-2)"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard
          title={`Detalhamento Mensal — ${anoSelecionado ?? "—"}`}
          description="Sazonalidade dos pagamentos ao longo dos meses"
          action={
            anoDrill != null && (
              <button
                onClick={() => setAnoDrill(null)}
                className="text-xs text-secondary hover:underline"
              >
                limpar seleção
              </button>
            )
          }
        >
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={dataMensal} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
              <YAxis
                tickFormatter={(v) => formatCompactBRL(v)}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                width={80}
              />
              <Tooltip
                formatter={(v: number) => [formatBRL(v), "Pago"]}
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="valor"
                stroke="var(--chart-1)"
                strokeWidth={2.5}
                dot={{ fill: "var(--chart-1)", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard
          title="Top Órgãos Processadores"
          description="Soma do valor pago por órgão executor"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={dataOrgao}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                type="number"
                tickFormatter={(v) => formatCompactBRL(v)}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                width={140}
              />
              <Tooltip
                formatter={(v: number) => [formatBRL(v), "Pago"]}
                contentStyle={{
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="value" fill="var(--chart-2)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>
    </AppLayout>
  );
}
