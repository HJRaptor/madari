import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { AddonContext } from '@/features/addon/providers/AddonContext.ts';
import { appSettingsAtom } from '@/atoms/app-settings.ts';
import { useAtomValue } from 'jotai';
import { getStreamUrl } from '@/utils/stremio';
import { useStyletron } from 'baseui';
import {
  MediaAnnouncer,
  MediaPlayer,
  MediaProvider,
  Poster,
} from '@vidstack/react';
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from '@vidstack/react/player/layouts/default';
import { Button } from 'baseui/button';
import { ArrowLeft } from 'lucide-react';

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
              urls: docs,
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
      <MediaPlayer
        className={css({
          height: '100vh',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: $theme.colors.backgroundPrimary,
        })}
        viewType="video"
        streamType="on-demand"
        crossOrigin
        playsInline
        autoPlay={true}
        src={state.urls.map((res) => ({ src: res }) as never)}
      >
        <MediaProvider>
          <Poster
            className="vds-poster"
            src={`https://images.metahub.space/background/medium/${id}/img`}
          />
        </MediaProvider>
        <MediaAnnouncer />
        <DefaultVideoLayout icons={defaultLayoutIcons} />
      </MediaPlayer>
    </div>
  );
}
