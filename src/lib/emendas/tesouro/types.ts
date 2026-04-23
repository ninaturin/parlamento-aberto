// Registro materializado de uma transferência de emenda parlamentar federal
// (Tesouro Nacional / SIAFI). Cada linha corresponde a uma OB paga.
export type Emenda = {
  id: string;
  ente: string;
  uf: string;
  codigo_ibge: string | null;
  ano: number;
  mes: number;
  tipo_ente: string; // "Estado" | "Município"
  ob: string;
  cnpj_favorecido: string;
  nome_favorecido: string;
  tipo_emenda: string; // "Emenda Individual" | "Emenda de Bancada"
  transferencia_especial: string; // "Sim" | "Não"
  categoria_economica: string; // "DESPESAS DE CAPITAL" | "DESPESAS CORRENTES"
  valor_pago: number;
};

// Formato compacto colunar persistido em src/data/emendas.json
export type EmendasRaw = {
  gerado_em: string;
  fonte: string;
  periodo: string;
  criterio: string;
  anos: number[];
  dim: {
    entes: string[];
    ufs: string[];
    tipos_ente: string[];
    cnpjs: string[];
    favorecidos: string[];
    tipos_emenda: string[];
    transferencia_especial: string[];
    categorias: string[];
  };
  cols: {
    ente: number[];
    uf: number[];
    ibge: string[];
    ano: number[];
    mes: number[];
    tipo_ente: number[];
    ob: string[];
    cnpj: number[];
    favorecido: number[];
    tipo_emenda: number[];
    transferencia_especial: number[];
    categoria: number[];
    valor: number[];
  };
  n: number;
};

export type EmendasDataset = {
  gerado_em: string;
  fonte: string;
  periodo: string;
  criterio: string;
  anos: number[];
  registros: Emenda[];
};

export type Filtros = {
  anos: number[];
  ufs: string[];
  tiposEnte: string[];
  tiposEmenda: string[];
  categorias: string[];
  transfEspecial: string[];
};

export const EMPTY_FILTROS: Filtros = {
  anos: [],
  ufs: [],
  tiposEnte: [],
  tiposEmenda: [],
  categorias: [],
  transfEspecial: [],
};
