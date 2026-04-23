import { ShieldCheck, Calculator, Filter as FilterIcon, AlertTriangle } from "lucide-react";
import { SectionCard } from "./SectionCard";

const kpis = [
  {
    label: "Total Pago (R$)",
    formula: "Σ VALOR DECISÃO  onde  ESTÁGIO = “Pagas”",
    nota: "Considera apenas pagamentos efetivamente realizados. Demais estágios não somam.",
  },
  {
    label: "Nº de Pagamentos",
    formula: "COUNT(registros)  onde  ESTÁGIO = “Pagas”",
    nota: "Cada linha representa uma emenda paga (CÓDIGO único).",
  },
  {
    label: "Ticket Médio",
    formula: "Total Pago ÷ Nº de Pagamentos",
    nota: "Média aritmética simples; não pondera por município ou parlamentar.",
  },
  {
    label: "Municípios Beneficiados",
    formula: "DISTINCT MUNICÍPIO  onde  ESTÁGIO = “Pagas”",
    nota: "Municípios com pelo menos um pagamento no recorte filtrado.",
  },
  {
    label: "Distribuição por Estágio",
    formula: "Σ VALOR DECISÃO  agrupado por ESTÁGIO  (todos os estágios)",
    nota: "Único gráfico que inclui Impedidas, Empenhadas e Em processamento.",
  },
  {
    label: "Top Partidos / Órgãos / Municípios / Parlamentares",
    formula: "Σ VALOR DECISÃO  onde  ESTÁGIO = “Pagas”  agrupado pela dimensão",
    nota: "Ordenado em ordem decrescente de valor pago.",
  },
  {
    label: "Análise Temporal (Anual e Mensal)",
    formula: "Σ VALOR DECISÃO  onde  ESTÁGIO = “Pagas”  agrupado por ANO / DATA PAGAMENTO (AAAA-MM)",
    nota: "A série mensal usa a DATA PAGAMENTO real, não o ANO da emenda.",
  },
  {
    label: "Curva de Pareto",
    formula: "% acumulado = Σ valor dos top-N municípios ÷ Total Pago × 100",
    nota: "Mostra concentração; calculada sobre os 30 maiores municípios.",
  },
];

const filtrosCampos = [
  ["Ano", "ANO da emenda (campo de cadastro, não a data de pagamento)"],
  ["Município", "MUNICÍPIO beneficiário"],
  ["Parlamentar", "PARLAMENTAR autor da emenda"],
  ["Partido", "PARTIDO do parlamentar"],
  ["Órgão", "ÓRGÃO PROCESSADOR responsável pela execução"],
  ["Estágio", "ESTÁGIO de execução (Pagas, Impedidas 1ª/2ª fase, Empenhado, Em processamento)"],
  ["Função de Governo", "FUNÇÃO DE GOVERNO (ex.: 10 - Saúde, 04 - Administração)"],
];

export function Metodologia() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <SectionCard
        title="Como cada indicador é calculado"
        description="Fórmulas exatas aplicadas sobre o conjunto filtrado, em pt-BR"
      >
        <div className="space-y-3">
          {kpis.map((k) => (
            <div
              key={k.label}
              className="rounded-lg border border-border bg-muted/30 p-3"
            >
              <div className="flex items-start gap-2">
                <Calculator className="mt-0.5 h-3.5 w-3.5 shrink-0 text-secondary" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-primary">{k.label}</p>
                  <code className="mt-1 block whitespace-pre-wrap break-words font-mono text-[11px] text-foreground/80">
                    {k.formula}
                  </code>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                    {k.nota}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="space-y-4">
        <SectionCard
          title="Campos que entram nos filtros"
          description="O que cada filtro recorta no dataset original"
        >
          <ul className="space-y-2">
            {filtrosCampos.map(([nome, desc]) => (
              <li key={nome} className="flex items-start gap-2 text-xs">
                <FilterIcon className="mt-0.5 h-3 w-3 shrink-0 text-secondary" />
                <span>
                  <span className="font-semibold text-foreground">{nome}</span>{" "}
                  <span className="text-muted-foreground">— {desc}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 rounded-md bg-accent/40 p-2.5 text-[11px] leading-relaxed text-foreground/80">
            Os filtros são <strong>aditivos dentro de uma dimensão</strong> (OU lógico) e{" "}
            <strong>multiplicativos entre dimensões</strong> (E lógico). Ex.: selecionar PT + PSD
            mostra registros de qualquer um dos dois partidos; somar Município = SP afunila para a
            interseção.
          </p>
        </SectionCard>

        <SectionCard
          title="Campos que NÃO entram em cálculos monetários"
          description="Itens deliberadamente excluídos para preservar integridade"
        >
          <ul className="space-y-2 text-xs">
            <li className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-destructive" />
              <span>
                <strong>VALOR REMANEJADO</strong> — não é somado aos KPIs de Total Pago. Representa
                redirecionamento, não execução financeira.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-destructive" />
              <span>
                <strong>Estágios “Impedida 1ª/2ª fase”, “Empenhado / Convênio”, “Em
                processamento”</strong> — entram apenas no gráfico de distribuição por estágio,
                nunca no Total Pago.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-destructive" />
              <span>
                <strong>Valores indicados / pré-pagamento</strong> — não inferidos. O painel exibe
                somente o que está nos registros oficiais.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-destructive" />
              <span>
                <strong>Per capita / população</strong> — não calculado nesta versão (sem base
                populacional integrada).
              </span>
            </li>
          </ul>
        </SectionCard>

        <SectionCard
          title="Integridade dos dados"
          description="Garantias aplicadas no processamento"
        >
          <ul className="space-y-2 text-xs">
            <li className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0 text-secondary" />
              <span>
                <strong>Identificador único</strong>: campo CÓDIGO da ALESP — colisões recebem
                sufixo de hash para evitar duplicatas.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0 text-secondary" />
              <span>
                <strong>Valores monetários</strong> em R$ (BRL), formatados com{" "}
                <code className="font-mono">Intl.NumberFormat("pt-BR")</code>.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0 text-secondary" />
              <span>
                <strong>Datas</strong> normalizadas para ISO (AAAA-MM-DD) a partir de DATA
                PAGAMENTO; mês inferido apenas para a série temporal.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0 text-secondary" />
              <span>
                <strong>Reprocessamento</strong>: estrutura preparada para substituir o JSON
                estático por endpoint <code className="font-mono">/api/public/emendas</code> sem
                alterar componentes.
              </span>
            </li>
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
