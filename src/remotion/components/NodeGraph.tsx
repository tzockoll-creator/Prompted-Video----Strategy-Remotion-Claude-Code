import { useCurrentFrame, interpolate } from 'remotion';
import { colors, fonts } from '../lib/design-tokens';

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
  size?: number;
}

interface Connection {
  from: string;
  to: string;
  label?: string;
}

interface NodeGraphProps {
  nodes: Node[];
  connections: Connection[];
  enterFrame?: number;
  showLabels?: boolean;
  travelingDots?: boolean;
  orbitalMode?: boolean;
  orbitalRadius?: number;
  orbitalSpeed?: number;
  centerX?: number;
  centerY?: number;
}

export const NodeGraph: React.FC<NodeGraphProps> = ({
  nodes,
  connections,
  enterFrame = 0,
  showLabels = true,
  travelingDots = false,
  orbitalMode = false,
  orbitalRadius = 280,
  orbitalSpeed = 0.008,
  centerX = 960,
  centerY = 540,
}) => {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - enterFrame);

  const nodeOpacity = interpolate(elapsed, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const connectionOpacity = interpolate(elapsed, [20, 50], [0, 0.6], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Calculate node positions (with orbital override if enabled)
  const getNodePos = (node: Node, index: number) => {
    if (!orbitalMode) return { x: node.x, y: node.y };

    // First node = center, rest orbit
    if (index === 0) return { x: centerX, y: centerY };

    const orbitIndex = index - 1;
    const totalOrbiting = nodes.length - 1;
    const angleOffset = (2 * Math.PI * orbitIndex) / totalOrbiting;
    const angle = angleOffset + frame * orbitalSpeed;

    return {
      x: centerX + Math.cos(angle) * orbitalRadius,
      y: centerY + Math.sin(angle) * orbitalRadius,
    };
  };

  const nodePositions = nodes.map((n, i) => ({
    ...n,
    pos: getNodePos(n, i),
  }));

  const nodeMap = Object.fromEntries(nodePositions.map((n) => [n.id, n]));

  return (
    <svg width={1920} height={1080} style={{ position: 'absolute', top: 0, left: 0 }}>
      {/* Connections */}
      {connections.map((conn, i) => {
        const fromNode = nodeMap[conn.from];
        const toNode = nodeMap[conn.to];
        if (!fromNode || !toNode) return null;

        const x1 = fromNode.pos.x;
        const y1 = fromNode.pos.y;
        const x2 = toNode.pos.x;
        const y2 = toNode.pos.y;

        // Draw-on animation
        const lineProgress = interpolate(elapsed, [20 + i * 10, 50 + i * 10], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        const dx = x2 - x1;
        const dy = y2 - y1;
        const lineLen = Math.sqrt(dx * dx + dy * dy);

        return (
          <g key={`conn-${i}`}>
            <line
              x1={x1}
              y1={y1}
              x2={x1 + dx * lineProgress}
              y2={y1 + dy * lineProgress}
              stroke={colors.cyan}
              strokeWidth={2}
              opacity={connectionOpacity}
            />
            {/* Glow line */}
            <line
              x1={x1}
              y1={y1}
              x2={x1 + dx * lineProgress}
              y2={y1 + dy * lineProgress}
              stroke={colors.cyanGlow}
              strokeWidth={6}
              opacity={connectionOpacity * 0.2}
            />

            {/* Connection label */}
            {conn.label && lineProgress > 0.5 && (
              <text
                x={(x1 + x2) / 2}
                y={(y1 + y2) / 2 - 12}
                textAnchor="middle"
                fill={colors.cyan}
                fontSize={11}
                fontFamily={fonts.mono}
                opacity={connectionOpacity}
              >
                {conn.label}
              </text>
            )}

            {/* Traveling dots */}
            {travelingDots && lineProgress >= 1 && (
              <>
                {[0, 0.33, 0.66].map((offset) => {
                  const t = ((frame * 0.02 + offset + i * 0.15) % 1);
                  return (
                    <circle
                      key={`dot-${i}-${offset}`}
                      cx={x1 + dx * t}
                      cy={y1 + dy * t}
                      r={3}
                      fill={colors.cyanGlow}
                      opacity={0.8}
                    />
                  );
                })}
              </>
            )}
          </g>
        );
      })}

      {/* Nodes */}
      {nodePositions.map((node) => {
        const size = node.size || 30;
        const pulse = 1 + 0.05 * Math.sin(frame * 0.08 + node.pos.x * 0.01);

        return (
          <g key={node.id} opacity={nodeOpacity}>
            {/* Outer glow */}
            <circle
              cx={node.pos.x}
              cy={node.pos.y}
              r={size * 2 * pulse}
              fill={node.color}
              opacity={0.1}
            />
            {/* Ring */}
            <circle
              cx={node.pos.x}
              cy={node.pos.y}
              r={size * pulse}
              fill="none"
              stroke={node.color}
              strokeWidth={2}
              opacity={0.6}
            />
            {/* Core */}
            <circle
              cx={node.pos.x}
              cy={node.pos.y}
              r={size * 0.6 * pulse}
              fill={node.color}
              opacity={0.9}
            />
            {/* Label */}
            {showLabels && (
              <text
                x={node.pos.x}
                y={node.pos.y + size + 20}
                textAnchor="middle"
                fill={colors.textPrimary}
                fontSize={14}
                fontWeight={600}
                fontFamily={fonts.heading}
              >
                {node.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};
