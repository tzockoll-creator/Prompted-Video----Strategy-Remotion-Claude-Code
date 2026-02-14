import { Card, CardContent } from '@/components/ui/card';
import { TrendIndicator } from './trend-indicator';
import type { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string;
  trend?: number | null;
  icon?: LucideIcon;
  iconColor?: string;
}

export function KpiCard({ title, value, trend, icon: Icon, iconColor = 'text-blue-400' }: KpiCardProps) {
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{title}</p>
            <p className="text-2xl font-bold text-slate-100">{value}</p>
            {trend != null && <TrendIndicator value={trend} />}
          </div>
          {Icon && (
            <div className={`p-2 rounded-lg bg-slate-800 ${iconColor}`}>
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
