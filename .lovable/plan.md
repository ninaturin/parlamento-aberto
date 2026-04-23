
# Dashboard de Emendas Parlamentares Federais

Dashboard de BI em português para acompanhar transferências de Emendas Parlamentares Individuais e de Bancada (2023–2025), seguindo a metodologia do Tesouro Nacional — sem inferências, apenas o que está nos dados.

## Estrutura de páginas (rotas)

Layout fixo com **sidebar lateral azul** (logo da prefeitura no topo + ícones: Home, Visão Geral, Visão Detalhada, Filtros, Contato), conforme as imagens enviadas. Paleta azul corporativa (#1E3A5F, #4A7BB5, #E8EEF5), tipografia sans-serif, cantos arredondados, fundo claro com gráficos decorativos sutis.

1. **/** — **Capa** (Página Inicial)
   - Hero com imagem urbana, título "DASHBOARD — EMENDAS PARLAMENTARES"
   - Cards de navegação (Visão Geral, Visão Detalhada, Contato) e selo "Atualizado em: <data>"

2. **/visao-geral** — **Visão Geral**
   - **KPIs**: Total Pago (R$), Total de Transferências (contagem de OB), Ticket Médio, Nº de Entes Beneficiados
   - **Distribuição por Tipo de Emenda** (Individual vs Bancada) — donut
   - **Categoria Econômica** (Corrente vs Capital) — donut
   - **Análise Temporal Anual** — gráfico de barras por ano (2023–2025); clicar num ano faz drill-down para a visão mensal
   - **Detalhamento Mensal** — gráfico de linha/barra dos 12 meses do ano selecionado (revela sazonalidade, picos de fim de ano)

3. **/visao-detalhada** — **Visão Detalhada**
   - **Mapa/Gráfico por UF** — barras horizontais com valor pago por UF
   - **Ranking Top 20 Entes** que mais receberam
   - **Curva de Pareto** — % do total acumulado nos top entes (mostra concentração)
   - **Tabela detalhada** com colunas: Ente, UF, Tipo de Ente, Tipo de Emenda, Categoria, Valor Pago, Mês/Ano, OB, CNPJ Favorecido — com busca, ordenação e paginação
   - Botão **Exportar CSV** dos dados filtrados

4. **/contato** — formulário simples (nome, email, mensagem) e informações institucionais

## Filtros globais (painel lateral, persistem entre páginas)

- Ano (2023, 2024, 2025)
- UF (multi-seleção)
- Tipo de Emenda (Individual / Bancada)
- Categoria Econômica (Corrente / Capital)
- Tipo de Ente (Estado / Município)
- Transferência Especial (Sim / Não)

## Tratamento dos dados

- Os 3 arquivos XLSX (2023, 2024, 2025) serão **convertidos uma única vez para um JSON unificado** em `src/data/emendas.json` (carregado no client — volume cabe), padronizando nomes de colunas em snake_case
- **id_transferencia** = `OB + CNPJ_favorecido + ano + mes` para deduplicar
- Valores monetários tratados como número (R$); formatação pt-BR com `Intl.NumberFormat`
- Cálculos feitos via `useMemo` sobre o dataset filtrado — todos os agregados (somas, contagens, ticket médio, Pareto) derivam diretamente dos registros, **sem inferência de valores indicados ou recebidos antes do pagamento**

## Atualização futura

- Estrutura preparada para trocar o JSON estático por um endpoint (`/api/public/emendas`) sem alterar componentes
- Documentação no README explicando como reprocessar planilhas novas via script

## Stack

TanStack Start + Tailwind + shadcn/ui + **Recharts** para todos os gráficos. Sem backend nesta primeira versão (dados embarcados).
