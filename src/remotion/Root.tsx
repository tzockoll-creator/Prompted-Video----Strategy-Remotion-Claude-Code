import { Composition, registerRoot } from 'remotion';
import { MosaicHeroVideo } from './Video';
import { FPS, DURATION_FRAMES } from './lib/timing';
import { dimensions } from './lib/design-tokens';

const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MosaicHeroVideo"
      component={MosaicHeroVideo}
      durationInFrames={DURATION_FRAMES}
      fps={FPS}
      width={dimensions.width}
      height={dimensions.height}
    />
  );
};

registerRoot(RemotionRoot);
