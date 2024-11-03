import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { AddonContext } from '@/features/addon/providers/AddonContext.ts';
import { appSettingsAtom } from '@/atoms/app-settings.ts';
import { useAtomValue } from 'jotai';
import { getStreamUrl } from '@/utils/stremio';
import { useStyletron } from 'baseui';
import { Button } from 'baseui/button';
import { ArrowLeft } from 'lucide-react';
import VideoPlayer from '@/features/video/components/DashPlayer';

export default function PlayerPage() {
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  const plugin = searchParams.get('plugin');
  const url = searchParams.get('url');
  const id = searchParams.get('id');
  const type = searchParams.get('type');

  const addons = useContext(AddonContext);
  const suppliedAddon = addons.find((res) => res.config.id === plugin);

  const [css, $theme] = useStyletron();

  useEffect(() => {
    if (!plugin || !url || !id || !type) {
      navigate('/');
    }
  }, [id, navigate, plugin, suppliedAddon, type, url]);

  const appSettings = useAtomValue(appSettingsAtom);

  const [state, setState] = useState<{
    urls: string[];
  }>({
    urls: [],
  });

  useEffect(() => {
    const isHackEnable = appSettings.addons.find(
      (res) => res.url === suppliedAddon?.installUrl,
    );

    if (isHackEnable?.hack?.enable) {
      if (url) {
        getStreamUrl(isHackEnable.hack.realDebridApiKey, url)
          .then((docs) => {
            if (!docs) {
              return null;
            }

            setState({
              urls: sortVideoFormats(docs),
            });
          })
          .catch((e: unknown) => {
            console.error(e);
          });
      }
    } else {
      if (url) {
        setState({
          urls: [url],
        });
      }
    }
  }, [appSettings.addons, id, suppliedAddon?.installUrl, type, url]);

  return (
    <div
      className={css({
        backgroundColor: $theme.colors.backgroundPrimary,
        fontFamily: $theme.typography.font450.fontFamily,
        color: $theme.colors.primaryA,
      })}
    >
      <div
        className={css({
          top: 0,
          left: 0,
          padding: '12px',
          zIndex: 1,
          position: 'fixed',
        })}
      >
        <Button kind="secondary" shape="circle" $as={Link} to="/">
          <ArrowLeft />
        </Button>
      </div>

      <VideoPlayer
        sources={[
          {
            url: state.urls[0],
            quality: 'HD',
            bitrate: 9,
          },
        ]}
      ></VideoPlayer>
    </div>
  );
}

const sortVideoFormats = (urls: string[]) => {
  // Define format priorities (lower number = higher priority)
  const formatPriorities = {
    mpd: 0,
    m3u8: 1,
    webm: 2,
    mp4: 3,
  };

  return urls.sort((a, b) => {
    // Extract file extensions from URLs
    const formatA = a.split('.').pop()?.toLowerCase();
    const formatB = b.split('.').pop()?.toLowerCase();

    // Get priorities (default to highest number if format not found)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error okasokas
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const priorityA = formatPriorities[formatA] ?? Number.MAX_VALUE;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error okasokas
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const priorityB = formatPriorities[formatB] ?? Number.MAX_VALUE;

    return priorityA - priorityB;
  });
};
