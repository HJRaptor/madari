import { useState, useEffect, useRef, useCallback } from 'react';
import * as dashjs from 'dashjs';

export interface Track {
  id: string;
  lang: string;
  label: string;
  roles?: string[];
}

export interface QualityLevel {
  bitrate: number;
  height: number;
  width: number;
  qualityIndex: number;
}

interface UseDashPlayerProps {
  manifestUrl: string;
  videoRef: React.RefObject<HTMLVideoElement>;
}

export interface UseDashPlayerReturn {
  isReady: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  bufferLevel: number;
  volume: number;
  isMuted: boolean;
  qualities: QualityLevel[];
  currentQuality: number;
  audioTracks: Track[];
  currentAudio: string;
  subtitleTracks: Track[];
  currentSubtitle: string;
  buffering: boolean;
  togglePlay: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  setQuality: (qualityIndex: number) => void;
  setAudioTrack: (trackId: string) => void;
  setSubtitleTrack: (trackId: string) => void;
}

export const useDashPlayer = ({
  manifestUrl,
  videoRef,
}: UseDashPlayerProps): UseDashPlayerReturn => {
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferLevel, setBufferLevel] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [qualities, setQualities] = useState<QualityLevel[]>([]);
  const [currentQuality, setCurrentQuality] = useState(-1);
  const [audioTracks, setAudioTracks] = useState<Track[]>([]);
  const [currentAudio, setCurrentAudio] = useState('');
  const [subtitleTracks, setSubtitleTracks] = useState<Track[]>([]);
  const [currentSubtitle, setCurrentSubtitle] = useState('off');
  const [buffering, setBuffering] = useState(false);

  const playerRef = useRef<dashjs.MediaPlayerClass | null>(null);
  const totalDurationRef = useRef<number>(0);
  const baseManifestUrl = useRef<string>(manifestUrl);
  const isInitialLoad = useRef<boolean>(true);
  const wasPlayingRef = useRef<boolean>(true);

  const getManifestUrlWithTime = useCallback((time: number) => {
    const httpsUrl = baseManifestUrl.current;
    return `${httpsUrl}?t=${Math.floor(time)}`;
  }, []);

  useEffect(() => {
    baseManifestUrl.current = manifestUrl;
  }, [manifestUrl]);

  const initializePlayer = useCallback(
    (url: string, seekTime?: number) => {
      if (!videoRef.current) return;

      setBuffering(true);

      if (playerRef.current) {
        wasPlayingRef.current = !playerRef.current.isPaused();
        playerRef.current.destroy();
      }

      const player = dashjs.MediaPlayer().create();
      playerRef.current = player;

      player.initialize(videoRef.current, url, true);
      player.updateSettings({
        streaming: {
          abr: { autoSwitchBitrate: { video: true } },
          buffer: {
            stableBufferTime: 20,
            bufferTimeAtTopQuality: 30,
          },
          text: { defaultEnabled: true },
          delay: {
            liveDelayFragmentCount: 0,
          },
        },
      });

      player.on(dashjs.MediaPlayer.events.MANIFEST_LOADED, () => {
        if (seekTime !== undefined) {
          player.seek(seekTime);
        }
      });

      player.on(dashjs.MediaPlayer.events.CAN_PLAY, () => {
        setIsReady(true);
        setBuffering(false);

        if (isInitialLoad.current || wasPlayingRef.current) {
          player.play();
          isInitialLoad.current = false;
        }

        const playerDuration = player.duration();

        if (!isNaN(playerDuration)) {
          totalDurationRef.current = playerDuration;
          setDuration((val) => {
            if (val) {
              return val;
            }

            return playerDuration;
          });
        }
      });

      player.on(dashjs.MediaPlayer.events.PLAYBACK_STARTED, () => {
        setIsPlaying(true);
        setBuffering(false);
      });

      player.on(dashjs.MediaPlayer.events.PLAYBACK_WAITING, () => {
        setBuffering(true);
      });

      player.on(dashjs.MediaPlayer.events.PLAYBACK_PLAYING, () => {
        setIsPlaying(true);
        setBuffering(false);
      });

      player.on(dashjs.MediaPlayer.events.PLAYBACK_PAUSED, () => {
        setIsPlaying(false);
      });

      player.on(dashjs.MediaPlayer.events.PLAYBACK_TIME_UPDATED, () => {
        const playerTime = player.time();
        if (!isNaN(playerTime)) {
          setCurrentTime(playerTime + (seekTime ?? 0));
        }
      });

      player.on(dashjs.MediaPlayer.events.BUFFER_LEVEL_UPDATED, () => {
        if (totalDurationRef.current > 0) {
          const level = player.getBufferLength('video');
          setBufferLevel((level / totalDurationRef.current) * 100);
        }
      });

      player.on(dashjs.MediaPlayer.events.ERROR, (e) => {
        console.warn('DASH player error:', e);
        setBuffering(false);
      });

      player.on(dashjs.MediaPlayer.events.PLAYBACK_METADATA_LOADED, () => {
        const audioTracks = player.getTracksFor('audio');
        const textTracks = player.getTracksFor('text');
        const videoQualities = player.getBitrateInfoListFor('video');

        setAudioTracks(
          audioTracks.map((track) => ({
            id: track.id as string,
            lang: track.lang as string,
            label: track.labels?.[0]?.text || `Audio (${track.lang})`,
            roles: track.roles as string[],
          })),
        );

        setSubtitleTracks(
          textTracks.map((track) => ({
            id: track.id as string,
            lang: track.lang as string,
            label: track.labels?.[0]?.text || `Subtitles (${track.lang})`,
            roles: track.roles as string[],
          })),
        );

        setQualities(
          videoQualities.map((quality, index) => ({
            bitrate: quality.bitrate,
            height: quality.height,
            width: quality.width,
            qualityIndex: index,
          })),
        );
      });
    },
    [videoRef],
  );

  useEffect(() => {
    const initialUrl = getManifestUrlWithTime(0);
    initializePlayer(initialUrl);

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [manifestUrl, initializePlayer, getManifestUrlWithTime]);

  const seek = useCallback(
    (time: number) => {
      if (!playerRef.current) return;

      const clampedTime = Math.max(0, Math.min(time, totalDurationRef.current));
      wasPlayingRef.current = !playerRef.current.isPaused();

      // Get current state before destroying player
      const currentState = {
        quality: playerRef.current.getQualityFor('video'),
        audioTrack: playerRef.current.getCurrentTrackFor('audio'),
        textTrack: playerRef.current.getCurrentTrackFor('text'),
        volume: playerRef.current.getVolume(),
        muted: playerRef.current.isMuted(),
      };

      // Create new manifest URL with the seek time
      const newManifestUrl = getManifestUrlWithTime(clampedTime);

      // Initialize new player with the seek time
      initializePlayer(newManifestUrl, clampedTime);

      if (playerRef.current) {
        const handleCanPlay = () => {
          if (!playerRef.current) return;

          // Restore previous state
          playerRef.current.setQualityFor('video', currentState.quality);
          if (currentState.audioTrack) {
            playerRef.current.setCurrentTrack(currentState.audioTrack);
          }
          if (currentState.textTrack) {
            playerRef.current.setCurrentTrack(currentState.textTrack);
          }
          playerRef.current.setVolume(currentState.volume);
          playerRef.current.setMute(currentState.muted);

          // Always resume playback after seek
          playerRef.current.play();

          playerRef.current.off(
            dashjs.MediaPlayer.events.CAN_PLAY,
            handleCanPlay,
          );
        };

        playerRef.current.on(dashjs.MediaPlayer.events.CAN_PLAY, handleCanPlay);
      }
    },
    [initializePlayer, getManifestUrlWithTime],
  );

  const togglePlay = useCallback(() => {
    if (!playerRef.current) return;

    if (isPlaying) {
      playerRef.current.pause();
    } else {
      playerRef.current.play();
    }
  }, [isPlaying]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    if (!playerRef.current) return;
    playerRef.current.setVolume(newVolume);
    setVolume(newVolume);
  }, []);

  const handleMutedChange = useCallback((muted: boolean) => {
    if (!playerRef.current) return;
    playerRef.current.setMute(muted);
    setIsMuted(muted);
  }, []);

  const handleQualityChange = useCallback((qualityIndex: number) => {
    if (!playerRef.current) return;
    playerRef.current.setQualityFor('video', qualityIndex);
    setCurrentQuality(qualityIndex);
  }, []);

  const handleAudioTrackChange = useCallback((trackId: string) => {
    if (!playerRef.current) return;
    const tracks = playerRef.current.getTracksFor('audio');
    const track = tracks.find((t) => t.id === trackId);
    if (track) {
      playerRef.current.setCurrentTrack(track);
      setCurrentAudio(trackId);
    }
  }, []);

  const handleSubtitleTrackChange = useCallback((trackId: string) => {
    if (!playerRef.current) return;
    if (trackId === 'off') {
      playerRef.current.setTextTrack(-1);
    } else {
      const tracks = playerRef.current.getTracksFor('text');
      const trackIndex = tracks.findIndex((t) => t.id === trackId);
      playerRef.current.setTextTrack(trackIndex);
    }
    setCurrentSubtitle(trackId);
  }, []);

  return {
    isReady,
    isPlaying,
    currentTime,
    duration,
    bufferLevel,
    volume,
    isMuted,
    qualities,
    currentQuality,
    audioTracks,
    currentAudio,
    subtitleTracks,
    currentSubtitle,
    buffering,
    togglePlay,
    seek,
    setVolume: handleVolumeChange,
    setMuted: handleMutedChange,
    setQuality: handleQualityChange,
    setAudioTrack: handleAudioTrackChange,
    setSubtitleTrack: handleSubtitleTrackChange,
  };
};
