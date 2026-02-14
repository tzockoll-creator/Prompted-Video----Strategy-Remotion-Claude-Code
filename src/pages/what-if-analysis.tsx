import { useState, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts';
import { useFilters } from '@/context/filter-context';
import { PageLayout } from '@/components/layout/page-layout';
import { ChartContainer } from '@/components/charts/chart-container';
import {
  getLatestQuarterData, aggregateMetric, groupByQuarter,
} from '@/lib/data-helpers';
import { formatCurrencyK, formatNumber, formatPercent } from '@/lib/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  projectMetrics, calculateSensitivity, DEFAULT_WHAT_IF,
  type ProjectedMetrics,
} from '@/lib/calculations';
import type { BranchRecord, WhatIfParams } from '@/types';

function ImpactCard({ label, before, after, format }: {
  label: string;
  before: number;
  after: number;
  format: (v: number) => string;
}) {
  const delta = after - before;
  const pctChange = before !== 0 ? (delta / Math.abs(before)) * 100 : 0;
  const isPositive = delta >= 0;

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardContent className="p-4">
        <p className="text-xs text-slate-400 font-medium mb-2">{label}</p>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-slate-500">Current</p>
            <p className="text-lg font-bold text-slate-300">{format(before)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Projected</p>
            <p className={`text-lg font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {format(after)}
            </p>
          </div>
        </div>
        <p className={`text-xs mt-1 text-right ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? '+' : ''}{pctChange.toFixed(1)}%
        </p>
      </CardContent>
    </Card>
  );
}

