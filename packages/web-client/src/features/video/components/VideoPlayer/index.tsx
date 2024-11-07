import { UseVideoPlayerParamsReturn } from '@/features/video/hooks/use-video-player-params.ts';
import { useMemo } from 'react';
import DashVideoPlayer from '../DashPlayer/index.tsx';
import LoaderComponent from '@/features/video/components/CommonVideoPlayer/Loader.tsx';

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

    return formats[0] || null;
  }, [data?.formats]);

  return (
    <>
      {formatToRender === 'mpd' && data?.url && (
        <>
          <DashVideoPlayer key={data.url} input={data} />
        </>
      )}
      {formatToRender === null && <LoaderComponent buffering={true} />}
    </>
  );
}
