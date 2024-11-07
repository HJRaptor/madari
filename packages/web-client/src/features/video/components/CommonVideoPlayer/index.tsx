import {
  ArrowLeft,
  Forward as Forward10,
  Pause,
  Play,
  Rewind as Rewind10,
  Volume2,
  VolumeX,
} from 'lucide-react';
import React, { forwardRef, useEffect, useRef, useState } from 'react';
import {
  BottomControls,
  BufferProgress,
  CenterButton,
  CenterControls,
  Container,
  ControlsOverlay,
  ControlsRow,
  CurrentProgress,
  IconButton,
  LeftControls,
  PlayPauseButton,
  ProgressBar,
  RightControls,
  Scrubber,
  TimeDisplay,
  Video,
  VideoWrapper,
  VolumeControl,
  VolumeSlider,
} from './styles.ts';
import { UseDashPlayerReturn } from '@/features/video/hooks/use-dash-player.ts';
import { useManifestUrl } from '@/features/video/hooks/use-manifest-url.ts';
import VideoControls from '@/features/video/components/CommonVideoPlayer/Controls.tsx';
import LoaderComponent from '@/features/video/components/CommonVideoPlayer/Loader.tsx';
import { Button } from 'baseui/button';
import { useStyletron } from 'baseui';
import { useNavigate } from 'react-router-dom';

const CommonVideoPlayer = forwardRef<
  HTMLVideoElement,
  UseDashPlayerReturn & { manifest: Awaited<ReturnType<typeof useManifestUrl>> }
>(
  (
    {
      isMuted,
      togglePlay,
      isPlaying,
      currentTime,
      seek,
      setVolume,
      buffering,
      volume,
      setMuted,
      duration,
      bufferLevel,
      manifest,
    },
    ref,
  ) => {
    const [showControls, setShowControls] = useState(true);
    const [isProgressHovered, setIsProgressHovered] = useState(false);
    const [isVolumeHovered, setIsVolumeHovered] = useState(false);
    const controlsTimeoutRef = useRef<NodeJS.Timeout>();

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      seek(pos * duration);
    };

    const formatTime = (time: number): string => {
      const hours = Math.floor(time / 3600);
      const minutes = Math.floor((time % 3600) / 60);
      const seconds = Math.floor(time % 60);

      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
      const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
        if (isPlaying) {
          controlsTimeoutRef.current = setTimeout(() => {
            setShowControls(false);
          }, 3000);
        }
      };

      window.addEventListener('mousemove', handleMouseMove);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
      };
    }, [isPlaying]);

    const [css] = useStyletron();

    const navigate = useNavigate();

    return (
      <Container>
        {showControls && (
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
        )}
        <VideoWrapper>
          <LoaderComponent buffering={buffering} />
          <Video ref={ref} poster="" />

          {showControls && (
            <ControlsOverlay>
              {!buffering && (
                <CenterControls>
                  <CenterButton
                    onClick={() => {
                      seek(currentTime - 10);
                    }}
                  >
                    <Rewind10 size={32} />
                  </CenterButton>

                  <PlayPauseButton onClick={togglePlay}>
                    {isPlaying ? <Pause size={48} /> : <Play size={48} />}
                  </PlayPauseButton>

                  <CenterButton
                    onClick={() => {
                      seek(currentTime + 10);
                    }}
                  >
                    <Forward10 size={32} />
                  </CenterButton>
                </CenterControls>
              )}

              <BottomControls>
                <ProgressBar
                  onMouseEnter={() => {
                    setIsProgressHovered(true);
                  }}
                  onMouseLeave={() => {
                    setIsProgressHovered(false);
                  }}
                  onClick={handleProgressClick}
                >
                  <BufferProgress style={{ width: `${bufferLevel}%` }} />
                  <CurrentProgress
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                  {isProgressHovered && (
                    <Scrubber
                      style={{ left: `${(currentTime / duration) * 100}%` }}
                    />
                  )}
                </ProgressBar>

                <ControlsRow>
                  <LeftControls>
                    <IconButton onClick={togglePlay}>
                      {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                    </IconButton>

                    <VolumeControl
                      onMouseEnter={() => {
                        setIsVolumeHovered(true);
                      }}
                      onMouseLeave={() => {
                        setIsVolumeHovered(false);
                      }}
                    >
                      <IconButton
                        onClick={() => {
                          setMuted(!isMuted);
                        }}
                      >
                        {isMuted || volume === 0 ? (
                          <VolumeX size={20} />
                        ) : (
                          <Volume2 size={20} />
                        )}
                      </IconButton>
                      <VolumeSlider
                        type="range"
                        min={0}
                        max={1}
                        step={0.1}
                        value={isMuted ? 0 : volume}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          setVolume(Number(e.target.value));
                        }}
                        style={{
                          width: isVolumeHovered ? '80px' : '0',
                          opacity: isVolumeHovered ? 1 : 0,
                        }}
                      />
                    </VolumeControl>

                    <TimeDisplay>
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </TimeDisplay>
                  </LeftControls>

                  <RightControls>
                    <VideoControls
                      metadata={manifest}
                      onAudioChange={(audio) => {
                        manifest.changeAudioTrack(audio);
                      }}
                      onQualityChange={(quality) => {
                        manifest.changeQuality(quality);
                      }}
                      onSubtitleChange={(subtitle) => {
                        manifest.changeSubtitle(subtitle);
                      }}
                    />
                  </RightControls>
                </ControlsRow>
              </BottomControls>
            </ControlsOverlay>
          )}
        </VideoWrapper>
      </Container>
    );
  },
);

export default CommonVideoPlayer;
