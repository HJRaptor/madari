import React, { useRef } from 'react';
import { useManifestUrl } from '@/features/video/hooks/use-manifest-url.ts';
import { UseVideoPlayerParamsReturn } from '@/features/video/hooks/use-video-player-params.ts';
import { useDashPlayer } from '@/features/video/hooks/use-dash-player.ts';
import CommonVideoPlayer from '@/features/video/components/CommonVideoPlayer';

interface VideoPlayerProps {
  input: NonNullable<UseVideoPlayerParamsReturn>;
}

const DashVideoPlayer: React.FC<VideoPlayerProps> = ({ input }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const manifest = useManifestUrl(input, 'mpd');

  const dash = useDashPlayer({
    videoRef,
    manifestUrl: manifest.url ?? '',
  });

  if (!manifest || !dash) {
    return null;
  }

  return (
    <>
      <CommonVideoPlayer manifest={manifest} {...dash} ref={videoRef} />
    </>
  );
};

export default DashVideoPlayer;
