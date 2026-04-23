import raw from "@/data/emendas-tesouro.json";
import type { Emenda, EmendasDataset, EmendasRaw, Filtros } from "./types";

const data = raw as unknown as EmendasRaw;

// Materializa o formato colunar em uma lista de objetos. Feito uma única vez.
function materializar(): Emenda[] {
  const { dim, cols, n } = data;
  const out: Emenda[] = new Array(n);
  for (let i = 0; i < n; i++) {
    out[i] = {
      id: cols.ob[i] + "|" + i,
      ente: dim.entes[cols.ente[i]],
      uf: dim.ufs[cols.uf[i]],
      codigo_ibge: cols.ibge[i] || null,
      ano: cols.ano[i],
      mes: cols.mes[i],
      tipo_ente: dim.tipos_ente[cols.tipo_ente[i]],
      ob: cols.ob[i],
      cnpj_favorecido: dim.cnpjs[cols.cnpj[i]],
      nome_favorecido: dim.favorecidos[cols.favorecido[i]],
      tipo_emenda: dim.tipos_emenda[cols.tipo_emenda[i]],
      transferencia_especial: dim.transferencia_especial[cols.transferencia_especial[i]],
      categoria_economica: dim.categorias[cols.categoria[i]],
      valor_pago: cols.valor[i],
    };
  }
  return out;
}

const registros = materializar();

export const dataset: EmendasDataset = {
  gerado_em: data.gerado_em,
  fonte: data.fonte,
  periodo: data.periodo,
  criterio: data.criterio,
  anos: data.anos,
  registros,
};

export function aplicarFiltros(registros: Emenda[], f: Filtros): Emenda[] {
  return registros.filter((r) => {
    if (f.anos.length && !f.anos.includes(r.ano)) return false;
    if (f.ufs.length && !f.ufs.includes(r.uf)) return false;
    if (f.tiposEnte.length && !f.tiposEnte.includes(r.tipo_ente)) return false;
    if (f.tiposEmenda.length && !f.tiposEmenda.includes(r.tipo_emenda)) return false;
    if (f.categorias.length && !f.categorias.includes(r.categoria_economica)) return false;
    if (f.transfEspecial.length && !f.transfEspecial.includes(r.transferencia_especial))
      return false;
    return true;
  });
}

export const opcoesUnicas = (() => {
  const anos = new Set<number>();
  const ufs = new Set<string>();
  const tiposEnte = new Set<string>();
  const tiposEmenda = new Set<string>();
  const categorias = new Set<string>();
  const transfEspecial = new Set<string>();
  for (const r of dataset.registros) {
    anos.add(r.ano);
    ufs.add(r.uf);
    tiposEnte.add(r.tipo_ente);
    tiposEmenda.add(r.tipo_emenda);
    categorias.add(r.categoria_economica);
    transfEspecial.add(r.transferencia_especial);
  }
  return {
    anos: [...anos].sort((a, b) => a - b),
    ufs: [...ufs].sort(),
    tiposEnte: [...tiposEnte].sort(),
    tiposEmenda: [...tiposEmenda].sort(),
    categorias: [...categorias].sort(),
    transfEspecial: [...transfEspecial].sort(),
  };
})();
