import { Badge } from '@/components/ui/badge';

interface RankBadgeProps {
  rank: number;
  total: number;
}

export function RankBadge({ rank, total }: RankBadgeProps) {
  const percentile = ((total - rank) / total) * 100;

  let colorClass: string;
  if (percentile >= 80) colorClass = 'bg-green-500/20 text-green-400 border-green-500/30';
  else if (percentile >= 60) colorClass = 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  else if (percentile >= 40) colorClass = 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
  else if (percentile >= 20) colorClass = 'bg-orange-500/20 text-orange-400 border-orange-500/30';
  else colorClass = 'bg-red-500/20 text-red-400 border-red-500/30';

  return (
    <Badge variant="outline" className={`text-xs ${colorClass}`}>
      #{rank}
    </Badge>
  );
}
