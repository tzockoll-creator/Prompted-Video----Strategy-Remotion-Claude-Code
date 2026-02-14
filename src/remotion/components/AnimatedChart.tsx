import { useCurrentFrame, interpolate } from 'remotion';
import { colors, fonts } from '../lib/design-tokens';

interface LineChartProps {
  type: 'line';
  data: { quarter: string; value: number }[];
  width?: number;
  height?: number;
  enterFrame?: number;
  color?: string;
}

interface BarChartProps {
  type: 'bar';
  data: { label: string; value: number }[];
  width?: number;
  height?: number;
  enterFrame?: number;
  color?: string;
}

type AnimatedChartProps = LineChartProps | BarChartProps;

export const AnimatedChart: React.FC<AnimatedChartProps> = (props) => {
  const { type, width = 500, height = 250, enterFrame = 0, color = colors.cyan } = props;
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - enterFrame);
  const progress = Math.min(elapsed / 60, 1);
  const eased = 1 - Math.pow(1 - progress, 3);

  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const opacity = interpolate(elapsed, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  if (type === 'line') {
    const data = props.data;
    const maxVal = Math.max(...data.map((d) => d.value)) * 1.1;
    const minVal = Math.min(...data.map((d) => d.value)) * 0.9;

    const points = data.map((d, i) => ({
      x: padding.left + (i / (data.length - 1)) * chartW,
      y: padding.top + chartH - ((d.value - minVal) / (maxVal - minVal)) * chartH,
    }));

    const pathD = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');

    const totalLength = 2000;
    const dashOffset = totalLength * (1 - eased);

    return (
      <svg width={width} height={height} style={{ opacity }}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
          const y = padding.top + chartH * (1 - pct);
          const val = Math.round(minVal + (maxVal - minVal) * pct);
          return (
            <g key={pct}>
              <line
                x1={padding.left}
                y1={y}
                x2={padding.left + chartW}
                y2={y}
                stroke={colors.cardBorder}
                strokeWidth={1}
              />
              <text
                x={padding.left - 8}
                y={y + 4}
                textAnchor="end"
                fill={colors.textMuted}
                fontSize={10}
                fontFamily={fonts.mono}
              >
                {val >= 1000 ? `${(val / 1000).toFixed(1)}K` : val}
              </text>
            </g>
          );
        })}

        {/* X-axis labels */}
        {data.map((d, i) => (
          <text
            key={d.quarter}
            x={padding.left + (i / (data.length - 1)) * chartW}
            y={height - 10}
            textAnchor="middle"
            fill={colors.textMuted}
            fontSize={10}
            fontFamily={fonts.mono}
          >
            {d.quarter}
          </text>
        ))}

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={totalLength}
          strokeDashoffset={dashOffset}
        />

        {/* Glow */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={totalLength}
          strokeDashoffset={dashOffset}
          opacity={0.3}
        />

        {/* Dots */}
        {points.map((p, i) => {
          const dotProgress = interpolate(
            eased,
            [(i / points.length) * 0.8, Math.min((i / points.length) * 0.8 + 0.15, 1)],
            [0, 1],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );
          return (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={4 * dotProgress}
              fill={color}
              opacity={dotProgress}
            />
          );
        })}
      </svg>
    );
  }

  // Bar chart
  const data = props.data;
  const maxVal = Math.max(...data.map((d) => d.value)) * 1.15;
  const barGap = 12;
  const barWidth = (chartW - barGap * (data.length - 1)) / data.length;

  return (
    <svg width={width} height={height} style={{ opacity }}>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
        const y = padding.top + chartH * (1 - pct);
        return (
          <line
            key={pct}
            x1={padding.left}
            y1={y}
            x2={padding.left + chartW}
            y2={y}
            stroke={colors.cardBorder}
            strokeWidth={1}
          />
        );
      })}

      {data.map((d, i) => {
        const barH = (d.value / maxVal) * chartH * eased;
        const x = padding.left + i * (barWidth + barGap);
        const y = padding.top + chartH - barH;

        return (
          <g key={d.label}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barH}
              rx={4}
              fill={color}
              opacity={0.8}
            />
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={Math.min(barH, 6)}
              rx={4}
              fill={color}
              opacity={1}
            />
            <text
              x={x + barWidth / 2}
              y={height - 10}
              textAnchor="middle"
              fill={colors.textMuted}
              fontSize={10}
              fontFamily={fonts.mono}
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
