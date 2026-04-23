import { ShieldCheck, Calculator, Filter as FilterIcon, AlertTriangle } from "lucide-react";
import { SectionCard } from "./SectionCard";

const kpis = [
  {
    label: "Total Pago (R$)",
    formula: "Σ VALOR  (todos os registros do recorte)",
    nota:
      "Os registros já representam pagamentos efetivos via Ordem Bancária (regime de caixa). Não há etapa de “empenhado” ou “indicado” a excluir.",
  },
  {
    label: "Nº de Transferências",
    formula: "COUNT(linhas do recorte)",
    nota:
      "Cada linha é uma transferência (combinação de OB, CNPJ favorecido, ano e mês). OBs únicas são contabilizadas separadamente.",
  },
  {
    label: "Ticket Médio",
    formula: "Total Pago ÷ Nº de Transferências",
    nota: "Média aritmética simples; não pondera por ente, UF ou tipo de emenda.",
  },
  {
    label: "Entes Beneficiados",
    formula: "DISTINCT (Nome do Ente + UF)",
    nota: "Conta entes únicos no recorte filtrado. Combinação Ente+UF evita colidir homônimos.",
  },
  {
    label: "Tipo de Emenda / Categoria / Tipo de Ente",
    formula: "Σ VALOR  agrupado pela dimensão",
    nota:
      "Donuts mostram a participação relativa de Individual vs Bancada, Corrente vs Capital e Estado vs Município.",
  },
  {
    label: "Análise Temporal",
    formula: "Σ VALOR  agrupado por ANO  →  drill-down: agrupado por ANO+MÊS",
    nota:
      "Usa o mês de referência da transferência. Sazonalidade real (concentração no fim do exercício) torna-se visível.",
  },
  {
    label: "Ranking de Entes / Curva de Pareto",
    formula: "Σ VALOR  agrupado por (Ente + UF)  →  % acumulado dos top-N ÷ Total Pago × 100",
    nota: "Mostra a concentração de recursos. Top 20 destacado nos KPIs auxiliares.",
  },
];

const filtrosCampos = [
  ["Ano", "Ano de referência da transferência (campo ANO)"],
  ["UF", "Sigla do estado ao qual o ente pertence"],
  ["Tipo de Ente", "Estado ou Município (destinatário do recurso)"],
  ["Tipo de Emenda", "Emenda Individual ou Emenda de Bancada"],
  ["Categoria Econômica", "Despesas Correntes (custeio) ou Despesas de Capital (investimento)"],
  ["Transferência Especial", "Identifica se é transferência especial (sem convênio) ou não"],
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
            <div key={k.label} className="rounded-lg border border-border bg-muted/30 p-3">
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
            <strong>multiplicativos entre dimensões</strong> (E lógico). Ex.: selecionar SP + RJ
            mostra registros de qualquer um dos dois estados; somar Tipo = Município afunila para a
            interseção.
          </p>
        </SectionCard>

        <SectionCard
          title="O que NÃO é calculado"
          description="Itens deliberadamente excluídos para preservar integridade"
        >
          <ul className="space-y-2 text-xs">
            <li className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-destructive" />
              <span>
                <strong>Valores indicados / empenhados</strong> — não inferidos. O painel exibe
                somente o que foi <em>pago</em> via Ordem Bancária (regime de caixa).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-destructive" />
              <span>
                <strong>Valor per capita</strong> — não calculado. Requer base populacional
                integrada (IBGE), prevista para versões futuras.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-destructive" />
              <span>
                <strong>Autoria parlamentar individual</strong> — esta base do Tesouro identifica
                apenas o tipo (Individual/Bancada), sem nome do parlamentar.
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
                <strong>Identificador único</strong>:{" "}
                <code className="font-mono">OB + CNPJ favorecido + ano + mês</code>. Duplicatas
                exatas são removidas no pré-processamento.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0 text-secondary" />
              <span>
                <strong>Fonte primária</strong>: SIAFI (via Tesouro Gerencial) — Ordens Bancárias
                emitidas com modalidades de aplicação 30–46 (transferências a estados, DF e
                municípios) e Resultado EOF 6/7 (emenda individual/bancada).
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
                <strong>Política de revisão</strong>: a fonte pode revisar valores
                retroativamente (estornos, correções de consolidação). Recomenda-se reprocessar a
                base periodicamente.
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
