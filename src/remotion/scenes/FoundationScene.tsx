import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { colors, fonts } from '../lib/design-tokens';
import { DataFlowParticles } from '../components/DataFlowParticles';
import { TypewriterText } from '../components/TypewriterText';
import { LogoReveal } from '../components/LogoReveal';

export const FoundationScene: React.FC = () => {
  const frame = useCurrentFrame();

  // Text progression: 3 phrases across 600 frames (20s)
  const text1Opacity = interpolate(frame, [0, 10, 150, 180], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const text2Opacity = interpolate(frame, [180, 200, 360, 390], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const text3Opacity = interpolate(frame, [390, 410, 500, 520], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Logo appears near end
  const logoOpacity = interpolate(frame, [480, 510], [0, 1], {
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
      {/* Particle convergence */}
      <DataFlowParticles
        count={48}
        convergeFrame={90}
        convergeDuration={120}
      />

      {/* Text overlays */}
      <div
        style={{
          position: 'absolute',
          top: 80,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          opacity: text1Opacity,
        }}
      >
        <TypewriterText
          text="Enterprise data is everywhere."
          startFrame={10}
          framesPerChar={2}
          fontSize={44}
          color={colors.textSecondary}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          top: 80,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          opacity: text2Opacity,
        }}
      >
        <TypewriterText
          text="Mosaic organizes it into a semantic layer."
          startFrame={200}
          framesPerChar={2}
          fontSize={44}
          color={colors.textSecondary}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          top: 80,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          opacity: text3Opacity,
        }}
      >
        <TypewriterText
          text="Built once. Queried by everything."
          startFrame={410}
          framesPerChar={2}
          fontSize={44}
          fontWeight={700}
          color={colors.textPrimary}
        />
      </div>

      {/* Foundation label */}
      <div
        style={{
          position: 'absolute',
          bottom: 60,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          opacity: logoOpacity,
        }}
      >
        <div
          style={{
            fontFamily: fonts.heading,
            fontSize: 22,
            fontWeight: 600,
            color: colors.cyan,
            letterSpacing: 4,
            textTransform: 'uppercase',
            textShadow: `0 0 20px ${colors.cyan}40`,
          }}
        >
          MicroStrategy Mosaic — The Intelligence Foundation
        </div>
      </div>
    </AbsoluteFill>
  );
};
