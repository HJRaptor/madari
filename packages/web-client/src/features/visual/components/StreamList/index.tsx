import React, {
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useStyletron } from 'baseui';
import { Button } from 'baseui/button';
import { ChevronLeft, ChevronRight, ExternalLink, Play } from 'lucide-react';
import { MovieInfo } from '@/features/addon/service/Addon';
import { QueryKey, useSuspenseQueries } from '@tanstack/react-query';
import { AddonContext } from '@/features/addon/providers/AddonContext';
import { HeadingSmall } from 'baseui/typography';
import DOMPurify from 'dompurify';
import { Layer } from 'baseui/layer';
import { StyleObject } from 'styletron-react';

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

const SCROLL_AMOUNT = 400;

const StreamList: React.FC<Props> = ({
  onStreamSelect,
  season,
  episode,
  movie,
}) => {
  const [css] = useStyletron();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);

  const addonContext = useContext(AddonContext);

  const streamSupportedAddons = useMemo(() => {
    return addonContext.filter((res) => res.supportStream);
  }, [addonContext]);

  const streamUrls = useMemo(() => {
    return streamSupportedAddons.map((res) => ({
      addon: res.config.id,
      url: res.loadStream({
        episode,
        season,
        type: movie.type,
        id: movie.id,
      }),
    }));
  }, [episode, movie.id, movie.type, season, streamSupportedAddons]);

  const streams = useSuspenseQueries({
    queries: streamUrls.map((item) => ({
      queryKey: ['streams', item] as QueryKey,
      queryFn: async () => {
        const response = await fetch(item.url);
        const data = (await response.json()) as { streams: StreamSource[] };
        return data.streams.map((res: StreamSource) => ({
          ...res,
          plugin: item.addon,
        }));
      },
    })),
  }).flat();

  const _streams = useMemo(() => {
    try {
      return streams.map((stream) => stream.data).flat();
    } catch (e) {
      console.error(e);
      return [];
    }
  }, [streams]);

  const updateScrollButtons = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setShowLeftScroll(scrollLeft > 0);
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount =
        direction === 'left' ? -SCROLL_AMOUNT : SCROLL_AMOUNT;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth',
      });
    }
  }, []);

  if (_streams.length === 0) {
    return (
      <div className={css({ width: '100%' })}>
        <HeadingSmall>
          No streams available. Please install plugins to provide streams.
          Available plugins: {streamSupportedAddons.length}
        </HeadingSmall>
      </div>
    );
  }

  const scrollButtonStyle: StyleObject = {
    width: '40px',
    height: '40px',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ':hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      borderColor: 'white',
      transform: 'scale(1.1)',
    },
  };

  return (
    <div
      className={css({
        width: '100%',
        position: 'relative',
        marginTop: '8px',
      })}
    >
      {showLeftScroll && (
        <Layer>
          <div
            className={css({
              position: 'absolute',
              left: '-20px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
            })}
          >
            <Button
              onClick={() => {
                scroll('left');
              }}
              overrides={{
                BaseButton: {
                  style: scrollButtonStyle,
                },
              }}
            >
              <ChevronLeft size={20} />
            </Button>
          </div>
        </Layer>
      )}

      {showRightScroll && (
        <Layer>
          <div
            className={css({
              position: 'absolute',
              right: '-20px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
            })}
          >
            <Button
              onClick={() => {
                scroll('right');
              }}
              overrides={{
                BaseButton: {
                  style: scrollButtonStyle,
                },
              }}
            >
              <ChevronRight size={20} />
            </Button>
          </div>
        </Layer>
      )}

      <div
        ref={scrollContainerRef}
        onScroll={updateScrollButtons}
        className={css({
          display: 'flex',
          gap: '12px',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          padding: '4px',
          '::-webkit-scrollbar': {
            display: 'none',
          },
        })}
      >
        {_streams.map((stream, index) => (
          <StreamCard
            key={index}
            stream={stream}
            onClick={() => onStreamSelect?.(stream)}
          />
        ))}
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
  const [isHovered, setIsHovered] = useState(false);

  const sanitizedTitle = useMemo(() => {
    const cleanTitle = DOMPurify.sanitize(stream.title);
    return cleanTitle.split('\n').join('<br/>');
  }, [stream.title]);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => {
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
      className={css({
        width: '340px',
        height: '180px',
        backgroundColor: '#333',
        borderRadius: '12px',
        padding: '16px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        opacity: isHovered ? 1 : 0.85,
        ':hover': {
          backgroundColor: '#1a1a1a',
          transform: 'translateY(-4px)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        },
      })}
    >
      {/* Stream Details */}
      <div className={css({ position: 'relative', zIndex: 1 })}>
        <div
          className={css({
            fontSize: '16px',
            fontWeight: '600',
            color: 'white',
            marginBottom: '4px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          })}
        >
          {stream.name}
          {(stream.quality || stream.language) && (
            <span
              className={css({
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.7)',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                padding: '2px 8px',
                borderRadius: '4px',
              })}
            >
              {stream.quality || stream.language}
            </span>
          )}
        </div>
        <div
          className={css({
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.7)',
            overflow: 'hidden',
          })}
          dangerouslySetInnerHTML={{ __html: sanitizedTitle }}
        />
      </div>

      {/* Play Button Overlay */}
      <div
        className={css({
          position: 'absolute',
          bottom: '28px',
          right: '0px',
          transform: `translate(-50%, -50%) scale(${isHovered ? '1' : '0'})`,
          transition: 'all 0.3s ease',
          opacity: isHovered ? 1 : 0,
          zIndex: 2,
        })}
      >
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          shape="circle"
          overrides={{
            BaseButton: {
              style: {
                backgroundColor: '#e50914',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ':hover': {
                  backgroundColor: '#f40612',
                  transform: 'scale(1.1)',
                },
              },
            },
          }}
        >
          <Play size={30} color="white" />
        </Button>
      </div>

      {/* Bottom Action Bar */}
      <div
        className={css({
          marginTop: 'auto',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
        })}
      >
        <div
          className={css({
            flex: 1,
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.6)',
          })}
        >
          {stream.plugin}
          {stream.size && ` • ${stream.size}`}
        </div>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            window.open(stream.url, '_blank');
          }}
          size="mini"
          overrides={{
            BaseButton: {
              style: {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#FFF',
                minWidth: 'auto',
                ':hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
              },
            },
          }}
        >
          <ExternalLink size={14} />
        </Button>
      </div>
    </div>
  );
};

export default StreamList;
