// Registro materializado de uma emenda parlamentar estadual da ALESP.
export type EmendaAlesp = {
  id: string; // CÓDIGO da ALESP
  municipio: string;
  orgao: string;
  parlamentar: string;
  partido: string;
  natureza: string;
  funcao: string;
  beneficiario: string;
  estagio: string;
  objeto: string;
  ano: number;
  mes: number; // 0 = sem data de pagamento
  valor: number;
};

export type EmendasAlespRaw = {
  gerado_em: string;
  fonte: string;
  periodo: string;
  criterio: string;
  anos: number[];
  dim: {
    municipios: string[];
    orgaos: string[];
    parlamentares: string[];
    partidos: string[];
    naturezas: string[];
    funcoes: string[];
    beneficiarios: string[];
    estagios: string[];
    objetos: string[];
  };
  cols: {
    codigo: string[];
    municipio: number[];
    orgao: number[];
    parlamentar: number[];
    partido: number[];
    natureza: number[];
    funcao: number[];
    beneficiario: number[];
    estagio: number[];
    objeto: number[];
    ano: number[];
    mes: number[];
    valor: number[];
  };
  n: number;
};

export type EmendasAlespDataset = {
  gerado_em: string;
  fonte: string;
  periodo: string;
  criterio: string;
  anos: number[];
  registros: EmendaAlesp[];
};

export type FiltrosAlesp = {
  anos: number[];
  municipios: string[];
  parlamentares: string[];
  partidos: string[];
  orgaos: string[];
  estagios: string[];
  funcoes: string[];
};

export const EMPTY_FILTROS_ALESP: FiltrosAlesp = {
  anos: [],
  municipios: [],
  parlamentares: [],
  partidos: [],
  orgaos: [],
  estagios: [],
  funcoes: [],
};
