import { UseVideoPlayerParamsReturn } from '@/features/video/hooks/use-video-player-params.ts';
import { useMemo, useState } from 'react';

export const useManifestUrl = (
  input: UseVideoPlayerParamsReturn,
  format: string,
) => {
  const [selectedAudioTrack, setSelectedAudioTrack] = useState<string | null>(
    input?.audios?.[0]?.lang_iso ?? null,
  );
  const [selectedSubtitle, setSelectedSubtitle] = useState<string | null>(
    input?.subtitles?.[0]?.lang_iso ?? null,
  );
  const [selectedQuality, setSelectedQuality] = useState<string>(
    Object.values(input?.qualities ?? {})[0],
  );

  const url = useMemo(() => {
    const codec = input?.audios?.find(
      (audio) => audio.lang_iso === selectedAudioTrack,
    );

    return (
      input?.url
        ?.replace('{format}', format)
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .replace('{subtitles}', selectedSubtitle!)
        .replace('{quality}', selectedQuality)
        .replace('{audioCodec}', codec?.codec ?? '')
        .replace('{audio}', codec?.id ?? '')
    );
  }, [
    format,
    input?.audios,
    input?.url,
    selectedAudioTrack,
    selectedQuality,
    selectedSubtitle,
  ]);

  return {
    url,
    qualities: input?.qualities,
    audios: input?.audios,
    subtitles: input?.subtitles,
    changeAudioTrack: setSelectedAudioTrack,
    changeQuality: setSelectedQuality,
    changeSubtitle: setSelectedSubtitle,
  };
};
