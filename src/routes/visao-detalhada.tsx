import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Download, Search } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SectionCard } from "@/components/dashboard/SectionCard";
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
import { useFiltros } from "@/lib/emendas/filters-context";
import { isPaga, valorPago } from "@/lib/emendas/data";
import { formatBRL, formatCompactBRL, formatNumber } from "@/lib/emendas/format";
import type { Emenda } from "@/lib/emendas/types";

export const Route = createFileRoute("/visao-detalhada")({
  head: () => ({
    meta: [
      { title: "Visão Detalhada — Dashboard de Emendas" },
      {
        name: "description",
        content:
          "Ranking de municípios beneficiados, curva de Pareto de concentração e tabela detalhada exportável.",
      },
    ],
  }),
  component: VisaoDetalhada,
});

type SortKey =
  | "municipio"
  | "parlamentar"
  | "partido"
  | "orgao"
  | "estagio"
  | "valor_decisao"
  | "data_pagamento";

function VisaoDetalhada() {
  const { registrosFiltrados } = useFiltros();
  const [busca, setBusca] = useState("");
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>("valor_decisao");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const pageSize = 20;

  const stats = useMemo(() => {
    const porMunicipio = new Map<string, number>();
    const porParlamentar = new Map<string, number>();
    let totalPago = 0;

    for (const r of registrosFiltrados) {
      if (!isPaga(r)) continue;
      const v = valorPago(r);
      totalPago += v;
      if (r.municipio) porMunicipio.set(r.municipio, (porMunicipio.get(r.municipio) || 0) + v);
      if (r.parlamentar)
        porParlamentar.set(r.parlamentar, (porParlamentar.get(r.parlamentar) || 0) + v);
    }
    const topMun = [...porMunicipio.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    const topPar = [...porParlamentar.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 20);

    let acum = 0;
    const pareto = topMun.slice(0, 30).map((d) => {
      acum += d.value;
      return {
        name: d.name,
        valor: d.value,
        percAcum: totalPago > 0 ? (acum / totalPago) * 100 : 0,
      };
    });

    return {
      topMunicipios: topMun.slice(0, 20),
      topParlamentares: topPar,
      pareto,
      totalPago,
      totalMunicipios: porMunicipio.size,
    };
  }, [registrosFiltrados]);

  const filtered = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return registrosFiltrados;
    return registrosFiltrados.filter((r) =>
      [r.municipio, r.parlamentar, r.partido, r.orgao, r.beneficiario, r.objeto, r.codigo]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [busca, registrosFiltrados]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const av = (a[sortKey] ?? "") as string | number;
      const bv = (b[sortKey] ?? "") as string | number;
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
      "codigo",
      "municipio",
      "parlamentar",
      "partido",
      "orgao",
      "objeto",
      "beneficiario",
      "ano",
      "mes",
      "data_pagamento",
      "estagio",
      "valor_decisao",
      "valor_remanejado",
    ];
    const rows = sorted.map((r: Emenda) =>
      header.map((h) => {
        const v = (r as unknown as Record<string, unknown>)[h];
        if (v == null) return "";
        const s = String(v).replace(/"/g, '""');
        return `"${s}"`;
      }).join(","),
    );
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `emendas_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout
      title="Visão Detalhada"
      subtitle="Concentração, ranking e dados granulares com busca e exportação"
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Top 20 Municípios por Valor Pago"
          description={`${stats.totalMunicipios} municípios beneficiados no recorte atual`}
        >
          <ResponsiveContainer width="100%" height={420}>
            <BarChart
              data={stats.topMunicipios}
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
                width={130}
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
              <Bar dataKey="value" fill="var(--chart-1)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        <SectionCard
          title="Top 20 Parlamentares por Valor Pago"
          description="Recursos efetivamente pagos por autor da emenda"
        >
          <ResponsiveContainer width="100%" height={420}>
            <BarChart
              data={stats.topParlamentares}
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
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                width={150}
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

      <SectionCard
        className="mt-4"
        title="Curva de Pareto — Concentração de Recursos"
        description="Percentual acumulado do total pago entre os 30 maiores municípios"
      >
        <ResponsiveContainer width="100%" height={340}>
          <ComposedChart data={stats.pareto} margin={{ top: 10, right: 30, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
              angle={-35}
              textAnchor="end"
              height={70}
              interval={0}
            />
            <YAxis
              yAxisId="left"
              tickFormatter={(v) => formatCompactBRL(v)}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={(v) => `${v.toFixed(0)}%`}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              domain={[0, 100]}
            />
            <Tooltip
              formatter={(v: number, name) =>
                name === "Acumulado %" ? [`${v.toFixed(1)}%`, name] : [formatBRL(v), name]
              }
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Bar yAxisId="left" dataKey="valor" name="Valor Pago" fill="var(--chart-2)" />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="percAcum"
              name="Acumulado %"
              stroke="var(--chart-5)"
              strokeWidth={2.5}
              dot={{ fill: "var(--chart-5)", r: 3 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </SectionCard>

      <SectionCard
        className="mt-4"
        title="Registros detalhados"
        description={`${formatNumber(sorted.length)} de ${formatNumber(registrosFiltrados.length)} registros (após busca)`}
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
                placeholder="Buscar..."
                className="h-8 w-48 pl-7 text-xs"
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
                {([
                  ["municipio", "Município"],
                  ["parlamentar", "Parlamentar"],
                  ["partido", "Partido"],
                  ["orgao", "Órgão"],
                  ["estagio", "Estágio"],
                  ["data_pagamento", "Data Pgto."],
                  ["valor_decisao", "Valor (R$)"],
                ] as [SortKey, string][]).map(([k, label]) => (
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
                  <TableCell className="text-xs font-medium">{r.municipio ?? "—"}</TableCell>
                  <TableCell className="text-xs">{r.parlamentar ?? "—"}</TableCell>
                  <TableCell className="text-xs">{r.partido ?? "—"}</TableCell>
                  <TableCell className="text-xs">{r.orgao ?? "—"}</TableCell>
                  <TableCell className="text-xs">
                    <span
                      className={
                        "inline-block rounded-full px-2 py-0.5 text-[10px] font-medium " +
                        (r.estagio === "Pagas"
                          ? "bg-secondary/15 text-secondary"
                          : "bg-muted text-muted-foreground")
                      }
                    >
                      {r.estagio ?? "—"}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs">
                    {r.data_pagamento
                      ? new Date(r.data_pagamento).toLocaleDateString("pt-BR")
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs tabular-nums">
                    {formatBRL(r.valor_decisao)}
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
              Página {page + 1} de {totalPages}
            </span>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="h-7 text-xs"
              >
                Anterior
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="h-7 text-xs"
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </SectionCard>
    </AppLayout>
  );
}
