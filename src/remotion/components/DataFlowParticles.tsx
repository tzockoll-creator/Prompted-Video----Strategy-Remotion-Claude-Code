import { useCurrentFrame, interpolate, random } from 'remotion';
import { colors } from '../lib/design-tokens';

interface Particle {
  id: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  color: string;
  size: number;
}

interface DataFlowParticlesProps {
  count?: number;
  convergeFrame?: number;
  convergeDuration?: number;
  mode?: 'scatter' | 'converge' | 'grid';
}

const HEX_COLS = 8;
const HEX_ROWS = 6;

function generateHexGrid(centerX: number, centerY: number, spacing: number): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  const offsetX = ((HEX_COLS - 1) * spacing) / 2;
  const offsetY = ((HEX_ROWS - 1) * spacing * 0.866) / 2;

  for (let row = 0; row < HEX_ROWS; row++) {
    for (let col = 0; col < HEX_COLS; col++) {
      const x = centerX - offsetX + col * spacing + (row % 2 === 1 ? spacing / 2 : 0);
      const y = centerY - offsetY + row * spacing * 0.866;
      points.push({ x, y });
    }
  }
  return points;
}

const particleColors = [colors.cyan, colors.blue, colors.purple, colors.amber, colors.green];

function createParticles(count: number): Particle[] {
  const grid = generateHexGrid(960, 540, 60);
  return Array.from({ length: count }, (_, i) => {
    const gridTarget = grid[i % grid.length];
    return {
      id: i,
      startX: random(`px-${i}`) * 1920,
      startY: random(`py-${i}`) * 1080,
      targetX: gridTarget.x,
      targetY: gridTarget.y,
      color: particleColors[i % particleColors.length],
      size: 4 + random(`ps-${i}`) * 4,
    };
  });
}

export const DataFlowParticles: React.FC<DataFlowParticlesProps> = ({
  count = 48,
  convergeFrame = 60,
  convergeDuration = 90,
}) => {
  const frame = useCurrentFrame();
  const particles = createParticles(count);

  const convergeProgress = interpolate(
    frame,
    [convergeFrame, convergeFrame + convergeDuration],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const eased = convergeProgress * convergeProgress * (3 - 2 * convergeProgress); // smoothstep

  // Electricity effect after convergence
  const showElectricity = frame > convergeFrame + convergeDuration;
  const electricityOpacity = interpolate(
    frame,
    [convergeFrame + convergeDuration, convergeFrame + convergeDuration + 30],
    [0, 0.6],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const grid = generateHexGrid(960, 540, 60);

  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
      {/* Connection lines (appear after convergence) */}
      {showElectricity &&
        grid.map((point, i) => {
          // Connect to neighbors
          return grid
            .filter((_, j) => {
              if (j <= i) return false;
              const dx = Math.abs(point.x - grid[j].x);
              const dy = Math.abs(point.y - grid[j].y);
              return dx < 70 && dy < 60;
            })
            .map((neighbor, ni) => {
              const flicker = 0.3 + 0.7 * Math.abs(Math.sin(frame * 0.15 + i * 0.5 + ni));
              return (
                <line
                  key={`conn-${i}-${ni}`}
                  x1={point.x}
                  y1={point.y}
                  x2={neighbor.x}
                  y2={neighbor.y}
                  stroke={colors.cyan}
                  strokeWidth={1.5}
                  opacity={electricityOpacity * flicker}
                />
              );
            });
        })}

      {/* Particles */}
      {particles.map((p) => {
        const x = interpolate(eased, [0, 1], [p.startX, p.targetX]);
        const y = interpolate(eased, [0, 1], [p.startY, p.targetY]);

        // Floating motion when scattered
        const floatX = eased < 1 ? Math.sin(frame * 0.03 + p.id) * 5 * (1 - eased) : 0;
        const floatY = eased < 1 ? Math.cos(frame * 0.04 + p.id * 1.3) * 5 * (1 - eased) : 0;

        // Glow pulse after convergence
        const glowPulse = showElectricity
          ? 0.5 + 0.5 * Math.sin(frame * 0.1 + p.id * 0.7)
          : 0;

        return (
          <g key={p.id}>
            {/* Glow */}
            <circle
              cx={x + floatX}
              cy={y + floatY}
              r={p.size * 2.5}
              fill={p.color}
              opacity={0.15 + glowPulse * 0.15}
            />
            {/* Core */}
            <circle
              cx={x + floatX}
              cy={y + floatY}
              r={p.size}
              fill={p.color}
              opacity={0.8}
            />
          </g>
        );
      })}
    </svg>
  );
};
