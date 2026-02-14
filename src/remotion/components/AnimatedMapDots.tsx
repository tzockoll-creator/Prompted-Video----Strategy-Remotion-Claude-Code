import { useCurrentFrame, interpolate, spring } from 'remotion';
import { FPS } from '../lib/timing';
import { colors, fonts } from '../lib/design-tokens';
import { REGION_COLORS } from '../lib/design-tokens';

// Simplified Texas outline path (SVG coordinates mapped to a 500x450 viewport)
const TEXAS_PATH =
  'M 130 10 L 280 10 L 285 15 L 290 10 L 350 10 L 355 20 L 370 25 L 380 40 ' +
  'L 390 45 L 400 60 L 410 80 L 420 100 L 430 115 L 440 130 L 445 150 ' +
  'L 450 170 L 455 190 L 460 210 L 458 230 L 450 245 L 440 260 L 430 270 ' +
  'L 415 280 L 400 290 L 380 300 L 360 310 L 340 325 L 320 335 L 305 345 ' +
  'L 290 360 L 275 370 L 260 380 L 245 385 L 230 390 L 215 395 L 200 400 ' +
  'L 185 405 L 170 408 L 155 405 L 145 395 L 140 380 L 130 365 L 120 350 ' +
  'L 105 340 L 90 335 L 75 330 L 60 325 L 50 315 L 45 300 L 40 280 ' +
  'L 35 260 L 30 240 L 28 220 L 30 200 L 35 180 L 40 160 L 50 140 ' +
  'L 55 120 L 60 100 L 70 80 L 80 60 L 90 45 L 100 30 L 115 20 Z';

interface BranchDot {
  name: string;
  lat: number;
  lng: number;
  region: string;
  profit: number;
}

interface AnimatedMapDotsProps {
  dots: BranchDot[];
  enterFrame?: number;
  width?: number;
  height?: number;
}

// Convert lat/lng to SVG coordinates within Texas bounding box
function geoToSvg(
  lat: number,
  lng: number,
  width: number,
  height: number
): { x: number; y: number } {
  // Texas bounding box approx
  const minLat = 25.8;
  const maxLat = 36.5;
  const minLng = -106.6;
  const maxLng = -93.5;

  const x = ((lng - minLng) / (maxLng - minLng)) * width;
  const y = height - ((lat - minLat) / (maxLat - minLat)) * height;

  return { x, y };
}

export const AnimatedMapDots: React.FC<AnimatedMapDotsProps> = ({
  dots,
  enterFrame = 0,
  width = 500,
  height = 450,
}) => {
  const frame = useCurrentFrame();

  const mapOpacity = interpolate(frame - enterFrame, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <svg width={width} height={height} style={{ opacity: mapOpacity }}>
      {/* Texas outline */}
      <path
        d={TEXAS_PATH}
        fill={colors.cardBg}
        stroke={colors.cardBorder}
        strokeWidth={2}
        opacity={0.8}
      />

      {/* Branch dots */}
      {dots.map((dot, i) => {
        const pos = geoToSvg(dot.lat, dot.lng, width, height);
        const dotColor = REGION_COLORS[dot.region] || colors.cyan;

        const dotSpring = spring({
          frame: frame - enterFrame - 20 - i * 4,
          fps: FPS,
          config: { damping: 10, stiffness: 100 },
        });

        const pulse = 1 + 0.15 * Math.sin(frame * 0.06 + i * 1.2);
        const dotSize = 6 * dotSpring;

        return (
          <g key={dot.name}>
            {/* Glow ring */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={dotSize * 2.5 * pulse}
              fill={dotColor}
              opacity={0.15 * dotSpring}
            />
            {/* Core dot */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={dotSize}
              fill={dotColor}
              opacity={0.9 * dotSpring}
            />
            {/* Label (only show for a few key branches) */}
            {i % 3 === 0 && dotSpring > 0.8 && (
              <text
                x={pos.x + 10}
                y={pos.y + 4}
                fill={colors.textSecondary}
                fontSize={9}
                fontFamily={fonts.mono}
                opacity={dotSpring}
              >
                {dot.name}
              </text>
            )}
          </g>
        );
      })}

      {/* Legend */}
      {Object.entries(REGION_COLORS).map(([region, regionColor], i) => (
        <g key={region} transform={`translate(10, ${height - 80 + i * 20})`}>
          <circle cx={6} cy={0} r={5} fill={regionColor} opacity={0.9} />
          <text
            x={16}
            y={4}
            fill={colors.textSecondary}
            fontSize={10}
            fontFamily={fonts.body}
          >
            {region}
          </text>
        </g>
      ))}
    </svg>
  );
};
