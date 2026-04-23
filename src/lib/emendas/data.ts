import raw from "@/data/emendas.json";
import type { Emenda, EmendasDataset, Filtros } from "./types";

export const dataset = raw as unknown as EmendasDataset;

export function aplicarFiltros(registros: Emenda[], f: Filtros): Emenda[] {
  return registros.filter((r) => {
    if (f.anos.length && (r.ano == null || !f.anos.includes(r.ano))) return false;
    if (f.municipios.length && (!r.municipio || !f.municipios.includes(r.municipio)))
      return false;
    if (f.partidos.length && (!r.partido || !f.partidos.includes(r.partido))) return false;
    if (f.orgaos.length && (!r.orgao || !f.orgaos.includes(r.orgao))) return false;
    if (
      f.parlamentares.length &&
      (!r.parlamentar || !f.parlamentares.includes(r.parlamentar))
    )
      return false;
    if (f.estagios.length && (!r.estagio || !f.estagios.includes(r.estagio))) return false;
    if (f.funcoes.length && (!r.funcao_governo || !f.funcoes.includes(r.funcao_governo)))
      return false;
    return true;
  });
}

export function isPaga(r: Emenda): boolean {
  return r.estagio === "Pagas";
}

/** valor efetivamente pago — apenas registros com estágio "Pagas" usando VALOR DECISÃO */
export function valorPago(r: Emenda): number {
  return isPaga(r) ? r.valor_decisao : 0;
}

export const opcoesUnicas = (() => {
  const anos = new Set<number>();
  const municipios = new Set<string>();
  const partidos = new Set<string>();
  const orgaos = new Set<string>();
  const parlamentares = new Set<string>();
  const estagios = new Set<string>();
  const funcoes = new Set<string>();
  for (const r of dataset.registros) {
    if (r.ano != null) anos.add(r.ano);
    if (r.municipio) municipios.add(r.municipio);
    if (r.partido) partidos.add(r.partido);
    if (r.orgao) orgaos.add(r.orgao);
    if (r.parlamentar) parlamentares.add(r.parlamentar);
    if (r.estagio) estagios.add(r.estagio);
    if (r.funcao_governo) funcoes.add(r.funcao_governo);
  }
  return {
    anos: [...anos].sort((a, b) => a - b),
    municipios: [...municipios].sort(),
    partidos: [...partidos].sort(),
    orgaos: [...orgaos].sort(),
    parlamentares: [...parlamentares].sort(),
    estagios: [...estagios].sort(),
    funcoes: [...funcoes].sort(),
  };
})();
