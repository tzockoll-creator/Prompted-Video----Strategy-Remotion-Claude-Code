import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { colors, fonts } from '../lib/design-tokens';
import { GlowOrb } from '../components/GlowOrb';
import { LogoReveal } from '../components/LogoReveal';
import { TypewriterText } from '../components/TypewriterText';

export const ClosingScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Convergence: multiple points merge to center
  const convergeProgress = interpolate(frame, [0, 60], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const eased = convergeProgress * convergeProgress * (3 - 2 * convergeProgress);

  // Convergence points
  const convergePoints = [
    { startX: 200, startY: 200 },
    { startX: 1720, startY: 200 },
    { startX: 200, startY: 880 },
    { startX: 1720, startY: 880 },
    { startX: 960, startY: 100 },
    { startX: 960, startY: 980 },
    { startX: 300, startY: 540 },
    { startX: 1620, startY: 540 },
  ];

  const luminousPointOpacity = interpolate(frame, [50, 80], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Flash at convergence moment
  const flashOpacity = interpolate(frame, [55, 65, 80], [0, 0.4, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const ctaOpacity = interpolate(frame, [300, 330], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg }}>
      {/* Converging particles */}
      <svg width={1920} height={1080} style={{ position: 'absolute' }}>
        {convergePoints.map((p, i) => {
          const x = interpolate(eased, [0, 1], [p.startX, 960]);
          const y = interpolate(eased, [0, 1], [p.startY, 540]);
          const particleOpacity = interpolate(eased, [0, 0.8, 1], [0.8, 0.8, 0]);
          const particleColor = [colors.cyan, colors.blue, colors.purple, colors.amber][i % 4];

          return (
            <g key={i}>
              <circle cx={x} cy={y} r={8} fill={particleColor} opacity={particleOpacity} />
              <circle cx={x} cy={y} r={20} fill={particleColor} opacity={particleOpacity * 0.2} />
              {/* Trail line */}
              <line
                x1={p.startX}
                y1={p.startY}
                x2={x}
                y2={y}
                stroke={particleColor}
                strokeWidth={1}
                opacity={particleOpacity * 0.3}
              />
            </g>
          );
        })}
      </svg>

      {/* Flash overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: colors.cyanGlow,
          opacity: flashOpacity,
          pointerEvents: 'none',
        }}
      />

      {/* Central luminous glow */}
      <div style={{ opacity: luminousPointOpacity }}>
        <GlowOrb
          fadeInStart={0}
          fadeInDuration={1}
          size={250}
          x={960}
          y={500}
          color={colors.cyanGlow}
          pulseSpeed={0.03}
        />
      </div>

      {/* MOSAIC wordmark */}
      <LogoReveal
        enterFrame={80}
        text="MOSAIC"
        tagline="The Intelligence Platform for the AI Era."
        fontSize={90}
        x={960}
        y={480}
      />

      {/* CTA */}
      <div
        style={{
          position: 'absolute',
          bottom: 80,
          left: 0,
          right: 0,
          textAlign: 'center',
          opacity: ctaOpacity,
        }}
      >
        <div
          style={{
            fontFamily: fonts.body,
            fontSize: 22,
            color: colors.textSecondary,
            letterSpacing: 1,
          }}
        >
          Transform your enterprise data into competitive advantage.
        </div>
      </div>
    </AbsoluteFill>
  );
};