export function WhatIfAnalysis() {
  const { filteredData } = useFilters();
  const [params, setParams] = useState<WhatIfParams>({ ...DEFAULT_WHAT_IF });
  const [selectedBranch, setSelectedBranch] = useState<string>('__all__');

  const latestData = useMemo(() => getLatestQuarterData(filteredData), [filteredData]);
  const branchNames = useMemo(() => [...new Set(latestData.map(r => r.branchName))].sort(), [latestData]);

  const baseline = useMemo((): BranchRecord => {
    if (selectedBranch === '__all__') {
      const agg: Partial<BranchRecord> = {};
      const keys: (keyof BranchRecord)[] = [
        'interestIncomeK', 'feeIncomeK', 'operatingCostK', 'branchProfitK',
        'totalMembers', 'totalLoansK', 'totalDepositsK',
      ];
      for (const key of keys) {
        (agg as Record<string, number>)[key] = aggregateMetric(latestData, key);
      }
      agg.digitalAdoptionPct = aggregateMetric(latestData, 'digitalAdoptionPct', 'avg');
      agg.branchName = 'All Branches';
      agg.quarter = latestData[0]?.quarter ?? '';
      return agg as BranchRecord;
    }
    return latestData.find(r => r.branchName === selectedBranch) ?? latestData[0];
  }, [selectedBranch, latestData]);

  const projected: ProjectedMetrics = useMemo(
    () => projectMetrics(baseline, params),
    [baseline, params]
  );

  const sensitivity = useMemo(
    () => calculateSensitivity(baseline, params),
    [baseline, params]
  );

  const comparisonChartData = useMemo(() => [
    { metric: 'Interest Inc.', current: baseline.interestIncomeK, projected: projected.interestIncomeK },
    { metric: 'Fee Inc.', current: baseline.feeIncomeK, projected: projected.feeIncomeK },
    { metric: 'Op. Cost', current: baseline.operatingCostK, projected: projected.operatingCostK },
    { metric: 'Profit', current: baseline.branchProfitK, projected: projected.branchProfitK },
  ], [baseline, projected]);

  const trendChartData = useMemo(() => {
    const byQ = groupByQuarter(filteredData);
    const quarters = [...byQ.keys()].sort();

    const historicalData = quarters.map(q => {
      const recs = byQ.get(q)!;
      if (selectedBranch === '__all__') {
        return { quarter: q.replace('20', "'"), profit: aggregateMetric(recs, 'branchProfitK'), type: 'actual' as const };
      }
      const rec = recs.find(r => r.branchName === selectedBranch);
      return { quarter: q.replace('20', "'"), profit: rec?.branchProfitK ?? 0, type: 'actual' as const };
    });

    const lastProfit = historicalData[historicalData.length - 1]?.profit ?? 0;
    const projectedQuarters = ["'26-Q1", "'26-Q2", "'26-Q3", "'26-Q4"];
    const projectedData = projectedQuarters.map((q, i) => ({
      quarter: q,
      profit: null as number | null,
      projected: +(lastProfit + (projected.branchProfitK - lastProfit) * ((i + 1) / 4)).toFixed(1),
      type: 'projected' as const,
    }));

    return [
      ...historicalData.map(d => ({ ...d, projected: null as number | null })),
      { quarter: historicalData[historicalData.length - 1]?.quarter ?? '', profit: lastProfit, projected: lastProfit, type: 'bridge' as const },
      ...projectedData,
    ];
  }, [filteredData, selectedBranch, projected]);

  const updateParam = (key: keyof WhatIfParams, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const sliders: { key: keyof WhatIfParams; label: string; min: number; max: number; step: number; unit: string }[] = [
    { key: 'interestRateChangePct', label: 'Interest Rate Change', min: -10, max: 10, step: 0.5, unit: '%' },
    { key: 'memberGrowthRatePct', label: 'Member Growth Rate', min: -5, max: 15, step: 0.5, unit: '%' },
    { key: 'operatingCostChangePct', label: 'Operating Cost Change', min: -20, max: 20, step: 1, unit: '%' },
    { key: 'digitalAdoptionTargetPct', label: 'Digital Adoption Target', min: 30, max: 100, step: 1, unit: '%' },
    { key: 'loanGrowthRatePct', label: 'Loan Growth Rate', min: -10, max: 20, step: 0.5, unit: '%' },
  ];

  return (
    <PageLayout title="What-If Analysis" subtitle="Model different scenarios and see projected outcomes">
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Scenario Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Label className="text-xs text-slate-400">Branch</Label>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger className="mt-1 h-8 text-xs bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Branches (Aggregate)</SelectItem>
                  {branchNames.map(name => (
                    <SelectItem key={name} value={name}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {sliders.map(s => (
              <div key={s.key}>
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-xs text-slate-400">{s.label}</Label>
                  <span className="text-xs font-mono text-slate-300">
                    {params[s.key] > 0 ? '+' : ''}{params[s.key]}{s.unit}
                  </span>
                </div>
                <Slider
                  value={[params[s.key]]}
                  onValueChange={([v]) => updateParam(s.key, v)}
                  min={s.min}
                  max={s.max}
                  step={s.step}
                  className="py-1"
                />
              </div>
            ))}

            <button
              onClick={() => setParams({ ...DEFAULT_WHAT_IF })}
              className="w-full mt-2 py-1.5 text-xs text-slate-400 hover:text-slate-200 border border-slate-700 rounded-md hover:bg-slate-800 transition-colors"
            >
              Reset to Defaults
            </button>
          </CardContent>
        </Card>

        <div className="col-span-3 space-y-4">
          <div className="grid grid-cols-5 gap-3">
            <ImpactCard label="Profit" before={baseline.branchProfitK} after={projected.branchProfitK} format={formatCurrencyK} />
            <ImpactCard label="Members" before={baseline.totalMembers} after={projected.totalMembers} format={formatNumber} />
            <ImpactCard label="Digital Adoption" before={baseline.digitalAdoptionPct} after={projected.digitalAdoptionPct} format={formatPercent} />
            <ImpactCard label="Loans" before={baseline.totalLoansK} after={projected.totalLoansK} format={formatCurrencyK} />
            <ImpactCard label="Operating Cost" before={baseline.operatingCostK} after={projected.operatingCostK} format={formatCurrencyK} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ChartContainer title="Current vs Projected" subtitle="Key financial metrics">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={comparisonChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="metric" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                  <Legend />
                  <Bar dataKey="current" name="Current" fill="#64748b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="projected" name="Projected" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>

            <ChartContainer title="Projected Trend" subtitle="Historical + 4 projected quarters">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={trendChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="quarter" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
                  <Legend />
                  <Line type="monotone" dataKey="profit" name="Actual" stroke="#10b981" strokeWidth={2} dot={false} connectNulls={false} />
                  <Line type="monotone" dataKey="projected" name="Projected" stroke="#3b82f6" strokeWidth={2} strokeDasharray="8 4" dot={false} connectNulls={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          <ChartContainer title="Sensitivity Analysis" subtitle="Independent profit impact of each parameter">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={sensitivity} layout="vertical" margin={{ left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                <YAxis type="category" dataKey="parameter" stroke="#94a3b8" fontSize={11} width={95} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                  formatter={(value: number) => [`${value >= 0 ? '+' : ''}${value.toFixed(1)}K`, 'Profit Impact']}
                />
                <ReferenceLine x={0} stroke="#475569" />
                <Bar dataKey="impact" name="Profit Impact (K)" radius={[0, 4, 4, 0]}>
                  {sensitivity.map((entry, i) => (
                    <Cell key={i} fill={entry.impact >= 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </div>
    </PageLayout>
  );
}
