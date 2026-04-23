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
import { formatBRL, formatCompactBRL, formatNumber, MESES_PT } from "@/lib/emendas/format";

export const Route = createFileRoute("/visao-geral")({
  head: () => ({
    meta: [
      { title: "Visão Geral — Dashboard de Emendas Parlamentares Federais" },
      {
        name: "description",
        content:
          "KPIs, distribuição por tipo de emenda e categoria econômica, e análise temporal das transferências federais a estados e municípios.",
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
    const obs = new Set<string>();
    const entes = new Set<string>();
    const porTipoEmenda = new Map<string, number>();
    const porCategoria = new Map<string, number>();
    const porTipoEnte = new Map<string, number>();
    const porAno = new Map<number, number>();
    const porAnoMes = new Map<string, number>();

    for (const r of registrosFiltrados) {
      const v = r.valor_pago;
      totalPago += v;
      obs.add(r.ob);
      entes.add(r.ente + "|" + r.uf);
      porTipoEmenda.set(r.tipo_emenda, (porTipoEmenda.get(r.tipo_emenda) || 0) + v);
      porCategoria.set(
        r.categoria_economica,
        (porCategoria.get(r.categoria_economica) || 0) + v,
      );
      porTipoEnte.set(r.tipo_ente, (porTipoEnte.get(r.tipo_ente) || 0) + v);
      porAno.set(r.ano, (porAno.get(r.ano) || 0) + v);
      const key = `${r.ano}-${String(r.mes).padStart(2, "0")}`;
      porAnoMes.set(key, (porAnoMes.get(key) || 0) + v);
    }

    return {
      totalPago,
      countOB: obs.size,
      countTransf: registrosFiltrados.length,
      ticketMedio: registrosFiltrados.length > 0 ? totalPago / registrosFiltrados.length : 0,
      nEntes: entes.size,
      porTipoEmenda,
      porCategoria,
      porTipoEnte,
      porAno,
      porAnoMes,
    };
  }, [registrosFiltrados]);

  const dataTipoEmenda = [...stats.porTipoEmenda.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const dataCategoria = [...stats.porCategoria.entries()]
    .map(([name, value]) => ({
      name: name.replace("DESPESAS ", "").toLowerCase().replace(/^\w/, (c) => c.toUpperCase()),
      value,
    }))
    .sort((a, b) => b.value - a.value);

  const dataTipoEnte = [...stats.porTipoEnte.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

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
      subtitle="Indicadores agregados das transferências de Emendas Parlamentares Federais (Tesouro Nacional)"
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
          label="Nº de Transferências"
          value={formatNumber(stats.countTransf)}
          hint={`${formatNumber(stats.countOB)} ordens bancárias únicas`}
        />
        <Kpi
          icon={TrendingUp}
          label="Ticket Médio"
          value={formatBRL(stats.ticketMedio)}
          hint="por transferência (OB)"
        />
        <Kpi
          icon={Building2}
          label="Entes Beneficiados"
          value={formatNumber(stats.nEntes)}
          hint="estados + municípios distintos"
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <SectionCard
          title="Tipo de Emenda"
          description="Individual vs Bancada — soma do valor pago"
        >
          <Donut data={dataTipoEmenda} />
        </SectionCard>
        <SectionCard
          title="Categoria Econômica"
          description="Despesas correntes vs despesas de capital"
        >
          <Donut data={dataCategoria} />
        </SectionCard>
        <SectionCard
          title="Tipo de Ente"
          description="Estados vs municípios — destino final dos recursos"
        >
          <Donut data={dataTipoEnte} />
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
                    fill={d.anoNum === anoSelecionado ? "var(--chart-1)" : "var(--chart-2)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard
          title={`Detalhamento Mensal — ${anoSelecionado ?? "—"}`}
          description="Sazonalidade dos pagamentos ao longo dos meses (picos típicos no fim do exercício)"
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
      </div>
    </AppLayout>
  );
}
