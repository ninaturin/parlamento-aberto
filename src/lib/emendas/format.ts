const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});
const brlExact = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const num = new Intl.NumberFormat("pt-BR");
const pct = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  maximumFractionDigits: 1,
});

export function formatBRL(value: number): string {
  return brl.format(value || 0);
}
export function formatBRLExact(value: number): string {
  return brlExact.format(value || 0);
}
export function formatNumber(value: number): string {
  return num.format(value || 0);
}
export function formatPercent(value: number): string {
  return pct.format(value || 0);
}
export function formatCompactBRL(value: number): string {
  const v = value || 0;
  if (Math.abs(v) >= 1_000_000_000) return `R$ ${(v / 1_000_000_000).toFixed(2)} bi`;
  if (Math.abs(v) >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(2)} mi`;
  if (Math.abs(v) >= 1_000) return `R$ ${(v / 1_000).toFixed(1)} mil`;
  return formatBRL(v);
}

export const MESES_PT = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];
