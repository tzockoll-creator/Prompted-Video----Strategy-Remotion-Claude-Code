import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { colors, fonts } from '../lib/design-tokens';
import { NodeGraph } from '../components/NodeGraph';
import { TypewriterText } from '../components/TypewriterText';

const aiNodes = [
  { id: 'mosaic', label: 'Mosaic', x: 960, y: 540, color: colors.cyan, size: 45 },
  { id: 'claude', label: 'Claude', x: 960, y: 260, color: '#d97706', size: 32 },
  { id: 'gemini', label: 'Gemini', x: 720, y: 720, color: '#3b82f6', size: 32 },
  { id: 'chatgpt', label: 'ChatGPT', x: 1200, y: 720, color: '#10b981', size: 32 },
];

const aiConnections = [
  { from: 'mosaic', to: 'claude', label: 'MCP' },
  { from: 'mosaic', to: 'gemini', label: 'MCP' },
  { from: 'mosaic', to: 'chatgpt', label: 'MCP' },
];

interface CalloutProps {
  text: string;
  x: number;
  y: number;
  enterFrame: number;
  color: string;
}

const Callout: React.FC<CalloutProps> = ({ text, x, y, enterFrame, color }) => {
  const frame = useCurrentFrame();
  const elapsed = Math.max(0, frame - enterFrame);

  const opacity = interpolate(elapsed, [0, 20, 120, 150], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        opacity,
        background: `${color}15`,
        border: `1px solid ${color}40`,
        borderRadius: 8,
        padding: '8px 14px',
        fontFamily: fonts.mono,
        fontSize: 13,
        color,
        maxWidth: 260,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  );
};

export const AiOrchestrationScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Miniature dashboard in center (faded)
  const dashboardScale = interpolate(frame, [0, 40], [1, 0.3], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const dashboardOpacity = interpolate(frame, [0, 40], [0.4, 0.1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Scene fade out
  const sceneOpacity = interpolate(frame, [710, 750], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg, opacity: sceneOpacity }}>
      {/* Miniature dashboard placeholder (card shapes in center) */}
      <div
        style={{
          position: 'absolute',
          left: 960 - 150,
          top: 540 - 100,
          width: 300,
          height: 200,
          opacity: dashboardOpacity,
          transform: `scale(${dashboardScale})`,
          transformOrigin: 'center',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 8,
            width: '100%',
            height: '100%',
          }}
        >
          {[colors.cyan, colors.blue, colors.purple, colors.amber].map((c, i) => (
            <div
              key={i}
              style={{
                background: colors.cardBg,
                border: `1px solid ${colors.cardBorder}`,
                borderRadius: 6,
                borderTop: `2px solid ${c}`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Node graph with orbital AI nodes */}
      <NodeGraph
        nodes={aiNodes}
        connections={aiConnections}
        enterFrame={30}
        showLabels={true}
        travelingDots={true}
        orbitalMode={true}
        orbitalRadius={260}
        orbitalSpeed={0.006}
        centerX={960}
        centerY={500}
      />

      {/* Contextual callouts */}
      <Callout
        text="Analyzing branch performance..."
        x={1040}
        y={200}
        enterFrame={180}
        color="#d97706"
      />
      <Callout
        text="Generating market forecast..."
        x={480}
        y={730}
        enterFrame={320}
        color="#3b82f6"
      />
      <Callout
        text="Drafting executive briefing..."
        x={1100}
        y={730}
        enterFrame={460}
        color="#10b981"
      />

      {/* Header text */}
      <div style={{ position: 'absolute', top: 40, left: 0, right: 0 }}>
        <TypewriterText
          text="One semantic layer. Every AI tool."
          startFrame={80}
          framesPerChar={2}
          fontSize={42}
          fontWeight={700}
          color={colors.textPrimary}
        />
      </div>

      {/* Bottom text */}
      <div style={{ position: 'absolute', bottom: 50, left: 0, right: 0 }}>
        <TypewriterText
          text="Infinite possibilities."
          startFrame={550}
          framesPerChar={3}
          fontSize={36}
          fontWeight={600}
          color={colors.cyan}
        />
      </div>
    </AbsoluteFill>
  );
};
