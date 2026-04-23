import { useFiltros } from "@/lib/emendas/filters-context";
import { opcoesUnicas } from "@/lib/emendas/data";
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
import type { Filtros } from "@/lib/emendas/types";

type FilterKey = keyof Filtros;

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
      <DropdownMenuContent className="max-h-80 w-56 overflow-y-auto">
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

export function FiltrosBar() {
  const { filtros, setFiltro, reset } = useFiltros();

  const toggle = <K extends FilterKey>(key: K, value: Filtros[K][number]) => {
    const cur = filtros[key] as Array<Filtros[K][number]>;
    const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
    setFiltro(key, next as Filtros[K]);
  };

  const totalAtivos =
    filtros.anos.length +
    filtros.ufs.length +
    filtros.tiposEnte.length +
    filtros.tiposEmenda.length +
    filtros.categorias.length +
    filtros.transfEspecial.length;

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/40 px-4 py-3 md:px-8">
      <span className="text-xs font-medium text-muted-foreground">Filtros:</span>
      <MultiSelect
        label="Ano"
        options={opcoesUnicas.anos}
        selected={filtros.anos}
        onToggle={(v) => toggle("anos", v as number)}
      />
      <MultiSelect
        label="UF"
        options={opcoesUnicas.ufs}
        selected={filtros.ufs}
        onToggle={(v) => toggle("ufs", v as string)}
      />
      <MultiSelect
        label="Tipo de Ente"
        options={opcoesUnicas.tiposEnte}
        selected={filtros.tiposEnte}
        onToggle={(v) => toggle("tiposEnte", v as string)}
      />
      <MultiSelect
        label="Tipo de Emenda"
        options={opcoesUnicas.tiposEmenda}
        selected={filtros.tiposEmenda}
        onToggle={(v) => toggle("tiposEmenda", v as string)}
      />
      <MultiSelect
        label="Categoria"
        options={opcoesUnicas.categorias}
        selected={filtros.categorias}
        onToggle={(v) => toggle("categorias", v as string)}
      />
      <MultiSelect
        label="Transf. Especial"
        options={opcoesUnicas.transfEspecial}
        selected={filtros.transfEspecial}
        onToggle={(v) => toggle("transfEspecial", v as string)}
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
