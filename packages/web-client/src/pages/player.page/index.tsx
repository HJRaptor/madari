import { useStyletron } from 'baseui';
import { useVideoPlayerParams } from '@/features/video/hooks/use-video-player-params.ts';
import { Button } from 'baseui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import VideoPlayer from '@/features/video/components/VideoPlayer';

export default function PlayerPage() {
  const [css, $theme] = useStyletron();
  const data = useVideoPlayerParams();

  console.log(data, 'data');

  const [searchParams] = useSearchParams();

  const id = searchParams.get('id');
  const type = searchParams.get('type');

  const navigate = useNavigate();

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
      <div
        className={css({
          position: 'fixed',
          top: '12px',
          left: '12px',
          zIndex: 1,
        })}
      >
        <Button
          kind="tertiary"
          shape="circle"
          onClick={() => {
            navigate(-1);
          }}
        >
          <ArrowLeft />
        </Button>
      </div>
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
