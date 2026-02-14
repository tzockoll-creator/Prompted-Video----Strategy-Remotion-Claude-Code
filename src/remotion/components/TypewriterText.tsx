import { useCurrentFrame } from 'remotion';
import { colors, fonts } from '../lib/design-tokens';

interface TypewriterTextProps {
  text: string;
  startFrame?: number;
  framesPerChar?: number;
  fontSize?: number;
  color?: string;
  fontWeight?: number;
  textAlign?: 'left' | 'center' | 'right';
  style?: React.CSSProperties;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  startFrame = 0,
  framesPerChar = 2,
  fontSize = 48,
  color = colors.textPrimary,
  fontWeight = 600,
  textAlign = 'center',
  style,
}) => {
  const frame = useCurrentFrame();
  const elapsed = frame - startFrame;

  if (elapsed < 0) return null;

  const charsToShow = Math.min(
    Math.floor(elapsed / framesPerChar),
    text.length
  );

  const visibleText = text.slice(0, charsToShow);
  const showCursor = elapsed < text.length * framesPerChar + 30;

  return (
    <div
      style={{
        fontFamily: fonts.heading,
        fontSize,
        fontWeight,
        color,
        textAlign,
        lineHeight: 1.3,
        ...style,
      }}
    >
      {visibleText}
      {showCursor && (
        <span
          style={{
            opacity: Math.sin(elapsed * 0.3) > 0 ? 1 : 0,
            color: colors.cyan,
          }}
        >
          |
        </span>
      )}
    </div>
  );
};
