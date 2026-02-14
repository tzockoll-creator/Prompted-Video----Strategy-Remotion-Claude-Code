import { useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { DollarSign, Users, Star, Smartphone, UserPlus } from 'lucide-react';
import { useFilters } from '@/context/filter-context';
import { PageLayout } from '@/components/layout/page-layout';
import { KpiCard } from '@/components/shared/kpi-card';
import { RankBadge } from '@/components/shared/rank-badge';
import { ChartContainer } from '@/components/charts/chart-container';
import {
  groupByQuarter, getLatestQuarterData, getPreviousQuarterData,
  aggregateMetric, rankBranches,
} from '@/lib/data-helpers';
import { formatCurrencyK, formatNumber, formatPercent } from '@/lib/formatters';
import { REGION_COLORS } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ExecutiveOverview() {
  const { filteredData } = useFilters();

  const latestData = useMemo(() => getLatestQuarterData(filteredData), [filteredData]);
  const latestQuarter = latestData[0]?.quarter ?? '';
  const prevData = useMemo(
    () => getPreviousQuarterData(filteredData, latestQuarter),
    [filteredData, latestQuarter]
  );

  const kpis = useMemo(() => {
    const totalProfit = aggregateMetric(latestData, 'branchProfitK');
    const prevProfit = aggregateMetric(prevData, 'branchProfitK');
    const totalMembers = aggregateMetric(latestData, 'totalMembers');
    const prevMembers = aggregateMetric(prevData, 'totalMembers');
    const avgNps = aggregateMetric(latestData, 'npsScore', 'avg');
    const prevNps = aggregateMetric(prevData, 'npsScore', 'avg');
    const avgDigital = aggregateMetric(latestData, 'digitalAdoptionPct', 'avg');
    const prevDigital = aggregateMetric(prevData, 'digitalAdoptionPct', 'avg');
    const netNew = aggregateMetric(latestData, 'netNewMembers');
    const prevNetNew = aggregateMetric(prevData, 'netNewMembers');

    return {
      totalProfit,
      profitTrend: prevProfit ? ((totalProfit - prevProfit) / prevProfit) * 100 : null,
      totalMembers,
      membersTrend: prevMembers ? ((totalMembers - prevMembers) / prevMembers) * 100 : null,
      avgNps,
      npsTrend: prevNps ? avgNps - prevNps : null,
      avgDigital,
      digitalTrend: prevDigital ? avgDigital - prevDigital : null,
      netNew,
      netNewTrend: prevNetNew ? ((netNew - prevNetNew) / Math.abs(prevNetNew)) * 100 : null,
    };
  }, [latestData, prevData]);

  const trendData = useMemo(() => {
    const byQuarter = groupByQuarter(filteredData);
    return Array.from(byQuarter.entries())
      .map(([quarter, records]) => ({
        quarter: quarter.replace('20', "'"),
        interestIncome: Math.round(aggregateMetric(records, 'interestIncomeK')),
        feeIncome: Math.round(aggregateMetric(records, 'feeIncomeK')),
        operatingCost: Math.round(aggregateMetric(records, 'operatingCostK')),
        profit: Math.round(aggregateMetric(records, 'branchProfitK')),
      }))
      .sort((a, b) => a.quarter.localeCompare(b.quarter));
  }, [filteredData]);

  const regionalData = useMemo(() => {
    const regionMap = new Map<string, { profit: number; deposits: number; loans: number }>();
    for (const row of latestData) {
      const existing = regionMap.get(row.region) ?? { profit: 0, deposits: 0, loans: 0 };
      existing.profit += row.branchProfitK;
      existing.deposits += row.totalDepositsK;
      existing.loans += row.totalLoansK;
      regionMap.set(row.region, existing);
    }
    return Array.from(regionMap.entries()).map(([region, data]) => ({
      region,
      profit: Math.round(data.profit),
      deposits: Math.round(data.deposits / 1000),
      loans: Math.round(data.loans / 1000),
      fill: REGION_COLORS[region] ?? '#94a3b8',
    }));
  }, [latestData]);

  const ranked = useMemo(() => rankBranches(latestData, 'branchProfitK', 'desc'), [latestData]);
  const top5 = ranked.slice(0, 5);
  const bottom5 = [...ranked].reverse().slice(0, 5);

  return (
    <PageLayout title="Executive Overview" subtitle={`Performance summary — ${latestQuarter || 'All periods'}`}>
      <div className="grid grid-cols-5 gap-4">
        <KpiCard
          title="Total Profit"
          value={formatCurrencyK(kpis.totalProfit)}
          trend={kpis.profitTrend}
          icon={DollarSign}
          iconColor="text-green-400"
        />
        <KpiCard
          title="Total Members"
          value={formatNumber(kpis.totalMembers)}
          trend={kpis.membersTrend}
          icon={Users}
          iconColor="text-blue-400"
        />
        <KpiCard
          title="Avg NPS"
          value={kpis.avgNps.toFixed(1)}
          trend={kpis.npsTrend}
          icon={Star}
          iconColor="text-yellow-400"
        />
        <KpiCard
          title="Digital Adoption"
          value={formatPercent(kpis.avgDigital)}
          trend={kpis.digitalTrend}
          icon={Smartphone}
          iconColor="text-cyan-400"
        />
        <KpiCard
          title="Net New Members"
          value={formatNumber(kpis.netNew)}
          trend={kpis.netNewTrend}
          icon={UserPlus}
          iconColor="text-violet-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ChartContainer title="Profit & Revenue Trend" subtitle="All branches aggregated by quarter">
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="quarter" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v: number) => `${(v/1000).toFixed(0)}M`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                labelStyle={{ color: '#f1f5f9' }}
                itemStyle={{ color: '#94a3b8' }}
              />
              <Legend />
              <Line type="monotone" dataKey="interestIncome" name="Interest Income" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="feeIncome" name="Fee Income" stroke="#06b6d4" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="operatingCost" name="Operating Cost" stroke="#ef4444" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="profit" name="Profit" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Regional Performance" subtitle={`${latestQuarter} — Profit (K), Deposits & Loans (M)`}>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={regionalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="region" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                labelStyle={{ color: '#f1f5f9' }}
              />
              <Legend />
              <Bar dataKey="profit" name="Profit (K)" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="deposits" name="Deposits (M)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="loans" name="Loans (M)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Top 5 Branches by Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {top5.map((branch, i) => (
                <div key={branch.branchName} className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    <RankBadge rank={i + 1} total={ranked.length} />
                    <div>
                      <p className="text-sm font-medium text-slate-200">{branch.branchName}</p>
                      <p className="text-xs text-slate-500">{branch.region} — {branch.branchType}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-green-400">{formatCurrencyK(branch.branchProfitK)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Bottom 5 Branches by Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {bottom5.map((branch, i) => (
                <div key={branch.branchName} className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    <RankBadge rank={ranked.length - i} total={ranked.length} />
                    <div>
                      <p className="text-sm font-medium text-slate-200">{branch.branchName}</p>
                      <p className="text-xs text-slate-500">{branch.region} — {branch.branchType}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-red-400">{formatCurrencyK(branch.branchProfitK)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
