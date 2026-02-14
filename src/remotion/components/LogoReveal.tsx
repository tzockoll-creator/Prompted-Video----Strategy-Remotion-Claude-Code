import { useCurrentFrame, interpolate, spring } from 'remotion';
import { FPS } from '../lib/timing';
import { colors, fonts } from '../lib/design-tokens';

interface LogoRevealProps {
  enterFrame?: number;
  text?: string;
  tagline?: string;
  fontSize?: number;
  x?: number;
  y?: number;
}

export const LogoReveal: React.FC<LogoRevealProps> = ({
  enterFrame = 0,
  text = 'MOSAIC',
  tagline,
  fontSize = 80,
  x = 960,
  y = 540,
}) => {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - enterFrame);

  const scaleSpring = spring({
    frame: elapsed,
    fps: FPS,
    config: { damping: 8, stiffness: 60 },
  });

  const opacity = interpolate(elapsed, [0, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const letterSpacing = interpolate(scaleSpring, [0, 1], [40, 16]);
  const glowIntensity = interpolate(elapsed, [20, 50], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const taglineOpacity = interpolate(elapsed, [40, 60], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: 1920,
        height: 1080,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
      }}
    >
      {/* Glow backdrop */}
      <div
        style={{
          position: 'absolute',
          left: x - 200,
          top: y - 100,
          width: 400,
          height: 200,
          borderRadius: '50%',
          background: `radial-gradient(ellipse, ${colors.cyan}30 0%, transparent 70%)`,
          opacity: glowIntensity,
          filter: 'blur(40px)',
        }}
      />

      {/* Main text */}
      <div
        style={{
          fontFamily: fonts.heading,
          fontSize,
          fontWeight: 800,
          color: colors.textPrimary,
          letterSpacing,
          textAlign: 'center',
          textShadow: `0 0 ${30 * glowIntensity}px ${colors.cyan}60, 0 0 ${60 * glowIntensity}px ${colors.cyan}20`,
          transform: `scale(${scaleSpring})`,
        }}
      >
        {text}
      </div>

      {/* Tagline */}
      {tagline && (
        <div
          style={{
            fontFamily: fonts.body,
            fontSize: 24,
            fontWeight: 400,
            color: colors.textSecondary,
            marginTop: 20,
            opacity: taglineOpacity,
            textAlign: 'center',
            letterSpacing: 2,
          }}
        >
          {tagline}
        </div>
      )}
    </div>
  );
};
