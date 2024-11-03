import React, { useEffect, useRef, useState } from 'react';
import dashjs from 'dashjs';
import { styled } from 'baseui';
import { StatefulMenu } from 'baseui/menu';
import { StatefulPopover } from 'baseui/popover';
import {
  FastForward,
  Maximize,
  Minimize,
  Pause,
  Play,
  Rewind,
  Settings,
  Volume2,
  VolumeX,
} from 'lucide-react';

// Types
interface VideoSource {
  quality: string;
  url: string;
  bitrate: number;
}

interface VideoPlayerProps {
  sources: VideoSource[];
  poster?: string;
  autoPlay?: boolean;
  title?: string;
  description?: string;
}

// Styled Components with Netflix-inspired design
const PlayerWrapper = styled('div', {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'black',
  zIndex: 1000,
});

const VideoContainer = styled('div', {
  position: 'relative',
  width: '100%',
  height: '100%',
  backgroundColor: 'black',
  overflow: 'hidden',
});

const Video = styled('video', {
  width: '100%',
  height: '100%',
  objectFit: 'contain',
});

const VideoOverlay = styled('div', {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background:
    'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.9) 100%)',
  opacity: 0,
  transition: 'opacity 0.3s ease',
});

const Controls = styled('div', {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  padding: '20px 24px',
  transition: 'transform 0.3s ease, opacity 0.3s ease',
  background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
  transform: 'translateY(0)',
});

const TopControls = styled('div', {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  padding: '24px',
  background: 'linear-gradient(to bottom, rgba(0,0,0,0.9), transparent)',
});

const VideoTitle = styled('h1', {
  color: 'white',
  margin: 0,
  fontSize: '24px',
  fontWeight: 600,
  textShadow: '0 2px 4px rgba(0,0,0,0.5)',
});

const VideoDescription = styled('p', {
  color: 'rgba(255,255,255,0.8)',
  margin: '8px 0 0 0',
  fontSize: '16px',
  maxWidth: '600px',
});

// Custom Progress Bar with Preview
const ProgressContainer = styled('div', {
  width: '100%',
  height: '4px',
  backgroundColor: 'rgba(255, 255, 255, 0.3)',
  cursor: 'pointer',
  position: 'relative',
  marginBottom: '16px',
  ':hover': {
    height: '6px',
    transform: 'scaleY(1.2)',
  },
  transition: 'transform 0.2s ease, height 0.2s ease',
});

const BufferedProgress = styled('div', {
  position: 'absolute',
  height: '100%',
  backgroundColor: 'rgba(255, 255, 255, 0.4)',
  transition: 'width 0.2s ease',
});

const Progress = styled('div', {
  position: 'absolute',
  height: '100%',
  backgroundColor: '#E50914',
  transition: 'width 0.1s ease',
});

const ProgressHandle = styled('div', {
  position: 'absolute',
  right: '-6px',
  top: '50%',
  width: '12px',
  height: '12px',
  backgroundColor: '#E50914',
  borderRadius: '50%',
  transform: 'translate(50%, -50%)',
  opacity: 0,
  transition: 'opacity 0.2s ease',
  ':hover': {
    transform: 'translate(50%, -50%) scale(1.2)',
  },
});

const PreviewTooltip = styled('div', {
  position: 'absolute',
  bottom: '20px',
  transform: 'translateX(-50%)',
  backgroundColor: 'rgba(0, 0, 0, 0.9)',
  borderRadius: '4px',
  padding: '4px 8px',
  color: 'white',
  fontSize: '14px',
  pointerEvents: 'none',
  opacity: 0,
  transition: 'opacity 0.2s ease',
});

const ControlsRow = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '16px',
});

const ControlsGroup = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
});

const IconButton = styled('button', {
  background: 'none',
  border: 'none',
  padding: '8px',
  color: 'white',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  transition: 'all 0.2s ease',
  ':hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: 'scale(1.1)',
  },
  ':active': {
    transform: 'scale(0.95)',
  },
  ':disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
    transform: 'none',
  },
});

// Volume Control
const VolumeContainer = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

const VolumeSlider = styled('div', {
  width: '0',
  height: '4px',
  backgroundColor: 'rgba(255, 255, 255, 0.3)',
  borderRadius: '2px',
  cursor: 'pointer',
  overflow: 'hidden',
  transition: 'width 0.2s ease',
});

