import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { EMPTY_FILTROS, type Filtros } from "./types";
import { aplicarFiltros, dataset } from "./data";
import type { Emenda } from "./types";

type Ctx = {
  filtros: Filtros;
  setFiltro: <K extends keyof Filtros>(k: K, v: Filtros[K]) => void;
  reset: () => void;
  registros: Emenda[];
  registrosFiltrados: Emenda[];
};

const FiltrosContext = createContext<Ctx | null>(null);

export function FiltrosProvider({ children }: { children: ReactNode }) {
  const [filtros, setFiltros] = useState<Filtros>(EMPTY_FILTROS);

  const registrosFiltrados = useMemo(
    () => aplicarFiltros(dataset.registros, filtros),
    [filtros],
  );

  const value = useMemo<Ctx>(
    () => ({
      filtros,
      setFiltro: (k, v) => setFiltros((p) => ({ ...p, [k]: v })),
      reset: () => setFiltros(EMPTY_FILTROS),
      registros: dataset.registros,
      registrosFiltrados,
    }),
    [filtros, registrosFiltrados],
  );

  return <FiltrosContext.Provider value={value}>{children}</FiltrosContext.Provider>;
}

export function useFiltros() {
  const ctx = useContext(FiltrosContext);
  if (!ctx) throw new Error("useFiltros deve ser usado dentro de FiltrosProvider");
  return ctx;
}
