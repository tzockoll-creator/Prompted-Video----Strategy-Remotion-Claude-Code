import { useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Smartphone, Monitor, CreditCard, UserCheck, Landmark } from 'lucide-react';
import { useFilters } from '@/context/filter-context';
import { PageLayout } from '@/components/layout/page-layout';
import { KpiCard } from '@/components/shared/kpi-card';
import { ChartContainer } from '@/components/charts/chart-container';
import {
  groupByQuarter, getLatestQuarterData, getPreviousQuarterData,
  aggregateMetric, rankBranches,
} from '@/lib/data-helpers';
import { formatPercent, formatNumber } from '@/lib/formatters';
import { REGION_COLORS } from '@/lib/constants';

export function DigitalTransformation() {
  const { filteredData } = useFilters();

  const latestData = useMemo(() => getLatestQuarterData(filteredData), [filteredData]);
  const latestQ = latestData[0]?.quarter ?? '';
  const prevData = useMemo(() => getPreviousQuarterData(filteredData, latestQ), [filteredData, latestQ]);

  const kpis = useMemo(() => {
    const avg = (d: typeof latestData, k: keyof typeof latestData[0]) => aggregateMetric(d, k, 'avg');
    const sum = (d: typeof latestData, k: keyof typeof latestData[0]) => aggregateMetric(d, k);
    return {
      digitalAdoption: avg(latestData, 'digitalAdoptionPct'),
      digitalAdoptionPrev: avg(prevData, 'digitalAdoptionPct'),
      mobileAdoption: avg(latestData, 'mobileAppAdoptionPct'),
      mobileAdoptionPrev: avg(prevData, 'mobileAppAdoptionPct'),
      digitalTx: sum(latestData, 'digitalTransactions'),
      digitalTxPrev: sum(prevData, 'digitalTransactions'),
      digitalOpens: sum(latestData, 'digitalAccountOpens'),
      digitalOpensPrev: sum(prevData, 'digitalAccountOpens'),
      mobileDeposit: avg(latestData, 'mobileDepositAdoptionPct'),
      mobileDepositPrev: avg(prevData, 'mobileDepositAdoptionPct'),
    };
  }, [latestData, prevData]);

  const trendData = useMemo(() => {
    const byQ = groupByQuarter(filteredData);
    return Array.from(byQ.entries()).map(([q, recs]) => ({
      quarter: q.replace('20', "'"),
      digitalAdoption: +(aggregateMetric(recs, 'digitalAdoptionPct', 'avg').toFixed(1)),
      mobileApp: +(aggregateMetric(recs, 'mobileAppAdoptionPct', 'avg').toFixed(1)),
      mobileDeposit: +(aggregateMetric(recs, 'mobileDepositAdoptionPct', 'avg').toFixed(1)),
      billPay: +(aggregateMetric(recs, 'billPayAdoptionPct', 'avg').toFixed(1)),
    })).sort((a, b) => a.quarter.localeCompare(b.quarter));
  }, [filteredData]);

  const channelData = useMemo(() => {
    const byQ = groupByQuarter(filteredData);
    return Array.from(byQ.entries()).map(([q, recs]) => ({
      quarter: q.replace('20', "'"),
      digital: +(aggregateMetric(recs, 'digitalSharePct', 'avg').toFixed(1)),
      teller: +(aggregateMetric(recs, 'tellerSharePct', 'avg').toFixed(1)),
    })).sort((a, b) => a.quarter.localeCompare(b.quarter));
  }, [filteredData]);

  const mobileData = useMemo(() => {
    const byQ = groupByQuarter(filteredData);
    return Array.from(byQ.entries()).map(([q, recs]) => ({
      quarter: q.replace('20', "'"),
      mobileOnly: aggregateMetric(recs, 'mobileOnlyMembers'),
      activeDigital: aggregateMetric(recs, 'activeDigitalMembers'),
    })).sort((a, b) => a.quarter.localeCompare(b.quarter));
  }, [filteredData]);

  const digitalOpensData = useMemo(() => {
    const byQ = groupByQuarter(filteredData);
    return Array.from(byQ.entries()).map(([q, recs]) => ({
      quarter: q.replace('20', "'"),
      opens: aggregateMetric(recs, 'digitalAccountOpens'),
    })).sort((a, b) => a.quarter.localeCompare(b.quarter));
  }, [filteredData]);

  const maturityData = useMemo(() => {
    return rankBranches(latestData, 'digitalAdoptionPct', 'desc').map(row => ({
      name: row.branchName,
      adoption: row.digitalAdoptionPct,
      fill: REGION_COLORS[row.region] ?? '#94a3b8',
      type: row.branchType,
    }));
  }, [latestData]);

  const delta = (curr: number, prev: number) => prev ? curr - prev : null;

  return (
    <PageLayout title="Digital Transformation" subtitle="Digital channel adoption and trends">
      <div className="grid grid-cols-5 gap-4">
        <KpiCard
          title="Digital Adoption"
          value={formatPercent(kpis.digitalAdoption)}
          trend={delta(kpis.digitalAdoption, kpis.digitalAdoptionPrev)}
          icon={Monitor}
          iconColor="text-blue-400"
        />
        <KpiCard
          title="Mobile App"
          value={formatPercent(kpis.mobileAdoption)}
          trend={delta(kpis.mobileAdoption, kpis.mobileAdoptionPrev)}
          icon={Smartphone}
          iconColor="text-cyan-400"
        />
        <KpiCard
          title="Digital Transactions"
          value={formatNumber(kpis.digitalTx)}
          trend={kpis.digitalTxPrev ? ((kpis.digitalTx - kpis.digitalTxPrev) / kpis.digitalTxPrev) * 100 : null}
          icon={CreditCard}
          iconColor="text-violet-400"
        />
        <KpiCard
          title="Digital Acct Opens"
          value={formatNumber(kpis.digitalOpens)}
          trend={kpis.digitalOpensPrev ? ((kpis.digitalOpens - kpis.digitalOpensPrev) / kpis.digitalOpensPrev) * 100 : null}
          icon={UserCheck}
          iconColor="text-green-400"
        />
        <KpiCard
          title="Mobile Deposit"
          value={formatPercent(kpis.mobileDeposit)}
          trend={delta(kpis.mobileDeposit, kpis.mobileDepositPrev)}
          icon={Landmark}
          iconColor="text-amber-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ChartContainer title="Adoption Trends" subtitle="Average across filtered branches">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="quarter" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} unit="%" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
              <Legend />
              <Line type="monotone" dataKey="digitalAdoption" name="Digital Adoption" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="mobileApp" name="Mobile App" stroke="#06b6d4" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="mobileDeposit" name="Mobile Deposit" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="billPay" name="Bill Pay" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Digital vs Teller Share" subtitle="Transaction channel mix">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={channelData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="quarter" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} unit="%" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
              <Legend />
              <Area type="monotone" dataKey="digital" name="Digital %" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
              <Area type="monotone" dataKey="teller" name="Teller %" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.4} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Mobile Metrics" subtitle="Total mobile-only & active digital members">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mobileData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="quarter" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
              <Legend />
              <Line type="monotone" dataKey="activeDigital" name="Active Digital Members" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="mobileOnly" name="Mobile-Only Members" stroke="#06b6d4" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Digital Account Opens" subtitle="Per quarter">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={digitalOpensData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="quarter" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
              <Bar dataKey="opens" name="Digital Opens" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      <ChartContainer title="Branch Digital Maturity" subtitle="Ranked by digital adoption % — colored by region">
        <ResponsiveContainer width="100%" height={Math.max(400, maturityData.length * 32)}>
          <BarChart data={maturityData} layout="vertical" margin={{ left: 140 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis type="number" stroke="#94a3b8" fontSize={12} unit="%" domain={[0, 100]} />
            <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} width={130} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
              formatter={(value: number, _: string, entry: { payload: { type: string } }) => [`${value}%`, entry.payload.type]}
            />
            <Bar dataKey="adoption" radius={[0, 4, 4, 0]}>
              {maturityData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </PageLayout>
  );
}
