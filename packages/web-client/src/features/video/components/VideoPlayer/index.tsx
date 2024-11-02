import {
  Captions,
  MediaPlayer,
  MediaPlayerInstance,
  MediaProvider,
} from '@vidstack/react';
import { useStyletron } from 'baseui';
import { videoStateAtom } from '@/features/video/atom/video-state.ts';
import { useEffect, useRef } from 'react';
import { useAtom } from 'jotai/index';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/audio.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from '@vidstack/react/player/layouts/default';

export function VideoPlayer() {
  const [css, $theme] = useStyletron();

  const [videoState, setVideoState] = useAtom(videoStateAtom);
  const player = useRef<MediaPlayerInstance | null>(null);

  useEffect(() => {
    if (videoState.isPlaying) {
      if (player.current?.state.canPlay) {
        player.current?.play().catch((e: unknown) => {
          console.error(e);
        });
      } else {
        player.current?.addEventListener('can-play', () => {
          player.current?.play().catch((e: unknown) => {
            console.error(e);
          });
        });
      }
    } else {
      player.current?.pause().catch((e: unknown) => {
        console.error(e);
      });
    }
  }, [player, videoState.isPlaying]);

  if (!videoState.videoUrl) {
    return null;
  }

  return (
    <div
      className={css({
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
        backgroundColor: $theme.colors.backgroundPrimary,
      })}
    >
      <MediaPlayer
        viewType="video"
        streamType="on-demand"
        crossOrigin
        playsInline
        autoPlay={videoState.isPlaying}
        onPause={() => {
          if (videoState.isPlaying) {
            setVideoState((prev) => ({
              ...prev,
              isPlaying: false,
            }));
          }
        }}
        onPlay={() => {
          if (!videoState.isPlaying) {
            setVideoState((prev) => ({
              ...prev,
              isPlaying: false,
            }));
          }
        }}
        keyDisabled={videoState.playerKind === 'mini'}
        ref={player}
        className={css({
          height: '100%',
          width: '100%',
        })}
        title={videoState.title}
        src={videoState.videoUrl}
      >
        <MediaProvider />
        {videoState.playerKind === 'full' ? (
          <DefaultVideoLayout icons={defaultLayoutIcons} />
        ) : (
          <Captions />
        )}
      </MediaPlayer>
    </div>
  );
}
