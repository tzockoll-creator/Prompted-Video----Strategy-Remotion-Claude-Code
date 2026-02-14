import { useState, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { ArrowUpDown } from 'lucide-react';
import { useFilters } from '@/context/filter-context';
import { PageLayout } from '@/components/layout/page-layout';
import { ChartContainer } from '@/components/charts/chart-container';
import { RankBadge } from '@/components/shared/rank-badge';
import { getLatestQuarterData, rankBranches, groupByBranch } from '@/lib/data-helpers';
import { formatCurrencyK, formatNumber, formatPercent } from '@/lib/formatters';
import { CHART_COLORS, REGION_COLORS } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import type { BranchRecord } from '@/types';

type SortKey = keyof BranchRecord;
type SortDir = 'asc' | 'desc';

const TABLE_COLUMNS: { key: SortKey; label: string; format: (v: number) => string }[] = [
  { key: 'branchProfitK', label: 'Profit (K)', format: formatCurrencyK },
  { key: 'totalMembers', label: 'Members', format: formatNumber },
  { key: 'npsScore', label: 'NPS', format: (v) => v.toFixed(0) },
  { key: 'digitalAdoptionPct', label: 'Digital %', format: formatPercent },
  { key: 'totalDepositsK', label: 'Deposits (K)', format: formatCurrencyK },
  { key: 'totalLoansK', label: 'Loans (K)', format: formatCurrencyK },
];

const TREND_METRICS: { key: keyof BranchRecord; label: string }[] = [
  { key: 'branchProfitK', label: 'Profit' },
  { key: 'totalMembers', label: 'Members' },
  { key: 'npsScore', label: 'NPS' },
  { key: 'digitalAdoptionPct', label: 'Digital Adoption %' },
  { key: 'totalDepositsK', label: 'Deposits' },
  { key: 'totalLoansK', label: 'Loans' },
];

export function BranchComparison() {
  const { filteredData } = useFilters();
  const [sortKey, setSortKey] = useState<SortKey>('branchProfitK');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [trendMetric, setTrendMetric] = useState<keyof BranchRecord>('branchProfitK');

  const latestData = useMemo(() => getLatestQuarterData(filteredData), [filteredData]);
  const sorted = useMemo(() => rankBranches(latestData, sortKey, sortDir), [latestData, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const toggleBranch = (name: string) => {
    setSelectedBranches(prev =>
      prev.includes(name)
        ? prev.filter(b => b !== name)
        : prev.length < 5 ? [...prev, name] : prev
    );
  };

  const selectTop3 = () => {
    const top = rankBranches(latestData, 'branchProfitK', 'desc').slice(0, 3).map(b => b.branchName);
    setSelectedBranches(top);
  };

  const selectBottom3 = () => {
    const bottom = rankBranches(latestData, 'branchProfitK', 'asc').slice(0, 3).map(b => b.branchName);
    setSelectedBranches(bottom);
  };

  const comparisonData = useMemo(() => {
    if (selectedBranches.length === 0) return [];
    return selectedBranches.map(name => {
      const row = latestData.find(r => r.branchName === name);
      return row ? {
        name: name.length > 15 ? name.slice(0, 14) + '…' : name,
        profit: row.branchProfitK,
        members: row.totalMembers,
        deposits: Math.round(row.totalDepositsK / 1000),
        loans: Math.round(row.totalLoansK / 1000),
        nps: row.npsScore,
        digital: row.digitalAdoptionPct,
        operatingCost: row.operatingCostK,
        netNew: row.netNewMembers,
      } : null;
    }).filter(Boolean);
  }, [selectedBranches, latestData]);

  const trendData = useMemo(() => {
    if (selectedBranches.length === 0) return [];
    const byBranch = groupByBranch(filteredData);
    const quarters = [...new Set(filteredData.map(r => r.quarter))].sort();
    return quarters.map(q => {
      const point: Record<string, string | number> = { quarter: q.replace('20', "'") };
      for (const name of selectedBranches) {
        const records = byBranch.get(name) ?? [];
        const rec = records.find(r => r.quarter === q);
        point[name] = rec ? Number(rec[trendMetric]) : 0;
      }
      return point;
    });
  }, [selectedBranches, filteredData, trendMetric]);

  const getPercentileColor = (value: number, key: SortKey) => {
    const values = latestData.map(r => Number(r[key])).sort((a, b) => a - b);
    const idx = values.findIndex(v => v >= value);
    const pct = (idx / values.length) * 100;
    if (pct >= 80) return 'text-green-400';
    if (pct >= 60) return 'text-blue-400';
    if (pct >= 40) return 'text-slate-300';
    if (pct >= 20) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <PageLayout title="Branch Comparison" subtitle="Compare performance across branches">
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-300">All Branches — Latest Quarter</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={selectTop3} className="text-xs">Top 3</Button>
              <Button variant="outline" size="sm" onClick={selectBottom3} className="text-xs">Bottom 3</Button>
              {selectedBranches.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setSelectedBranches([])} className="text-xs text-slate-400">Clear</Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 px-3 text-slate-400 font-medium w-8"></th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">Branch</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-medium">Region</th>
                  {TABLE_COLUMNS.map(col => (
                    <th
                      key={col.key}
                      className="text-right py-2 px-3 text-slate-400 font-medium cursor-pointer hover:text-slate-200 select-none"
                      onClick={() => handleSort(col.key)}
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.label}
                        {sortKey === col.key && <ArrowUpDown className="h-3 w-3" />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((row, i) => (
                  <tr
                    key={row.branchName}
                    className={`border-b border-slate-800 cursor-pointer transition-colors ${
                      selectedBranches.includes(row.branchName)
                        ? 'bg-blue-500/10'
                        : 'hover:bg-slate-800/50'
                    }`}
                    onClick={() => toggleBranch(row.branchName)}
                  >
                    <td className="py-2 px-3">
                      <RankBadge rank={i + 1} total={sorted.length} />
                    </td>
                    <td className="py-2 px-3">
                      <span className="font-medium text-slate-200">{row.branchName}</span>
                      <span className="ml-2 text-xs text-slate-500">{row.branchType}</span>
                    </td>
                    <td className="py-2 px-3">
                      <Badge
                        variant="outline"
                        className="text-xs"
                        style={{ borderColor: REGION_COLORS[row.region], color: REGION_COLORS[row.region] }}
                      >
                        {row.region}
                      </Badge>
                    </td>
                    {TABLE_COLUMNS.map(col => (
                      <td key={col.key} className={`py-2 px-3 text-right font-mono text-xs ${getPercentileColor(Number(row[col.key]), col.key)}`}>
                        {col.format(Number(row[col.key]))}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {selectedBranches.length >= 2 && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <ChartContainer title="Financial Comparison" subtitle="Profit & Operating Cost">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                  <Legend />
                  <Bar dataKey="profit" name="Profit (K)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="operatingCost" name="Op Cost (K)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>

            <ChartContainer title="Membership" subtitle="Members & Net New">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                  <Legend />
                  <Bar dataKey="members" name="Total Members" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="netNew" name="Net New" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>

            <ChartContainer title="Digital & NPS" subtitle="Adoption % and Score">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                  <Legend />
                  <Bar dataKey="digital" name="Digital Adoption %" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="nps" name="NPS Score" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>

            <ChartContainer title="Deposits & Loans" subtitle="In millions">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                  <Legend />
                  <Bar dataKey="deposits" name="Deposits (M)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="loans" name="Loans (M)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          <ChartContainer title="Trend Comparison">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs text-slate-400">Metric:</span>
              <Select value={trendMetric as string} onValueChange={(v) => setTrendMetric(v as keyof BranchRecord)}>
                <SelectTrigger className="w-48 h-8 text-xs bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TREND_METRICS.map(m => (
                    <SelectItem key={m.key} value={m.key}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="quarter" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                <Legend />
                {selectedBranches.map((name, i) => (
                  <Line
                    key={name}
                    type="monotone"
                    dataKey={name}
                    stroke={CHART_COLORS[i % CHART_COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </>
      )}

      {selectedBranches.length > 0 && selectedBranches.length < 2 && (
        <div className="text-center text-slate-500 py-8">
          Select at least 2 branches to compare (click rows in the table above)
        </div>
      )}
    </PageLayout>
  );
}
