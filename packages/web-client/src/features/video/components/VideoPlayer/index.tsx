import {
  Captions,
  MediaPlayer,
  MediaPlayerInstance,
  MediaProvider,
  Poster,
} from '@vidstack/react';
import { useStyletron } from 'baseui';
import { videoStateAtom } from '@/features/video/atom/video-state.ts';
import { useEffect, useRef } from 'react';
import { useAtom } from 'jotai/index';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/audio.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import '@vidstack/react/player/styles/default/poster.css';
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from '@vidstack/react/player/layouts/default';
import { useAtomValue } from 'jotai';
import { generalSettingsAtom } from '@/features/settings/components/atoms/all.tsx';

export function VideoPlayer() {
  const [css, $theme] = useStyletron();
  const [videoState, setVideoState] = useAtom(videoStateAtom);
  const player = useRef<MediaPlayerInstance | null>(null);
  const { performance, noAnimation } = useAtomValue(generalSettingsAtom);
  const pausedBecauseOfBlur = useRef(false);

  useEffect(() => {
    const blur = () => {
      if (videoState.playerKind === 'mini') {
        setVideoState((prev) => {
          if (prev.isPlaying) {
            pausedBecauseOfBlur.current = true;
          }

          return {
            ...prev,
            isPlaying: false,
          };
        });
      }
    };

    const focus = () => {
      if (pausedBecauseOfBlur.current) {
        pausedBecauseOfBlur.current = false;
        setVideoState((prev) => ({
          ...prev,
          isPlaying: true,
        }));
      }
    };

    window.addEventListener('focus', focus);
    window.addEventListener('blur', blur);

    return () => {
      window.removeEventListener('blur', blur);
      window.removeEventListener('focus', focus);
    };
  }, [setVideoState, videoState.playerKind]);

  useEffect(() => {
    if (noAnimation) {
      const styleElement = document.createElement('style');
      styleElement.setAttribute('data-disable-animations', '');

      // CSS to disable all animations and transitions
      styleElement.textContent = `
        * {
          animation: none !important;
          transition: none !important;
        }
      `;

      document.head.appendChild(styleElement);

      // Cleanup
      return () => {
        const existingStyle = document.querySelector(
          'style[data-disable-animations]',
        );
        if (existingStyle) {
          existingStyle.remove();
        }
      };
    }
  }, [noAnimation]);

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

  if (videoState.playerKind === 'mini' && performance) {
    return (
      videoState.posterImage && (
        <img
          alt={videoState.title}
          src={videoState.posterImage}
          className={css({
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1,
            backgroundColor: $theme.colors.backgroundPrimary,
            height: '100%',
            width: '100%',
            objectFit: 'contain',
          })}
        />
      )
    );
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
        <MediaProvider>
          <Poster src={videoState.posterImage} className="vds-poster" />
        </MediaProvider>
        {videoState.playerKind === 'full' ? (
          <DefaultVideoLayout icons={defaultLayoutIcons} />
        ) : (
          <Captions />
        )}
      </MediaPlayer>
    </div>
  );
}
