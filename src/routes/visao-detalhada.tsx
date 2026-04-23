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
import { formatBRL, formatCompactBRL, formatNumber, MESES_PT } from "@/lib/emendas/format";
import type { Emenda } from "@/lib/emendas/types";

export const Route = createFileRoute("/visao-detalhada")({
  head: () => ({
    meta: [
      { title: "Visão Detalhada — Dashboard de Emendas Parlamentares Federais" },
      {
        name: "description",
        content:
          "Distribuição por UF, ranking dos entes que mais receberam, curva de Pareto e tabela detalhada exportável das emendas parlamentares federais.",
      },
    ],
  }),
  component: VisaoDetalhada,
});

type SortKey =
  | "ente"
  | "uf"
  | "tipo_ente"
  | "tipo_emenda"
  | "categoria_economica"
  | "ano"
  | "mes"
  | "ob"
  | "valor_pago";

function VisaoDetalhada() {
  const { registrosFiltrados } = useFiltros();
  const [busca, setBusca] = useState("");
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>("valor_pago");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const pageSize = 20;

  const stats = useMemo(() => {
    const porUF = new Map<string, number>();
    const porEnte = new Map<string, number>();
    let totalPago = 0;

    for (const r of registrosFiltrados) {
      const v = r.valor_pago;
      totalPago += v;
      porUF.set(r.uf, (porUF.get(r.uf) || 0) + v);
      const enteKey = `${r.ente} (${r.uf})`;
      porEnte.set(enteKey, (porEnte.get(enteKey) || 0) + v);
    }

    const ufList = [...porUF.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const topEnte = [...porEnte.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    let acum = 0;
    const pareto = topEnte.slice(0, 30).map((d) => {
      acum += d.value;
      return {
        name: d.name,
        valor: d.value,
        percAcum: totalPago > 0 ? (acum / totalPago) * 100 : 0,
      };
    });

    const top20 = topEnte.slice(0, 20);
    const concentracaoTop20 = totalPago > 0
      ? (top20.reduce((s, d) => s + d.value, 0) / totalPago) * 100
      : 0;

    return {
      ufList,
      topEnte: top20,
      pareto,
      totalPago,
      totalEntes: porEnte.size,
      concentracaoTop20,
    };
  }, [registrosFiltrados]);

  const filtered = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return registrosFiltrados;
    return registrosFiltrados.filter((r) =>
      [r.ente, r.uf, r.nome_favorecido, r.cnpj_favorecido, r.ob, r.tipo_emenda]
        .some((v) => String(v).toLowerCase().includes(q)),
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
      "ente",
      "uf",
      "tipo_ente",
      "ano",
      "mes",
      "tipo_emenda",
      "transferencia_especial",
      "categoria_economica",
      "ob",
      "cnpj_favorecido",
      "nome_favorecido",
      "valor_pago",
    ];
    const rows = sorted.map((r: Emenda) =>
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
    a.download = `emendas_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout
      title="Visão Detalhada"
      subtitle="Distribuição por UF, ranking de entes, concentração e dados granulares"
    >
      <SectionCard
        title="Valor Pago por UF"
        description={`${stats.ufList.length} unidades federativas no recorte atual`}
      >
        <ResponsiveContainer width="100%" height={Math.max(320, stats.ufList.length * 18)}>
          <BarChart
            data={stats.ufList}
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
              width={50}
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
        className="mt-4"
        title="Top 20 Entes que Mais Receberam"
        description={`${formatNumber(stats.totalEntes)} entes beneficiados — top 20 concentram ${stats.concentracaoTop20.toFixed(1)}% do total`}
      >
        <ResponsiveContainer width="100%" height={460}>
          <BarChart
            data={stats.topEnte}
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
              width={180}
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

      <SectionCard
        className="mt-4"
        title="Curva de Pareto — Concentração de Recursos"
        description="Percentual acumulado do total pago entre os 30 maiores entes"
      >
        <ResponsiveContainer width="100%" height={340}>
          <ComposedChart data={stats.pareto} margin={{ top: 10, right: 30, left: 0, bottom: 90 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
              angle={-45}
              textAnchor="end"
              height={100}
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
                placeholder="Ente, UF, OB, CNPJ..."
                className="h-8 w-56 pl-7 text-xs"
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
                    ["ente", "Ente"],
                    ["uf", "UF"],
                    ["tipo_ente", "Tipo"],
                    ["tipo_emenda", "Tipo Emenda"],
                    ["categoria_economica", "Categoria"],
                    ["mes", "Mês/Ano"],
                    ["ob", "OB"],
                    ["valor_pago", "Valor (R$)"],
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
                  <TableCell className="text-xs font-medium">{r.ente}</TableCell>
                  <TableCell className="text-xs">{r.uf}</TableCell>
                  <TableCell className="text-xs">{r.tipo_ente}</TableCell>
                  <TableCell className="text-xs">
                    <span
                      className={
                        "inline-block rounded-full px-2 py-0.5 text-[10px] font-medium " +
                        (r.tipo_emenda === "Emenda Individual"
                          ? "bg-secondary/15 text-secondary"
                          : "bg-accent text-primary")
                      }
                    >
                      {r.tipo_emenda.replace("Emenda ", "")}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs">
                    {r.categoria_economica.replace("DESPESAS ", "").toLowerCase()}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs">
                    {MESES_PT[r.mes - 1]}/{r.ano}
                  </TableCell>
                  <TableCell className="font-mono text-[10px] text-muted-foreground">
                    {r.ob.slice(-12)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs tabular-nums">
                    {formatBRL(r.valor_pago)}
                  </TableCell>
                </TableRow>
              ))}
              {paged.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-xs text-muted-foreground">
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