const VolumeLevel = styled('div', {
  height: '100%',
  backgroundColor: 'white',
  transition: 'width 0.1s ease',
});

const TimeDisplay = styled('span', {
  color: 'white',
  fontSize: '14px',
  fontWeight: '500',
  textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
});

// Helper Functions
const formatTime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h ? `${h}:` : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

// Main Component
const VideoPlayer: React.FC<VideoPlayerProps> = ({
  sources,
  poster,
  autoPlay = false,
  title,
  description,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const dashPlayerRef = useRef<dashjs.MediaPlayerClass | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [, setSelectedQuality] = useState<string>(sources[0].quality);
  const [buffering, setBuffering] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [hoverPosition, setHoverPosition] = useState(0);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize DASH player
  useEffect(() => {
    const initializePlayer = () => {
      if (!videoRef.current) return;
      try {
        setBuffering(true);
        const player = dashjs.MediaPlayer().create();
        dashPlayerRef.current = player;
        player.initialize(videoRef.current, sources[0].url, autoPlay);

        player.updateSettings({
          streaming: {},
        });

        player.on(dashjs.MediaPlayer.events.PLAYBACK_METADATA_LOADED, () => {
          setIsPlayerReady(true);
          setBuffering(false);
        });

        player.on(dashjs.MediaPlayer.events.BUFFER_LEVEL_UPDATED, () => {
          const bufferLevel = player.getBufferLength('video');
          setBuffered(Math.min((bufferLevel / duration) * 100, 100));
        });

        player.on(dashjs.MediaPlayer.events.ERROR, (error: unknown) => {
          console.error('DASH.js Error:', error);
          setBuffering(false);
        });
      } catch (error) {
        console.error('Error initializing player:', error);
        setBuffering(false);
      }
    };

    initializePlayer();
    return () => {
      if (dashPlayerRef.current) {
        dashPlayerRef.current.destroy();
        dashPlayerRef.current = null;
      }
    };
  }, [sources, autoPlay]);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Handle mouse movement and controls visibility
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      if (isPlaying && !isHovering) {
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', () => {
        setShowControls(false);
      });
      return () => {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', () => {
          setShowControls(false);
        });
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
      };
    }
  }, [isPlaying, isHovering]);

  // Playback controls
  const handlePlayPause = async () => {
    if (!videoRef.current || !isPlayerReady) return;
    try {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        await videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
    setDuration(videoRef.current.duration);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const position = (e.clientX - rect.left) / rect.width;
    const newTime = position * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleProgressHover = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const position = (e.clientX - rect.left) / rect.width;
    setHoverPosition(position);
  };

  const handleVolumeChange = (newVolume: number) => {
    if (!videoRef.current) return;
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleToggleMute = () => {
    if (!videoRef.current) return;
    const newMutedState = !isMuted;
    videoRef.current.muted = newMutedState;
    setIsMuted(newMutedState);
    if (newMutedState) {
      handleVolumeChange(0);
    } else {
      handleVolumeChange(1);
    }
  };

  const handleFullscreenToggle = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      void containerRef.current.requestFullscreen();
    } else {
      void document.exitFullscreen();
    }
  };

  const handleQualityChange = async ({ quality }: { quality: string }) => {
    const source = sources.find((s) => s.quality === quality);
    if (!source || !dashPlayerRef.current || !videoRef.current) return;
    try {
      setBuffering(true);
      const currentTime = videoRef.current.currentTime;
      const wasPlaying = !videoRef.current.paused;
      dashPlayerRef.current.reset();
      dashPlayerRef.current.initialize(
        videoRef.current,
        source.url,
        wasPlaying,
      );
      videoRef.current.currentTime = currentTime;
      setSelectedQuality(quality);
      if (wasPlaying) {
        await videoRef.current.play();
      }
    } catch (error) {
      console.error('Error changing quality:', error);
      setBuffering(false);
    }
  };

  const handleSeek = (seconds: number) => {
    if (!videoRef.current) return;
    const newTime = Math.max(0, Math.min(currentTime + seconds, duration));
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const isControlsDisabled = !isPlayerReady || buffering;

  return (
    <>
      <PlayerWrapper>
        <VideoContainer
          ref={containerRef}
          onDoubleClick={handleFullscreenToggle}
          onMouseEnter={() => {
            setIsHovering(true);
          }}
          onMouseLeave={() => {
            setIsHovering(false);
          }}
        >
          <Video
            ref={videoRef}
            poster={poster}
            onTimeUpdate={handleTimeUpdate}
            onWaiting={() => {
              setBuffering(true);
            }}
            onPlaying={() => {
              setBuffering(false);
              setIsPlaying(true);
            }}
            onPause={() => {
              setIsPlaying(false);
            }}
          />
          <VideoOverlay style={{ opacity: showControls ? 1 : 0 }} />

          {/* Top Controls */}
          {showControls && (
            <TopControls>
              {title && <VideoTitle>{title}</VideoTitle>}
              {description && (
                <VideoDescription>{description}</VideoDescription>
              )}
            </TopControls>
          )}

          {buffering && (
            <div className="video-loading-spinner">
              <div className="spinner" />
            </div>
          )}

          {/* Bottom Controls */}
          {showControls && (
            <Controls>
              {/* Progress Bar */}
              <ProgressContainer
                ref={progressRef}
                onClick={handleProgressClick}
                onMouseMove={handleProgressHover}
                onMouseEnter={() => {
                  setIsHovering(true);
                }}
                onMouseLeave={() => {
                  setIsHovering(false);
                }}
              >
                <BufferedProgress style={{ width: `${buffered}%` }} />
                <Progress
                  style={{ width: `${(currentTime / duration) * 100}%` }}
                >
                  <ProgressHandle style={{ opacity: isHovering ? 1 : 0 }} />
                </Progress>
                <PreviewTooltip
                  style={{
                    opacity: isHovering ? 1 : 0,
                    left: `${hoverPosition * 100}%`,
                  }}
                >
                  {formatTime(hoverPosition * duration)}
                </PreviewTooltip>
              </ProgressContainer>

              <ControlsRow>
                <ControlsGroup>
                  <IconButton
                    onClick={() => {
                      void handlePlayPause();
                    }}
                    disabled={isControlsDisabled}
                  >
                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                  </IconButton>

                  <IconButton
                    onClick={() => {
                      handleSeek(-10);
                    }}
                    disabled={isControlsDisabled}
                  >
                    <Rewind size={24} />
                  </IconButton>

                  <IconButton
                    onClick={() => {
                      handleSeek(10);
                    }}
                    disabled={isControlsDisabled}
                  >
                    <FastForward size={24} />
                  </IconButton>

                  <VolumeContainer
                    onMouseEnter={() => {
                      setShowVolumeSlider(true);
                    }}
                    onMouseLeave={() => {
                      setShowVolumeSlider(false);
                    }}
                  >
                    <IconButton
                      onClick={handleToggleMute}
                      disabled={isControlsDisabled}
                    >
                      {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                    </IconButton>
                    <VolumeSlider
                      style={{ width: showVolumeSlider ? '100px' : '0px' }}
                      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const position = (e.clientX - rect.left) / rect.width;
                        handleVolumeChange(position);
                      }}
                    >
                      <VolumeLevel style={{ width: `${volume * 100}%` }} />
                    </VolumeSlider>
                  </VolumeContainer>

                  <TimeDisplay>
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </TimeDisplay>
                </ControlsGroup>

                <ControlsGroup>
                  <StatefulPopover
                    content={() => (
                      <StatefulMenu
                        items={sources.map((source) => ({
                          label: source.quality,
                        }))}
                        onItemSelect={({ item }) =>
                          handleQualityChange(item as never)
                        }
                      />
                    )}
                    placement="top"
                    overrides={{
                      Body: {
                        style: {
                          backgroundColor: 'rgba(0, 0, 0, 0.9)',
                          borderRadius: '4px',
                          border: 'none',
                        },
                      },
                      Inner: {
                        style: {
                          backgroundColor: 'transparent',
                          color: 'white',
                        },
                      },
                    }}
                  >
                    <IconButton disabled={isControlsDisabled}>
                      <Settings size={24} />
                    </IconButton>
                  </StatefulPopover>

                  <IconButton
                    onClick={handleFullscreenToggle}
                    disabled={isControlsDisabled}
                  >
                    {isFullscreen ? (
                      <Minimize size={24} />
                    ) : (
                      <Maximize size={24} />
                    )}
                  </IconButton>
                </ControlsGroup>
              </ControlsRow>
            </Controls>
          )}
        </VideoContainer>
      </PlayerWrapper>
    </>
  );
};

export default VideoPlayer;
