import React, { useContext, useMemo } from 'react';
import { useStyletron } from 'baseui';
import { Button } from 'baseui/button';
import { ExternalLink, Play } from 'lucide-react';
import { MovieInfo } from '@/features/addon/service/Addon.tsx';
import { QueryKey, useSuspenseQueries } from '@tanstack/react-query';
import { AddonContext } from '@/features/addon/providers/AddonContext.ts';

interface StreamSource {
  name: string;
  title: string;
  url: string;
  plugin: string;
  quality?: string;
  language?: string;
  size?: string;
}

interface Props {
  onStreamSelect?: (stream: StreamSource) => void;
  movie: MovieInfo;
  episode?: number;
  season?: number;
}

const StreamList: React.FC<Props> = ({
  onStreamSelect,
  season,
  episode,
  movie,
}) => {
  const [css] = useStyletron();

  const addonContext = useContext(AddonContext);

  const streamSupportedAddons = useMemo(() => {
    return addonContext.filter((res) => res.supportStream);
  }, [addonContext]);

  const streamUrls: { addon: string; url: string }[] = useMemo(() => {
    return streamSupportedAddons.map((res) => {
      return {
        addon: res.config.id,
        url: res.loadStream({
          episode,
          season,
          type: movie.type,
          id: movie.id,
        }),
      };
    });
  }, [episode, movie.id, movie.type, season, streamSupportedAddons]);

  const streams = useSuspenseQueries({
    queries: streamUrls.map((item) => ({
      queryKey: ['streams', item] as QueryKey,
      queryFn: async () => {
        console.log(item.url);
        return await fetch(item.url, {})
          .then((docs) => docs.json())
          .then((docs: { streams: StreamSource[] }) => {
            return docs.streams.map((res) => ({
              ...res,
              plugin: item.addon,
            }));
          });
      },
    })),
  }).flat();

  const _streams = streams.map((stream) => stream.data).flat();

  return (
    <div
      className={css({
        width: '100%',
        marginTop: '24px',
      })}
    >
      <div
        className={css({
          gap: '16px',
          width: '100%',
          display: 'flex',
          overflowX: 'auto',
        })}
      >
        {_streams.map((stream, index) => {
          return (
            <StreamCard
              onClick={() => {
                onStreamSelect?.(stream);
              }}
              key={index}
              stream={stream}
            />
          );
        })}
      </div>
    </div>
  );
};

const StreamCard = ({
  stream,
  onClick,
}: {
  stream: StreamSource;
  onClick: VoidFunction;
}) => {
  const [css] = useStyletron();

  return (
    <div
      onClick={() => {
        onClick();
      }}
      className={css({
        flexShrink: 0,
        width: '360px',
        height: '260px',
        marginTop: '10px',
        marginBottom: '10px',
        borderRadius: '20px',
        marginLeft: '4px',
        overflow: 'hidden',
        position: 'relative',
        transition: 'all 0.3s ease',
        outline: 'none',
        opacity: 0.85,
        display: 'flex',
        flexDirection: 'column',
        padding: '16px',
        backgroundColor: '#333',
        ':hover': {
          cursor: 'pointer',
          opacity: 1,
          backgroundColor: '#1a1a1a',
        },
        ':focus-within': {
          outline: '2px solid white',
          outlineOffset: '2px',
          opacity: 1,
        },
      })}
    >
      <div
        className={css({
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '12px',
        })}
      >
        <div
          className={css({
            flex: 1,
          })}
        >
          <div
            className={css({
              fontSize: '18px',
              fontWeight: '600',
              color: 'white',
              marginBottom: '4px',
            })}
          >
            {stream.name}
          </div>
          <div
            className={css({
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: '8px',
            })}
          >
            {stream.title}
          </div>
        </div>
      </div>

      <span
        className={css({
          flexGrow: 1,
        })}
      />

      <div
        className={css({
          display: 'flex',
          gap: '12px',
        })}
      >
        <Button
          overrides={{
            BaseButton: {
              style: {
                backgroundColor: '#e50914',
                color: '#FFF',
                flexGrow: 1,
                ':hover': {
                  backgroundColor: '#f40612',
                  transform: 'translateY(-1px)',
                },
              },
            },
          }}
        >
          <Play size={16} style={{ marginRight: '8px' }} /> Play
        </Button>

        <Button
          onClick={() => {
            return window.open(stream.url, '_blank');
          }}
          overrides={{
            BaseButton: {
              style: {
                color: '#FFF',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                ':hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  transform: 'translateY(-1px)',
                },
              },
            },
          }}
        >
          <ExternalLink size={16} />
        </Button>
      </div>
    </div>
  );
};

export default StreamList;
