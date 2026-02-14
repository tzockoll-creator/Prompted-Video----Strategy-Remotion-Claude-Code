import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import type { BranchRecord, FilterState } from '@/types';
import { QUARTERS, REGIONS, BRANCH_TYPES } from '@/lib/constants';
import { filterData } from '@/lib/data-helpers';
import rawData from '@/data/branch-performance.json';

const allData = rawData as BranchRecord[];

interface FilterContextValue {
  filters: FilterState;
  setFilters: (updates: Partial<FilterState>) => void;
  filteredData: BranchRecord[];
  allData: BranchRecord[];
  availableQuarters: string[];
  availableRegions: string[];
  availableBranchTypes: string[];
}

const FilterContext = createContext<FilterContextValue | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFiltersState] = useState<FilterState>({
    quarters: [...QUARTERS],
    regions: [...REGIONS],
    branchTypes: [...BRANCH_TYPES],
  });

  const setFilters = (updates: Partial<FilterState>) => {
    setFiltersState(prev => ({ ...prev, ...updates }));
  };

  const filteredData = useMemo(() => filterData(allData, filters), [filters]);

  const value: FilterContextValue = {
    filters,
    setFilters,
    filteredData,
    allData,
    availableQuarters: [...QUARTERS],
    availableRegions: [...REGIONS],
    availableBranchTypes: [...BRANCH_TYPES],
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilters must be used within FilterProvider');
  return ctx;
}
