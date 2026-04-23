export type Emenda = {
  id: string;
  codigo: string | null;
  municipio: string | null;
  orgao: string | null;
  objeto: string | null;
  parlamentar: string | null;
  partido: string | null;
  ano: number | null;
  mes: number | null;
  data_pagamento: string | null;
  substituida: string | null;
  natureza: string | null;
  funcao_governo: string | null;
  beneficiario: string | null;
  estagio: string | null;
  valor_decisao: number;
  valor_remanejado: number;
};

export type EmendasDataset = {
  gerado_em: string;
  fonte: string;
  anos: number[];
  registros: Emenda[];
};

export type Filtros = {
  anos: number[];
  municipios: string[];
  partidos: string[];
  orgaos: string[];
  parlamentares: string[];
  estagios: string[];
  funcoes: string[];
};

export const EMPTY_FILTROS: Filtros = {
  anos: [],
  municipios: [],
  partidos: [],
  orgaos: [],
  parlamentares: [],
  estagios: [],
  funcoes: [],
};
