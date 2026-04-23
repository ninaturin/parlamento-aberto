import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Wallet, FileText, TrendingUp, Users, Download, Search } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Kpi } from "@/components/dashboard/Kpi";
import { SectionCard } from "@/components/dashboard/SectionCard";
import { Donut } from "@/components/dashboard/Donut";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FiltrosBarAlesp } from "@/components/layout/FiltrosBarAlesp";
import { useFiltrosAlesp } from "@/lib/emendas/alesp/filters-context";
import { formatBRL, formatCompactBRL, formatNumber, MESES_PT } from "@/lib/emendas/format";
import type { EmendaAlesp } from "@/lib/emendas/alesp/types";

export const Route = createFileRoute("/dados-alesp")({
  head: () => ({
    meta: [
      { title: "Dados ALESP — Emendas Parlamentares Estaduais (SP)" },
      {
        name: "description",
        content:
          "Dataset completo das emendas parlamentares estaduais da Assembleia Legislativa de SP — KPIs, parlamentares, partidos, municípios, estágios e tabela exportável.",
      },
    ],
  }),
  component: DadosAlesp,
});

type SortKey =
  | "municipio"
  | "parlamentar"
  | "partido"
  | "orgao"
  | "estagio"
  | "ano"
  | "mes"
  | "valor";

