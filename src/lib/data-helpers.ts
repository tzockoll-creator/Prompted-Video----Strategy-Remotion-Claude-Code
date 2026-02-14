import type { BranchRecord, FilterState } from '@/types';

export function filterData(data: BranchRecord[], filters: FilterState): BranchRecord[] {
  return data.filter(row =>
    filters.quarters.includes(row.quarter) &&
    filters.regions.includes(row.region) &&
    filters.branchTypes.includes(row.branchType)
  );
}

export function groupByBranch(data: BranchRecord[]): Map<string, BranchRecord[]> {
  const map = new Map<string, BranchRecord[]>();
  for (const row of data) {
    const existing = map.get(row.branchName) ?? [];
    existing.push(row);
    map.set(row.branchName, existing);
  }
  return map;
}

export function groupByQuarter(data: BranchRecord[]): Map<string, BranchRecord[]> {
  const map = new Map<string, BranchRecord[]>();
  for (const row of data) {
    const existing = map.get(row.quarter) ?? [];
    existing.push(row);
    map.set(row.quarter, existing);
  }
  return map;
}

export function groupByRegion(data: BranchRecord[]): Map<string, BranchRecord[]> {
  const map = new Map<string, BranchRecord[]>();
  for (const row of data) {
    const existing = map.get(row.region) ?? [];
    existing.push(row);
    map.set(row.region, existing);
  }
  return map;
}

export function aggregateMetric(
  records: BranchRecord[],
  metricKey: keyof BranchRecord,
  aggType: 'sum' | 'avg' = 'sum'
): number {
  if (records.length === 0) return 0;
  const values = records.map(r => Number(r[metricKey]));
  const sum = values.reduce((a, b) => a + b, 0);
  return aggType === 'avg' ? sum / values.length : sum;
}

export function getLatestQuarterData(data: BranchRecord[]): BranchRecord[] {
  const quarters = [...new Set(data.map(r => r.quarter))].sort();
  const latest = quarters[quarters.length - 1];
  return data.filter(r => r.quarter === latest);
}

export function getPreviousQuarterData(data: BranchRecord[], currentQuarter: string): BranchRecord[] {
  const quarters = [...new Set(data.map(r => r.quarter))].sort();
  const idx = quarters.indexOf(currentQuarter);
  if (idx <= 0) return [];
  return data.filter(r => r.quarter === quarters[idx - 1]);
}

export function rankBranches(
  data: BranchRecord[],
  metricKey: keyof BranchRecord,
  order: 'asc' | 'desc' = 'desc'
): BranchRecord[] {
  return [...data].sort((a, b) => {
    const va = Number(a[metricKey]);
    const vb = Number(b[metricKey]);
    return order === 'desc' ? vb - va : va - vb;
  });
}

export function getQuarterOverQuarterChange(
  data: BranchRecord[],
  branchName: string,
  metricKey: keyof BranchRecord
): number | null {
  const branchData = data
    .filter(r => r.branchName === branchName)
    .sort((a, b) => a.quarter.localeCompare(b.quarter));
  if (branchData.length < 2) return null;
  const current = Number(branchData[branchData.length - 1][metricKey]);
  const previous = Number(branchData[branchData.length - 2][metricKey]);
  if (previous === 0) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

export function getUniqueValues<K extends keyof BranchRecord>(
  data: BranchRecord[],
  key: K
): BranchRecord[K][] {
  return [...new Set(data.map(r => r[key]))];
}
