import { useFiltrosAlesp } from "@/lib/emendas/alesp/filters-context";
import { opcoesUnicasAlesp } from "@/lib/emendas/alesp/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, X } from "lucide-react";
import type { FiltrosAlesp } from "@/lib/emendas/alesp/types";

type FilterKey = keyof FiltrosAlesp;

function MultiSelect({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: (string | number)[];
  selected: (string | number)[];
  onToggle: (v: string | number) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 justify-between gap-2 border-border bg-card text-xs"
        >
          <span>
            {label}
            {selected.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 h-4 px-1.5 text-[10px]">
                {selected.length}
              </Badge>
            )}
          </span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-h-80 w-64 overflow-y-auto">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((opt) => (
          <DropdownMenuCheckboxItem
            key={String(opt)}
            checked={selected.includes(opt)}
            onCheckedChange={() => onToggle(opt)}
            onSelect={(e) => e.preventDefault()}
          >
            {String(opt)}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function FiltrosBarAlesp() {
  const { filtros, setFiltro, reset } = useFiltrosAlesp();

  const toggle = <K extends FilterKey>(key: K, value: FiltrosAlesp[K][number]) => {
    const cur = filtros[key] as Array<FiltrosAlesp[K][number]>;
    const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
    setFiltro(key, next as FiltrosAlesp[K]);
  };

  const totalAtivos =
    filtros.anos.length +
    filtros.municipios.length +
    filtros.parlamentares.length +
    filtros.partidos.length +
    filtros.orgaos.length +
    filtros.estagios.length +
    filtros.funcoes.length;

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/40 px-4 py-3 md:px-8">
      <span className="text-xs font-medium text-muted-foreground">Filtros:</span>
      <MultiSelect
        label="Ano"
        options={opcoesUnicasAlesp.anos}
        selected={filtros.anos}
        onToggle={(v) => toggle("anos", v as number)}
      />
      <MultiSelect
        label="Município"
        options={opcoesUnicasAlesp.municipios}
        selected={filtros.municipios}
        onToggle={(v) => toggle("municipios", v as string)}
      />
      <MultiSelect
        label="Parlamentar"
        options={opcoesUnicasAlesp.parlamentares}
        selected={filtros.parlamentares}
        onToggle={(v) => toggle("parlamentares", v as string)}
      />
      <MultiSelect
        label="Partido"
        options={opcoesUnicasAlesp.partidos}
        selected={filtros.partidos}
        onToggle={(v) => toggle("partidos", v as string)}
      />
      <MultiSelect
        label="Órgão"
        options={opcoesUnicasAlesp.orgaos}
        selected={filtros.orgaos}
        onToggle={(v) => toggle("orgaos", v as string)}
      />
      <MultiSelect
        label="Estágio"
        options={opcoesUnicasAlesp.estagios}
        selected={filtros.estagios}
        onToggle={(v) => toggle("estagios", v as string)}
      />
      <MultiSelect
        label="Função"
        options={opcoesUnicasAlesp.funcoes}
        selected={filtros.funcoes}
        onToggle={(v) => toggle("funcoes", v as string)}
      />
      {totalAtivos > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={reset}
          className="h-8 gap-1 text-xs text-muted-foreground"
        >
          <X className="h-3 w-3" />
          Limpar ({totalAtivos})
        </Button>
      )}
    </div>
  );
}
