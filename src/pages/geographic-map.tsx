import { useState, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '@/styles/leaflet-overrides.css';
import { useFilters } from '@/context/filter-context';
import { PageLayout } from '@/components/layout/page-layout';
import { BRANCH_COORDINATES } from '@/data/branch-coordinates';
import { getLatestQuarterData, rankBranches } from '@/lib/data-helpers';
import { formatCurrencyK, formatNumber, formatPercent } from '@/lib/formatters';
import { MAP_CENTER, MAP_ZOOM, REGION_COLORS } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import type { BranchRecord } from '@/types';

const COLOR_BY_OPTIONS: { key: keyof BranchRecord; label: string }[] = [
  { key: 'branchProfitK', label: 'Profit' },
  { key: 'npsScore', label: 'NPS Score' },
  { key: 'digitalAdoptionPct', label: 'Digital Adoption' },
  { key: 'totalMembers', label: 'Members' },
  { key: 'totalDepositsK', label: 'Deposits' },
];

function getMetricColor(value: number, min: number, max: number): string {
  const pct = max === min ? 0.5 : (value - min) / (max - min);
  if (pct >= 0.8) return '#10b981';
  if (pct >= 0.6) return '#3b82f6';
  if (pct >= 0.4) return '#f59e0b';
  if (pct >= 0.2) return '#f97316';
  return '#ef4444';
}

function FlyTo({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  map.flyTo(center, zoom, { duration: 1 });
  return null;
}

export function GeographicMap() {
  const { filteredData } = useFilters();
  const [colorBy, setColorBy] = useState<keyof BranchRecord>('branchProfitK');
  const [flyTarget, setFlyTarget] = useState<{ center: [number, number]; zoom: number } | null>(null);

  const latestData = useMemo(() => getLatestQuarterData(filteredData), [filteredData]);
  const ranked = useMemo(() => rankBranches(latestData, colorBy, 'desc'), [latestData, colorBy]);

  const metricRange = useMemo(() => {
    const values = latestData.map(r => Number(r[colorBy]));
    return { min: Math.min(...values), max: Math.max(...values) };
  }, [latestData, colorBy]);

  const memberRange = useMemo(() => {
    const values = latestData.map(r => r.totalMembers);
    return { min: Math.min(...values), max: Math.max(...values) };
  }, [latestData]);

  const getRadius = (members: number) => {
    const pct = (members - memberRange.min) / (memberRange.max - memberRange.min || 1);
    return 8 + pct * 18;
  };

  const handleBranchClick = (branchName: string) => {
    const coords = BRANCH_COORDINATES.find(c => c.branchName === branchName);
    if (coords) {
      setFlyTarget({ center: [coords.lat, coords.lng], zoom: 10 });
      setTimeout(() => setFlyTarget(null), 1500);
    }
  };

  return (
    <PageLayout title="Geographic Map" subtitle="Branch locations across Texas">
      <div className="grid grid-cols-4 gap-4" style={{ height: 'calc(100vh - 220px)' }}>
        <div className="col-span-3 rounded-lg overflow-hidden border border-slate-800">
          <MapContainer
            center={MAP_CENTER}
            zoom={MAP_ZOOM}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {flyTarget && <FlyTo center={flyTarget.center} zoom={flyTarget.zoom} />}
            {latestData.map(row => {
              const coords = BRANCH_COORDINATES.find(c => c.branchName === row.branchName);
              if (!coords) return null;
              const color = getMetricColor(Number(row[colorBy]), metricRange.min, metricRange.max);
              return (
                <CircleMarker
                  key={row.branchName}
                  center={[coords.lat, coords.lng]}
                  radius={getRadius(row.totalMembers)}
                  pathOptions={{
                    fillColor: color,
                    color: color,
                    fillOpacity: 0.6,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <div className="min-w-[200px]">
                      <h3 className="font-bold text-base mb-1">{row.branchName}</h3>
                      <p className="text-xs opacity-70 mb-2">{row.region} — {row.branchType}</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Profit:</span>
                          <span className="font-semibold">{formatCurrencyK(row.branchProfitK)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Members:</span>
                          <span className="font-semibold">{formatNumber(row.totalMembers)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>NPS:</span>
                          <span className="font-semibold">{row.npsScore}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Digital:</span>
                          <span className="font-semibold">{formatPercent(row.digitalAdoptionPct)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Deposits:</span>
                          <span className="font-semibold">{formatCurrencyK(row.totalDepositsK)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Loans:</span>
                          <span className="font-semibold">{formatCurrencyK(row.totalLoansK)}</span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>

        <Card className="bg-slate-900 border-slate-800 overflow-hidden flex flex-col">
          <CardHeader className="pb-2 flex-shrink-0">
            <CardTitle className="text-sm font-medium text-slate-300">Branches</CardTitle>
            <div className="mt-2">
              <span className="text-xs text-slate-400 block mb-1">Color by:</span>
              <Select value={colorBy as string} onValueChange={(v) => setColorBy(v as keyof BranchRecord)}>
                <SelectTrigger className="h-8 text-xs bg-slate-800 border-slate-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COLOR_BY_OPTIONS.map(opt => (
                    <SelectItem key={opt.key} value={opt.key}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto px-3 pb-3">
            <div className="space-y-1">
              {ranked.map((row, i) => (
                <div
                  key={row.branchName}
                  className="p-2 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
                  onClick={() => handleBranchClick(row.branchName)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-mono text-slate-500 w-5">#{i + 1}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-200 truncate">{row.branchName}</p>
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1 py-0 mt-0.5"
                          style={{ borderColor: REGION_COLORS[row.region], color: REGION_COLORS[row.region] }}
                        >
                          {row.region}
                        </Badge>
                      </div>
                    </div>
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getMetricColor(Number(row[colorBy]), metricRange.min, metricRange.max) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
