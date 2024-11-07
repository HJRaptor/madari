import { UseVideoPlayerParamsReturn } from '@/features/video/hooks/use-video-player-params.ts';
import { useMemo } from 'react';
import DashVideoPlayer from '../DashPlayer/index.tsx';

export default function VideoPlayer({
  data,
}: {
  data: UseVideoPlayerParamsReturn;
  info: {
    id: string;
    type: string;
  };
}) {
  const formatToRender = useMemo(() => {
    const formats = Object.values(data?.formats ?? {});

    if (formats.indexOf('mpd') !== -1) {
      return 'mpd';
    }

    return formats[0] || 'mp4';
  }, [data?.formats]);

  return (
    <>
      {formatToRender === 'mpd' && data?.url && (
        <>
          <DashVideoPlayer key={data.url} input={data} />
        </>
      )}
    </>
  );
}
