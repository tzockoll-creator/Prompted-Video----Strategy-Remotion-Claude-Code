import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { colors, fonts } from '../lib/design-tokens';
import { AnimatedKpiCard } from '../components/AnimatedKpiCard';
import { AnimatedChart } from '../components/AnimatedChart';
import { AnimatedMapDots } from '../components/AnimatedMapDots';
import { TypewriterText } from '../components/TypewriterText';
import { kpiData, lineChartData, barChartData, branchDots } from '../lib/sample-data';

export const DataProductsScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Background grid (small Mosaic reference)
  const gridOpacity = interpolate(frame, [0, 30], [0, 0.15], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Beam effect from bottom center up
  const beamProgress = interpolate(frame, [10, 50], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Dashboard container fade in
  const dashboardOpacity = interpolate(frame, [40, 70], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Scene fade out
  const sceneOpacity = interpolate(frame, [560, 600], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg, opacity: sceneOpacity }}>
      {/* Background grid pattern */}
      <svg width={1920} height={1080} style={{ position: 'absolute', opacity: gridOpacity }}>
        {Array.from({ length: 20 }, (_, i) => (
          <line
            key={`h-${i}`}
            x1={0}
            y1={i * 60}
            x2={1920}
            y2={i * 60}
            stroke={colors.cyan}
            strokeWidth={0.5}
            opacity={0.3}
          />
        ))}
        {Array.from({ length: 32 }, (_, i) => (
          <line
            key={`v-${i}`}
            x1={i * 60}
            y1={0}
            x2={i * 60}
            y2={1080}
            stroke={colors.cyan}
            strokeWidth={0.5}
            opacity={0.3}
          />
        ))}
      </svg>

      {/* Energy beam from bottom center */}
      <svg width={1920} height={1080} style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="beam-grad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={colors.cyan} stopOpacity={0.6} />
            <stop offset="100%" stopColor={colors.cyan} stopOpacity={0} />
          </linearGradient>
        </defs>
        <rect
          x={930}
          y={1080 - 1080 * beamProgress}
          width={60}
          height={1080 * beamProgress}
          fill="url(#beam-grad)"
          opacity={beamProgress < 1 ? 0.5 : 0.15}
          rx={30}
        />
      </svg>

      {/* Text header */}
      <div style={{ position: 'absolute', top: 30, left: 0, right: 0 }}>
        <TypewriterText
          text="Revenue-generating data products."
          startFrame={50}
          framesPerChar={2}
          fontSize={38}
          fontWeight={700}
          color={colors.textPrimary}
        />
      </div>

      {/* KPI cards row */}
      <div
        style={{
          position: 'absolute',
          top: 110,
          left: 60,
          right: 60,
          display: 'flex',
          gap: 16,
          justifyContent: 'center',
          opacity: dashboardOpacity,
        }}
      >
        {kpiData.map((kpi, i) => (
          <AnimatedKpiCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            prefix={kpi.prefix}
            suffix={kpi.suffix}
            trend={kpi.trend}
            enterFrame={60}
            index={i}
          />
        ))}
      </div>

      {/* Charts row */}
      <div
        style={{
          position: 'absolute',
          top: 340,
          left: 60,
          display: 'flex',
          gap: 40,
          opacity: dashboardOpacity,
        }}
      >
        {/* Line chart */}
        <div
          style={{
            background: colors.cardBg,
            border: `1px solid ${colors.cardBorder}`,
            borderRadius: 12,
            padding: 20,
          }}
        >
          <div
            style={{
              fontFamily: fonts.body,
              fontSize: 13,
              color: colors.textMuted,
              marginBottom: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Quarterly Profit Trend
          </div>
          <AnimatedChart
            type="line"
            data={lineChartData}
            width={520}
            height={260}
            enterFrame={120}
            color={colors.cyan}
          />
        </div>

        {/* Bar chart */}
        <div
          style={{
            background: colors.cardBg,
            border: `1px solid ${colors.cardBorder}`,
            borderRadius: 12,
            padding: 20,
          }}
        >
          <div
            style={{
              fontFamily: fonts.body,
              fontSize: 13,
              color: colors.textMuted,
              marginBottom: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Revenue by Category
          </div>
          <AnimatedChart
            type="bar"
            data={barChartData}
            width={420}
            height={260}
            enterFrame={150}
            color={colors.blue}
          />
        </div>

        {/* Texas map */}
        <div
          style={{
            background: colors.cardBg,
            border: `1px solid ${colors.cardBorder}`,
            borderRadius: 12,
            padding: 20,
          }}
        >
          <div
            style={{
              fontFamily: fonts.body,
              fontSize: 13,
              color: colors.textMuted,
              marginBottom: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Branch Network
          </div>
          <AnimatedMapDots
            dots={branchDots}
            enterFrame={180}
            width={380}
            height={280}
          />
        </div>
      </div>

      {/* Bottom tagline */}
      <div style={{ position: 'absolute', bottom: 50, left: 0, right: 0 }}>
        <TypewriterText
          text="Built once. Sold to every branch."
          startFrame={350}
          framesPerChar={2}
          fontSize={32}
          fontWeight={600}
          color={colors.cyan}
        />
      </div>
    </AbsoluteFill>
  );
};
