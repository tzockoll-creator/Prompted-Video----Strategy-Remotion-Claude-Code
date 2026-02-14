import { AbsoluteFill, Sequence } from 'remotion';
import { scenes } from './lib/timing';
import { colors } from './lib/design-tokens';
import { Opening } from './scenes/Opening';
import { FoundationScene } from './scenes/FoundationScene';
import { DataProductsScene } from './scenes/DataProductsScene';
import { AiOrchestrationScene } from './scenes/AiOrchestrationScene';
import { ClosingScene } from './scenes/ClosingScene';

export const MosaicHeroVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg }}>
      <Sequence from={scenes.opening.start} durationInFrames={scenes.opening.duration}>
        <Opening />
      </Sequence>
      <Sequence from={scenes.foundation.start} durationInFrames={scenes.foundation.duration}>
        <FoundationScene />
      </Sequence>
      <Sequence from={scenes.dataProducts.start} durationInFrames={scenes.dataProducts.duration}>
        <DataProductsScene />
      </Sequence>
      <Sequence from={scenes.aiOrchestration.start} durationInFrames={scenes.aiOrchestration.duration}>
        <AiOrchestrationScene />
      </Sequence>
      <Sequence from={scenes.closing.start} durationInFrames={scenes.closing.duration}>
        <ClosingScene />
      </Sequence>
    </AbsoluteFill>
  );
};
