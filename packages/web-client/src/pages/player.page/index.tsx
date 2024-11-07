import { useStyletron } from 'baseui';
import { useVideoPlayerParams } from '@/features/video/hooks/use-video-player-params.ts';
import { useSearchParams } from 'react-router-dom';
import VideoPlayer from '@/features/video/components/VideoPlayer';

export default function PlayerPage() {
  const [css, $theme] = useStyletron();
  const data = useVideoPlayerParams();

  const [searchParams] = useSearchParams();

  const id = searchParams.get('id');
  const type = searchParams.get('type');

  if (!data?.url || !id || !type) {
    return (
      <div
        className={css({
          height: '100vh',
          width: '100%',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: $theme.colors.backgroundPrimary,
        })}
      />
    );
  }

  return (
    <div
      className={css({
        height: '100vh',
        width: '100%',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: $theme.colors.backgroundPrimary,
      })}
    >
      <VideoPlayer
        info={{
          id,
          type,
        }}
        data={data}
      />
    </div>
  );
}
