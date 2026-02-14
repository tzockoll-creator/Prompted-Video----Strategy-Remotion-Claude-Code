import { useCurrentFrame, interpolate } from 'remotion';
import { colors } from '../lib/design-tokens';

interface GlowOrbProps {
  fadeInStart?: number;
  fadeInDuration?: number;
  size?: number;
  color?: string;
  x?: number;
  y?: number;
  pulseSpeed?: number;
}

export const GlowOrb: React.FC<GlowOrbProps> = ({
  fadeInStart = 0,
  fadeInDuration = 30,
  size = 200,
  color = colors.cyanGlow,
  x = 960,
  y = 540,
  pulseSpeed = 0.05,
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [fadeInStart, fadeInStart + fadeInDuration],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const pulse = 1 + 0.15 * Math.sin(frame * pulseSpeed);
  const currentSize = size * pulse;

  return (
    <svg
      width={currentSize * 3}
      height={currentSize * 3}
      style={{
        position: 'absolute',
        left: x - (currentSize * 3) / 2,
        top: y - (currentSize * 3) / 2,
        opacity,
        pointerEvents: 'none',
      }}
    >
      <defs>
        <radialGradient id={`glow-${x}-${y}`}>
          <stop offset="0%" stopColor={color} stopOpacity={0.8} />
          <stop offset="30%" stopColor={color} stopOpacity={0.3} />
          <stop offset="70%" stopColor={color} stopOpacity={0.05} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle
        cx={currentSize * 1.5}
        cy={currentSize * 1.5}
        r={currentSize * 1.5}
        fill={`url(#glow-${x}-${y})`}
      />
      <circle
        cx={currentSize * 1.5}
        cy={currentSize * 1.5}
        r={currentSize * 0.15}
        fill={color}
        opacity={0.9}
      />
    </svg>
  );
};
