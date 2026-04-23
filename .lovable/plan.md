

# Separação dos dois datasets: ALESP + Tesouro Nacional

## Problema atual
O dataset ALESP foi sobrescrito pelos dados do Tesouro Nacional. Os XLSX originais (2023, 2024, 2025) ainda estão disponíveis e serão reprocessados para coexistir com os dados federais — sem que um substitua o outro.

## Nova arquitetura de dados

Dois datasets independentes, cada um com seu próprio módulo, contexto de filtros e tipos:

```text
src/data/
  emendas-tesouro.json   (atual emendas.json — 10,5 MB, federal/SIAFI)
  emendas-alesp.json     (reprocessado dos XLSX 2023-2025, ~15k registros)

src/lib/emendas/
  tesouro/  → types.ts, data.ts, filters-context.tsx
  alesp/    → types.ts, data.ts, filters-context.tsx
  format.ts (compartilhado: BRL, números, meses)
```

Cada contexto de filtros é **isolado**: filtros aplicados em "Dados Tesouro Nacional" não afetam "Dados ALESP" e vice-versa.

## Estrutura de páginas (rotas)

```text
/                         Capa — apresenta as duas fontes
/visao-geral              Comparativo consolidado das duas fontes
/dados-tesouro            Dataset federal completo (KPIs + detalhamento)
/dados-alesp              Dataset estadual SP completo (KPIs + detalhamento)
/metodologia              Metodologia separada por fonte (abas)
/contato                  (mantém)
```

As rotas antigas `/visao-detalhada` e `/filtros` serão removidas (consolidadas dentro das páginas por fonte).

### `/visao-geral` (consolidada)

Página de alto nível com **comparação lado a lado**:
- 2 KPIs por fonte (Total Pago, Nº de Transferências)
- Donut "Tesouro vs ALESP" mostrando volume relativo
- Gráfico temporal anual com duas séries
- 2 cards "Aprofundar" → linkam para `/dados-tesouro` e `/dados-alesp`

### `/dados-tesouro` (página completa)

- Filtros: Ano, UF, Tipo de Ente, Tipo de Emenda, Categoria, Transf. Especial
- KPIs (4): Total Pago, Transferências, Ticket Médio, Entes Beneficiados
- Donuts (Tipo de Emenda, Categoria, Tipo de Ente)
- Análise temporal anual com drill-down mensal
- Valor por UF, Top 20 entes, Curva de Pareto
- Tabela detalhada com busca, ordenação, paginação e export CSV

### `/dados-alesp` (página completa)

- Filtros: Ano, Município, Parlamentar, Partido, Órgão, Estágio, Função
- KPIs (4): Total Pago, Transferências, Ticket Médio, Parlamentares ativos
- Donuts (Estágio, Partido, Função de Governo)
- Análise temporal anual com drill-down mensal
- Top 20 Municípios, Top 20 Parlamentares, Curva de Pareto
- Tabela detalhada com busca, ordenação, paginação e export CSV

## Sidebar atualizada

```text
Início
Visão Geral
Dados Tesouro Nacional   (ícone: Landmark)
Dados ALESP              (ícone: Building2)
Metodologia
Contato
```

## Detalhes técnicos

- **Reprocessamento ALESP**: script Node lê os 3 XLSX em `/tmp/em2023.xlsx`, `/tmp/em2024.xlsx`, `/tmp/em2025.xlsx`, normaliza colunas, dedup por `CÓDIGO`, gera `src/data/emendas-alesp.json` no formato colunar comprimido (interning de strings) para manter o bundle leve.
- **Renomeação**: `src/data/emendas.json` → `src/data/emendas-tesouro.json`. O código atual em `src/lib/emendas/` é movido para `src/lib/emendas/tesouro/`.
- **Novo módulo ALESP** (`src/lib/emendas/alesp/`): replica a estrutura com schema próprio:
  ```typescript
  type EmendaAlesp = {
    id: string; municipio: string; parlamentar: string; partido: string;
    orgao: string; estagio: string; funcao: string;
    ano: number; mes: number; valor_decisao: number;
  };
  ```
- **Provider duplo** em `__root.tsx`: envolve `<Outlet />` com `<TesouroFiltrosProvider>` e `<AlespFiltrosProvider>` aninhados — cada página consome só o que precisa.
- **Componentes compartilhados** (`Kpi`, `Donut`, `SectionCard`, `AppLayout`) ficam genéricos e são reutilizados pelas duas páginas.
- **`AppLayout`** ganha prop `filterBar?: ReactNode` para receber a barra de filtros específica de cada fonte (em vez do `FiltrosBar` único atual).
- **Capa (`/`)**: hero atualizado com subtítulo "Duas fontes oficiais — Tesouro Nacional (SIAFI) e ALESP" e três cards (Visão Geral, Dados Tesouro, Dados ALESP).
- **Metodologia**: `Metodologia.tsx` aceita prop `fonte: "tesouro" | "alesp"`; a rota usa `<Tabs>` (shadcn) para alternar entre as duas.
- **Bug runtime**: o erro "dataset.registros is not iterable" será resolvido pela reescrita dos módulos com imports explícitos do JSON correto.

## Arquivos

**Criar:**
- `src/data/emendas-alesp.json` (gerado por script)
- `src/lib/emendas/tesouro/{types,data,filters-context}.ts(x)`
- `src/lib/emendas/alesp/{types,data,filters-context}.ts(x)`
- `src/components/layout/FiltrosBarTesouro.tsx`
- `src/components/layout/FiltrosBarAlesp.tsx`
- `src/routes/dados-tesouro.tsx`
- `src/routes/dados-alesp.tsx`

**Editar:**
- `src/data/emendas.json` → renomear para `emendas-tesouro.json`
- `src/routes/__root.tsx` (dois providers)
- `src/routes/index.tsx` (capa com 3 cards)
- `src/routes/visao-geral.tsx` (consolida as duas fontes)
- `src/routes/metodologia.tsx` (tabs por fonte)
- `src/components/layout/AppSidebar.tsx` (novos itens)
- `src/components/layout/AppLayout.tsx` (prop `filterBar`)
- `src/components/dashboard/Metodologia.tsx` (prop `fonte`)

**Remover:**
- `src/routes/visao-detalhada.tsx`, `src/routes/filtros.tsx`
- `src/lib/emendas/{types,data,filters-context,format}.ts(x)` (movidos para `tesouro/`)
- `src/components/layout/FiltrosBar.tsx`

