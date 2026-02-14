import type { ReactNode } from 'react';
import { FilterBar } from './filter-bar';

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  showFilters?: boolean;
}

export function PageLayout({ title, subtitle, children, showFilters = true }: PageLayoutProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">{title}</h1>
        {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
      </div>
      {showFilters && <FilterBar />}
      {children}
    </div>
  );
}
