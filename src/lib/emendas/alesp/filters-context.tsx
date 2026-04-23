import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { EMPTY_FILTROS_ALESP, type FiltrosAlesp, type EmendaAlesp } from "./types";
import { aplicarFiltrosAlesp, datasetAlesp } from "./data";

type Ctx = {
  filtros: FiltrosAlesp;
  setFiltro: <K extends keyof FiltrosAlesp>(k: K, v: FiltrosAlesp[K]) => void;
  reset: () => void;
  registros: EmendaAlesp[];
  registrosFiltrados: EmendaAlesp[];
};

const Context = createContext<Ctx | null>(null);

export function FiltrosAlespProvider({ children }: { children: ReactNode }) {
  const [filtros, setFiltros] = useState<FiltrosAlesp>(EMPTY_FILTROS_ALESP);

  const registrosFiltrados = useMemo(
    () => aplicarFiltrosAlesp(datasetAlesp.registros, filtros),
    [filtros],
  );

  const value = useMemo<Ctx>(
    () => ({
      filtros,
      setFiltro: (k, v) => setFiltros((p) => ({ ...p, [k]: v })),
      reset: () => setFiltros(EMPTY_FILTROS_ALESP),
      registros: datasetAlesp.registros,
      registrosFiltrados,
    }),
    [filtros, registrosFiltrados],
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useFiltrosAlesp() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("useFiltrosAlesp deve ser usado dentro de FiltrosAlespProvider");
  return ctx;
}
