import { useStyletron } from 'baseui';
import { Button } from 'baseui/button';
import { Suspense, useContext, useEffect, useMemo, useState } from 'react';
import { CircleArrowLeft } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAtom } from 'jotai/index';
import { tileViewAtom } from '@/features/listing/atoms/tiles-view.ts';
import { AddonContext } from '@/features/addon/providers/AddonContext.ts';
import { useSuspenseQuery } from '@tanstack/react-query';
import { activeTitle } from '@/features/listing/atoms/active-title.ts';
import { MovieInfo } from '@/features/addon/service/Addon.tsx';
import EpisodeList from '@/features/visual/components/SeriesViewer';
import StreamList from '@/features/visual/components/StreamList';

export default function InfoPage() {
  const [css] = useStyletron();
  const [, setTileView] = useAtom(tileViewAtom);

  useEffect(() => {
    setTileView('medium');
  }, [setTileView]);

  const params = useParams<{
    plugin: string;
    type: string;
    id: string;
  }>();

  const addons = useContext(AddonContext);

  const addon = useMemo(() => {
    return addons.find(
      (res) =>
        res.config.idPrefixes?.findIndex((item) =>
          params.id?.startsWith(item),
        ) !== -1,
    );
  }, [addons, params.id]);

  const { data } = useSuspenseQuery({
    queryKey: [params.type, params.type, params.id],
    queryFn: () => {
      if (!addon) {
        return;
      }

      if (!(params.type && params.id)) {
        return;
      }

      return fetch(
        addon.loadItem({
          type: params.type,
          id: params.id,
        }),
      )
        .then((docs) => docs.json() as never as { meta: MovieInfo })
        .then((docs) => {
          return docs.meta;
        });
    },
  });

  const [, setActiveTitleData] = useAtom(activeTitle);

  useEffect(() => {
    const type = params.type;

    if (data && addon && type) {
      setActiveTitleData((prev) => {
        if (prev?.id === data.id) {
          return prev;
        }
        return {
          data,
          id: prev?.id ?? data.id,
          categoryId: prev?.categoryId ?? addon.config.id + '/' + type,
        };
      });
    }
  }, [addon, data, params.type, setActiveTitleData]);

  const navigate = useNavigate();

  const [selected, setSelected] = useState<{
    episode: number;
    season: number;
  }>();

  return (
    <div
      className={css({
        padding: '0px 64px',
      })}
    >
      <Button
        startEnhancer={<CircleArrowLeft />}
        kind="secondary"
        $as={Link}
        onClick={(e) => {
          if (selected) {
            e.preventDefault();
            setSelected(undefined);
          }
        }}
        to="/"
      >
        Back
      </Button>
      {data && data.type === 'series' && !selected && (
        <EpisodeList
          data={data}
          onEpisodeSelect={(props) => {
            setSelected({
              episode: props.episode,
              season: props.season,
            });
          }}
        />
      )}
      <Suspense fallback={<>Wrong</>}>
        {data &&
          (data.type === 'movie' || (data.type === 'series' && selected)) && (
            <StreamList
              movie={data}
              episode={selected?.episode}
              season={selected?.season}
              onStreamSelect={(stream) => {
                navigate(
                  `/player?plugin=${encodeURIComponent(stream.plugin)}&url=${encodeURIComponent(stream.url)}&id=${params.id}&type=${params.type}`,
                );
                console.log('Selected stream:', stream);
              }}
            />
          )}
      </Suspense>
    </div>
  );
}
