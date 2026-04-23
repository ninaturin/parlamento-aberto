import { ShieldCheck, Calculator, Filter as FilterIcon, AlertTriangle } from "lucide-react";
import { SectionCard } from "./SectionCard";

type Fonte = "tesouro" | "alesp";

const CONTEUDO: Record<
  Fonte,
  {
    kpis: { label: string; formula: string; nota: string }[];
    filtros: [string, string][];
    excluidos: string[];
    integridade: string[];
  }
> = {
  tesouro: {
    kpis: [
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
        nota:
          "Conta entes únicos no recorte filtrado. Combinação Ente+UF evita colidir homônimos.",
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
    ],
    filtros: [
      ["Ano", "Ano de referência da transferência (campo ANO)"],
      ["UF", "Sigla do estado ao qual o ente pertence"],
      ["Tipo de Ente", "Estado ou Município (destinatário do recurso)"],
      ["Tipo de Emenda", "Emenda Individual ou Emenda de Bancada"],
      ["Categoria Econômica", "Despesas Correntes (custeio) ou Despesas de Capital (investimento)"],
      ["Transferência Especial", "Identifica se é transferência especial (sem convênio) ou não"],
    ],
    excluidos: [
      "Valores indicados / empenhados — não inferidos. Apenas o que foi pago via Ordem Bancária (regime de caixa).",
      "Valor per capita — não calculado. Requer base populacional integrada (IBGE), prevista para versões futuras.",
      "Autoria parlamentar individual — esta base do Tesouro identifica apenas o tipo (Individual/Bancada), sem nome do parlamentar.",
    ],
    integridade: [
      "Identificador único: OB + CNPJ favorecido + ano + mês. Duplicatas exatas são removidas no pré-processamento.",
      "Fonte primária: SIAFI (via Tesouro Gerencial) — Ordens Bancárias com modalidades de aplicação 30–46 (transferências a estados, DF e municípios) e Resultado EOF 6/7 (emenda individual/bancada).",
      "Valores em R$ (BRL), formatados com Intl.NumberFormat(\"pt-BR\").",
      "A fonte pode revisar valores retroativamente (estornos, correções de consolidação). Recomenda-se reprocessar a base periodicamente.",
    ],
  },
  alesp: {
    kpis: [
      {
        label: "Total Pago (R$)",
        formula: 'Σ VALOR DECISÃO  WHERE ESTÁGIO = "Pagas"',
        nota:
          "Soma apenas registros com estágio “Pagas”. Quando VALOR DECISÃO é nulo, usa VALOR REMANEJADO como fallback.",
      },
      {
        label: "Total Indicado (R$)",
        formula: "Σ VALOR DECISÃO  (todos os estágios do recorte)",
        nota:
          "Total proposto pelos parlamentares — independente do estágio (Pagas, Empenhado, Impedida, etc.).",
      },
      {
        label: "Nº de Emendas",
        formula: "COUNT(linhas do recorte)  — dedup por CÓDIGO",
        nota: "Cada linha é uma emenda única (campo CÓDIGO da ALESP). Duplicatas removidas.",
      },
      {
        label: "Ticket Médio Pago",
        formula: 'Total Pago ÷ COUNT(linhas WHERE ESTÁGIO = "Pagas")',
        nota: "Considera somente emendas efetivamente pagas no denominador.",
      },
      {
        label: "Parlamentares ativos",
        formula: "DISTINCT (PARLAMENTAR)",
        nota: "Conta parlamentares únicos com pelo menos uma emenda no recorte.",
      },
      {
        label: "Estágio / Partido / Função",
        formula: "Σ VALOR DECISÃO  agrupado pela dimensão",
        nota:
          "Donuts mostram a distribuição entre os estágios da emenda, partidos e funções de governo.",
      },
      {
        label: "Top Municípios / Parlamentares",
        formula: "Σ VALOR DECISÃO  agrupado por dimensão  →  ordenado desc",
        nota:
          "Curva de Pareto mostra o % acumulado dos top-N sobre o Total Indicado.",
      },
    ],
    filtros: [
      ["Ano", "Ano de exercício da emenda (campo ANO)"],
      ["Município", "Município destinatário (campo MUNICÍPIO)"],
      ["Parlamentar", "Autor da emenda (campo PARLAMENTAR)"],
      ["Partido", "Partido do parlamentar autor (campo PARTIDO)"],
      ["Órgão", "Órgão processador / executor (campo ÓRGÃO PROCESSADOR)"],
      ["Estágio", "Pagas, Empenhado/Convênio, Impedida 1ª/2ª fase, Em processamento, etc."],
      ["Função", "Função de governo (saúde, educação, segurança, etc.)"],
    ],
    excluidos: [
      "Valor per capita — não calculado. Requer base populacional integrada (IBGE).",
      "Valores recebidos pelos beneficiários antes do pagamento — só consideramos o registrado no campo VALOR DECISÃO.",
      "Avaliação de mérito (saúde do projeto) — o painel não classifica emendas como “boas” ou “ruins”.",
    ],
    integridade: [
      "Identificador único: campo CÓDIGO da ALESP (formato AAAA.PPP.NNNNN). Dedup aplicada.",
      "Fonte primária: planilhas oficiais XLSX da ALESP — Emendas LOA 2023, 2024 e 2025.",
      "Mês inferido a partir do campo DATA PAGAMENTO (formato dd/mm/aa). Registros sem data ficam com mês 0 e não aparecem no detalhamento mensal.",
      "Valores em R$ (BRL), formatados com Intl.NumberFormat(\"pt-BR\").",
    ],
  },
};

export function Metodologia({ fonte }: { fonte: Fonte }) {
  const c = CONTEUDO[fonte];
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <SectionCard
        title="Como cada indicador é calculado"
        description="Fórmulas exatas aplicadas sobre o conjunto filtrado, em pt-BR"
      >
        <div className="space-y-3">
          {c.kpis.map((k) => (
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
            {c.filtros.map(([nome, desc]) => (
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
            <strong>multiplicativos entre dimensões</strong> (E lógico).
          </p>
        </SectionCard>

        <SectionCard
          title="O que NÃO é calculado"
          description="Itens deliberadamente excluídos para preservar integridade"
        >
          <ul className="space-y-2 text-xs">
            {c.excluidos.map((e) => (
              <li key={e} className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-destructive" />
                <span>{e}</span>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard
          title="Integridade dos dados"
          description="Garantias aplicadas no processamento"
        >
          <ul className="space-y-2 text-xs">
            {c.integridade.map((i) => (
              <li key={i} className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0 text-secondary" />
                <span>{i}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