function DadosAlesp() {
  const { registrosFiltrados } = useFiltrosAlesp();
  const [anoDrill, setAnoDrill] = useState<number | null>(null);
  const [busca, setBusca] = useState("");
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>("valor");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const pageSize = 20;

  const stats = useMemo(() => {
    let totalIndicado = 0;
    let totalPago = 0;
    let countPagas = 0;
    const parlamentaresSet = new Set<string>();
    const porEstagio = new Map<string, number>();
    const porPartido = new Map<string, number>();
    const porFuncao = new Map<string, number>();
    const porAno = new Map<number, number>();
    const porAnoMes = new Map<string, number>();
    const porMunicipio = new Map<string, number>();
    const porParlamentar = new Map<string, number>();

    for (const r of registrosFiltrados) {
      totalIndicado += r.valor;
      parlamentaresSet.add(r.parlamentar);
      porEstagio.set(r.estagio, (porEstagio.get(r.estagio) || 0) + r.valor);
      porPartido.set(r.partido, (porPartido.get(r.partido) || 0) + r.valor);
      porFuncao.set(r.funcao, (porFuncao.get(r.funcao) || 0) + r.valor);
      porAno.set(r.ano, (porAno.get(r.ano) || 0) + r.valor);
      if (r.mes > 0) {
        const key = `${r.ano}-${String(r.mes).padStart(2, "0")}`;
        porAnoMes.set(key, (porAnoMes.get(key) || 0) + r.valor);
      }
      porMunicipio.set(r.municipio, (porMunicipio.get(r.municipio) || 0) + r.valor);
      porParlamentar.set(r.parlamentar, (porParlamentar.get(r.parlamentar) || 0) + r.valor);
      if (r.estagio === "Pagas") {
        totalPago += r.valor;
        countPagas += 1;
      }
    }

    const topMun = [...porMunicipio.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    const topPar = [...porParlamentar.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    let acum = 0;
    const pareto = topPar.slice(0, 30).map((d) => {
      acum += d.value;
      return { name: d.name, valor: d.value, percAcum: totalIndicado > 0 ? (acum / totalIndicado) * 100 : 0 };
    });

    return {
      totalIndicado,
      totalPago,
      countTotal: registrosFiltrados.length,
      countPagas,
      ticketMedioPago: countPagas > 0 ? totalPago / countPagas : 0,
      nParlamentares: parlamentaresSet.size,
      porEstagio,
      porPartido,
      porFuncao,
      porAno,
      porAnoMes,
      topMun: topMun.slice(0, 20),
      topPar: topPar.slice(0, 20),
      pareto,
    };
  }, [registrosFiltrados]);

  const dataEstagio = [...stats.porEstagio.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
  const dataPartido = [...stats.porPartido.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
  const dataFuncao = [...stats.porFuncao.entries()]
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

  const filtered = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return registrosFiltrados;
    return registrosFiltrados.filter((r) =>
      [r.municipio, r.parlamentar, r.partido, r.orgao, r.estagio, r.beneficiario, r.objeto, r.id].some(
        (v) => String(v).toLowerCase().includes(q),
      ),
    );
  }, [busca, registrosFiltrados]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const av = a[sortKey] as string | number;
      const bv = b[sortKey] as string | number;
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const paged = sorted.slice(page * pageSize, page * pageSize + pageSize);
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir("desc");
    }
    setPage(0);
  };

  const exportCSV = () => {
    const header = [
      "id",
      "municipio",
      "parlamentar",
      "partido",
      "orgao",
      "natureza",
      "funcao",
      "beneficiario",
      "estagio",
      "objeto",
      "ano",
      "mes",
      "valor",
    ];
    const rows = sorted.map((r: EmendaAlesp) =>
      header
        .map((h) => {
          const v = (r as unknown as Record<string, unknown>)[h];
          if (v == null) return "";
          const s = String(v).replace(/"/g, '""');
          return `"${s}"`;
        })
        .join(","),
    );
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `alesp_emendas_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout
      title="Dados ALESP"
      subtitle="Emendas parlamentares estaduais — Assembleia Legislativa de São Paulo (LOA)"
      filterBar={<FiltrosBarAlesp />}
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={Wallet} label="Total Pago" value={formatCompactBRL(stats.totalPago)} hint={`${formatNumber(stats.countPagas)} emendas pagas`} />
        <Kpi icon={FileText} label="Total Indicado" value={formatCompactBRL(stats.totalIndicado)} hint={`${formatNumber(stats.countTotal)} emendas no total`} />
        <Kpi icon={TrendingUp} label="Ticket Médio Pago" value={formatBRL(stats.ticketMedioPago)} hint="apenas emendas pagas" />
        <Kpi icon={Users} label="Parlamentares ativos" value={formatNumber(stats.nParlamentares)} hint="autores únicos no recorte" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <SectionCard title="Estágio das emendas" description="Pagas, Empenhado, Impedida, etc.">
          <Donut data={dataEstagio} />
        </SectionCard>
        <SectionCard title="Top Partidos" description="Soma do valor indicado">
          <Donut data={dataPartido} />
        </SectionCard>
        <SectionCard title="Função de Governo" description="Top 8 áreas">
          <Donut data={dataFuncao} />
        </SectionCard>
      </div>

      <div className="mt-6 grid gap-4">
        <SectionCard title="Análise Temporal Anual" description="Soma do valor indicado por ano de exercício">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dataAnos} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="ano" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
              <YAxis tickFormatter={(v) => formatCompactBRL(v)} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} width={80} />
              <Tooltip
                formatter={(v: number) => [formatBRL(v), "Indicado"]}
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="valor" radius={[8, 8, 0, 0]} onClick={(d) => setAnoDrill((d as { anoNum: number }).anoNum)} style={{ cursor: "pointer" }}>
                {dataAnos.map((d) => (
                  <Cell key={d.ano} fill={d.anoNum === anoSelecionado ? "var(--chart-1)" : "var(--chart-2)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard
          title={`Detalhamento Mensal — ${anoSelecionado ?? "—"}`}
          description="Emendas pagas com data de pagamento informada (campo DATA PAGAMENTO)"
          action={
            anoDrill != null && (
              <button onClick={() => setAnoDrill(null)} className="text-xs text-secondary hover:underline">
                limpar seleção
              </button>
            )
          }
        >
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={dataMensal} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
              <YAxis tickFormatter={(v) => formatCompactBRL(v)} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} width={80} />
              <Tooltip
                formatter={(v: number) => [formatBRL(v), "Valor"]}
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
              />
              <Line type="monotone" dataKey="valor" stroke="var(--chart-1)" strokeWidth={2.5} dot={{ fill: "var(--chart-1)", r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Top 20 Municípios" description="Soma do valor indicado">
          <ResponsiveContainer width="100%" height={460}>
            <BarChart data={stats.topMun} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" tickFormatter={(v) => formatCompactBRL(v)} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} width={140} />
              <Tooltip
                formatter={(v: number) => [formatBRL(v), "Indicado"]}
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="value" fill="var(--chart-1)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Top 20 Parlamentares" description="Soma do valor indicado por autor">
          <ResponsiveContainer width="100%" height={460}>
            <BarChart data={stats.topPar} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" tickFormatter={(v) => formatCompactBRL(v)} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} width={180} />
              <Tooltip
                formatter={(v: number) => [formatBRL(v), "Indicado"]}
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="value" fill="var(--chart-2)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard title="Curva de Pareto — Parlamentares" description="% acumulado entre os 30 maiores">
          <ResponsiveContainer width="100%" height={340}>
            <ComposedChart data={stats.pareto} margin={{ top: 10, right: 30, left: 0, bottom: 90 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} angle={-45} textAnchor="end" height={100} interval={0} />
              <YAxis yAxisId="left" tickFormatter={(v) => formatCompactBRL(v)} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${v.toFixed(0)}%`} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} domain={[0, 100]} />
              <Tooltip
                formatter={(v: number, name) => (name === "Acumulado %" ? [`${v.toFixed(1)}%`, name] : [formatBRL(v), name])}
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
              />
              <Bar yAxisId="left" dataKey="valor" name="Indicado" fill="var(--chart-2)" />
              <Line yAxisId="right" type="monotone" dataKey="percAcum" name="Acumulado %" stroke="var(--chart-5)" strokeWidth={2.5} dot={{ fill: "var(--chart-5)", r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard
          title="Registros detalhados"
          description={`${formatNumber(sorted.length)} de ${formatNumber(registrosFiltrados.length)} emendas`}
          action={
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={busca}
                  onChange={(e) => {
                    setBusca(e.target.value);
                    setPage(0);
                  }}
                  placeholder="Município, parlamentar, partido..."
                  className="h-8 w-64 pl-7 text-xs"
                />
              </div>
              <Button onClick={exportCSV} size="sm" variant="outline" className="h-8 gap-1.5">
                <Download className="h-3.5 w-3.5" />
                CSV
              </Button>
            </div>
          }
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {(
                    [
                      ["municipio", "Município"],
                      ["parlamentar", "Parlamentar"],
                      ["partido", "Partido"],
                      ["orgao", "Órgão"],
                      ["estagio", "Estágio"],
                      ["mes", "Mês/Ano"],
                      ["valor", "Valor (R$)"],
                    ] as [SortKey, string][]
                  ).map(([k, label]) => (
                    <TableHead
                      key={k}
                      onClick={() => toggleSort(k)}
                      className="cursor-pointer select-none whitespace-nowrap text-xs"
                    >
                      {label}
                      {sortKey === k && (sortDir === "asc" ? " ▲" : " ▼")}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-xs font-medium">{r.municipio}</TableCell>
                    <TableCell className="text-xs">{r.parlamentar}</TableCell>
                    <TableCell className="text-xs">
                      <span className="inline-block rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-primary">
                        {r.partido}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs">{r.orgao}</TableCell>
                    <TableCell className="text-xs">
                      <span
                        className={
                          "inline-block rounded-full px-2 py-0.5 text-[10px] font-medium " +
                          (r.estagio === "Pagas"
                            ? "bg-secondary/15 text-secondary"
                            : "bg-muted text-muted-foreground")
                        }
                      >
                        {r.estagio}
                      </span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs">
                      {r.mes > 0 ? `${MESES_PT[r.mes - 1]}/${r.ano}` : `—/${r.ano}`}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs tabular-nums">
                      {formatBRL(r.valor)}
                    </TableCell>
                  </TableRow>
                ))}
                {paged.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-xs text-muted-foreground">
                      Nenhum registro encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && (
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Página {page + 1} de {formatNumber(totalPages)}
              </span>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))} className="h-7 text-xs">
                  Anterior
                </Button>
                <Button size="sm" variant="outline" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)} className="h-7 text-xs">
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </SectionCard>
      </div>
    </AppLayout>
  );
}
