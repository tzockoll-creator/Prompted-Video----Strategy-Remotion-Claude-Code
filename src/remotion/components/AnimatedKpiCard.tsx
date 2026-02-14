import { useCurrentFrame, interpolate, spring } from 'remotion';
import { FPS } from '../lib/timing';
import { colors, fonts } from '../lib/design-tokens';

interface AnimatedKpiCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  trend?: number;
  enterFrame?: number;
  index?: number;
}

export const AnimatedKpiCard: React.FC<AnimatedKpiCardProps> = ({
  label,
  value,
  prefix = '',
  suffix = '',
  trend,
  enterFrame = 0,
  index = 0,
}) => {
  const frame = useCurrentFrame();
  const delay = index * 8;

  const springVal = spring({
    frame: frame - enterFrame - delay,
    fps: FPS,
    config: { damping: 12, stiffness: 80 },
  });

  const scale = interpolate(springVal, [0, 1], [0.7, 1]);
  const opacity = interpolate(springVal, [0, 1], [0, 1]);
  const translateY = interpolate(springVal, [0, 1], [30, 0]);

  const elapsed = Math.max(0, frame - enterFrame - delay);
  const countProgress = Math.min(elapsed / 45, 1);
  const eased = 1 - Math.pow(1 - countProgress, 3);
  const displayValue = Math.round(value * eased);

  const formatValue = (v: number) => {
    if (v >= 100000) return `${(v / 1000).toFixed(1)}K`;
    if (v >= 10000) return v.toLocaleString();
    return v.toString();
  };

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale}) translateY(${translateY}px)`,
        background: colors.cardBg,
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: 12,
        padding: '20px 24px',
        minWidth: 200,
        fontFamily: fonts.body,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: colors.textMuted,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 32,
          fontWeight: 700,
          color: colors.textPrimary,
          lineHeight: 1,
        }}
      >
        {prefix}{formatValue(displayValue)}{suffix}
      </div>
      {trend != null && (
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: trend >= 0 ? colors.green : colors.red,
            marginTop: 6,
          }}
        >
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}%
        </div>
      )}
    </div>
  );
};
