import { useNavigate, useSearchParams } from 'react-router-dom';
import { useContext, useEffect, useMemo, useState } from 'react';
import { AddonContext } from '@/features/addon/providers/AddonContext.ts';
import { getStreamUrl } from '@/utils/stremio.ts';
import { useAtomValue } from 'jotai/index';
import { appSettingsAtom } from '@/atoms/app-settings.ts';

export type GetStreamUrl = Awaited<ReturnType<typeof getStreamUrl>>;
export type UseVideoPlayerParamsReturn = Awaited<
  ReturnType<typeof useVideoPlayerParams>
>;

export function useVideoPlayerParams() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const plugin = searchParams.get('plugin');
  const url = searchParams.get('url');
  const id = searchParams.get('id');
  const type = searchParams.get('type');

  const addons = useContext(AddonContext);
  const suppliedAddon = useMemo(() => {
    return addons.find((res) => res.config.id === plugin);
  }, [addons, plugin]);
  const appSettings = useAtomValue(appSettingsAtom);
  const [state, setState] = useState<GetStreamUrl | null>(null);

  useEffect(() => {
    if (!plugin || !url || !id || !type) {
      navigate('/');
    }
  }, [id, navigate, plugin, suppliedAddon, type, url]);

  useEffect(() => {
    const isHackEnable = appSettings.addons.find(
      (res) => res.url === suppliedAddon?.installUrl,
    );

    if (isHackEnable?.hack?.enable && url) {
      getStreamUrl(isHackEnable.hack.realDebridApiKey, url)
        .then((_docs) => {
          setState(_docs);
        })
        .catch((e: unknown) => {
          console.error(e);
        });
    } else {
      if (url) {
        setState({
          audios: [],
          subtitles: [],
          url,
          qualities: {},
          formats: {},
        });
      }
    }
  }, [appSettings, id, suppliedAddon, type, url]);

  return state;
}
