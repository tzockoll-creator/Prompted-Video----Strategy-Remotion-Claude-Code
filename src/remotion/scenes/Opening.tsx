import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { colors } from '../lib/design-tokens';
import { GlowOrb } from '../components/GlowOrb';
import { TypewriterText } from '../components/TypewriterText';

export const Opening: React.FC = () => {
  const frame = useCurrentFrame();

  // Fade out near end of scene
  const sceneOpacity = interpolate(frame, [260, 300], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg, opacity: sceneOpacity }}>
      <GlowOrb
        fadeInStart={15}
        fadeInDuration={45}
        size={180}
        x={960}
        y={440}
        color={colors.cyanGlow}
        pulseSpeed={0.04}
      />

      {/* First line */}
      <div
        style={{
          position: 'absolute',
          top: 420,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <TypewriterText
          text="Your data is an asset."
          startFrame={40}
          framesPerChar={3}
          fontSize={56}
          fontWeight={700}
          color={colors.textPrimary}
        />
      </div>

      {/* Second line — appears after first completes */}
      <div
        style={{
          position: 'absolute',
          top: 510,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <TypewriterText
          text="Are you monetizing it?"
          startFrame={140}
          framesPerChar={3}
          fontSize={48}
          fontWeight={500}
          color={colors.cyan}
        />
      </div>
    </AbsoluteFill>
  );
};
