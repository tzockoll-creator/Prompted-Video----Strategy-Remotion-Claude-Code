import { useFilters } from '@/context/filter-context';
import { Badge } from '@/components/ui/badge';

function MultiToggle({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      if (selected.length === 1) return;
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-400 font-medium whitespace-nowrap">{label}:</span>
      <div className="flex flex-wrap gap-1">
        {options.map(opt => (
          <Badge
            key={opt}
            variant={selected.includes(opt) ? 'default' : 'outline'}
            className={`cursor-pointer text-xs ${
              selected.includes(opt)
                ? 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30'
                : 'text-slate-500 border-slate-700 hover:text-slate-300'
            }`}
            onClick={() => toggle(opt)}
          >
            {opt}
          </Badge>
        ))}
      </div>
    </div>
  );
}

export function FilterBar() {
  const { filters, setFilters, availableQuarters, availableRegions, availableBranchTypes } = useFilters();

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-slate-900/50 rounded-lg border border-slate-800">
      <MultiToggle
        label="Quarter"
        options={availableQuarters}
        selected={filters.quarters}
        onChange={(quarters) => setFilters({ quarters })}
      />
      <div className="w-px h-6 bg-slate-700" />
      <MultiToggle
        label="Region"
        options={availableRegions}
        selected={filters.regions}
        onChange={(regions) => setFilters({ regions })}
      />
      <div className="w-px h-6 bg-slate-700" />
      <MultiToggle
        label="Type"
        options={availableBranchTypes}
        selected={filters.branchTypes}
        onChange={(branchTypes) => setFilters({ branchTypes })}
      />
    </div>
  );
}
