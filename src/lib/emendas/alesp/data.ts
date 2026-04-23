import raw from "@/data/emendas-alesp.json";
import type {
  EmendaAlesp,
  EmendasAlespDataset,
  EmendasAlespRaw,
  FiltrosAlesp,
} from "./types";

const data = raw as unknown as EmendasAlespRaw;

function materializar(): EmendaAlesp[] {
  const { dim, cols, n } = data;
  const out: EmendaAlesp[] = new Array(n);
  for (let i = 0; i < n; i++) {
    out[i] = {
      id: cols.codigo[i],
      municipio: dim.municipios[cols.municipio[i]],
      orgao: dim.orgaos[cols.orgao[i]],
      parlamentar: dim.parlamentares[cols.parlamentar[i]],
      partido: dim.partidos[cols.partido[i]],
      natureza: dim.naturezas[cols.natureza[i]],
      funcao: dim.funcoes[cols.funcao[i]],
      beneficiario: dim.beneficiarios[cols.beneficiario[i]],
      estagio: dim.estagios[cols.estagio[i]],
      objeto: dim.objetos[cols.objeto[i]],
      ano: cols.ano[i],
      mes: cols.mes[i],
      valor: cols.valor[i],
    };
  }
  return out;
}

const registros = materializar();

export const datasetAlesp: EmendasAlespDataset = {
  gerado_em: data.gerado_em,
  fonte: data.fonte,
  periodo: data.periodo,
  criterio: data.criterio,
  anos: data.anos,
  registros,
};

export function aplicarFiltrosAlesp(
  registros: EmendaAlesp[],
  f: FiltrosAlesp,
): EmendaAlesp[] {
  return registros.filter((r) => {
    if (f.anos.length && !f.anos.includes(r.ano)) return false;
    if (f.municipios.length && !f.municipios.includes(r.municipio)) return false;
    if (f.parlamentares.length && !f.parlamentares.includes(r.parlamentar)) return false;
    if (f.partidos.length && !f.partidos.includes(r.partido)) return false;
    if (f.orgaos.length && !f.orgaos.includes(r.orgao)) return false;
    if (f.estagios.length && !f.estagios.includes(r.estagio)) return false;
    if (f.funcoes.length && !f.funcoes.includes(r.funcao)) return false;
    return true;
  });
}

export const opcoesUnicasAlesp = (() => {
  const anos = new Set<number>();
  const municipios = new Set<string>();
  const parlamentares = new Set<string>();
  const partidos = new Set<string>();
  const orgaos = new Set<string>();
  const estagios = new Set<string>();
  const funcoes = new Set<string>();
  for (const r of datasetAlesp.registros) {
    anos.add(r.ano);
    municipios.add(r.municipio);
    parlamentares.add(r.parlamentar);
    partidos.add(r.partido);
    orgaos.add(r.orgao);
    estagios.add(r.estagio);
    funcoes.add(r.funcao);
  }
  return {
    anos: [...anos].sort((a, b) => a - b),
    municipios: [...municipios].sort(),
    parlamentares: [...parlamentares].sort(),
    partidos: [...partidos].sort(),
    orgaos: [...orgaos].sort(),
    estagios: [...estagios].sort(),
    funcoes: [...funcoes].sort(),
  };
})();
