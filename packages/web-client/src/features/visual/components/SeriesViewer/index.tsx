import React, { useMemo, useRef, useState } from 'react';
import { useStyletron } from 'baseui';
import { ButtonGroup } from 'baseui/button-group';
import { Button } from 'baseui/button';
import { Calendar, ChevronLeft, ChevronRight, Clock, Play } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { MovieInfo, Video } from '@/features/addon/service/Addon.tsx';

interface Props {
  data: MovieInfo;
}

const EpisodeList: React.FC<Props> = ({ data }) => {
  const [css] = useStyletron();
  const [activeSeason, setActiveSeason] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const seasons = useMemo(() => {
    if (!data.videos) return [];
    return Array.from(new Set(data.videos.map((video) => video.season))).sort(
      (a, b) => a - b,
    );
  }, [data.videos]);

  const episodes = useMemo(() => {
    if (!data.videos) return [];
    return data.videos
      .filter((video) => video.season === activeSeason)
      .sort((a, b) => a.episode - b.episode);
  }, [data.videos, activeSeason]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleScroll = (direction: 'left' | 'right') => {
    const container = containerRef.current;
    if (!container) return;

    const scrollAmount =
      direction === 'left' ? -container.offsetWidth : container.offsetWidth;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const updateArrowVisibility = () => {
    const container = containerRef.current;
    if (!container) return;

    setShowLeftArrow(container.scrollLeft > 0);
    setShowRightArrow(
      container.scrollLeft < container.scrollWidth - container.clientWidth,
    );
  };

  const getSeasonLabel = (season: number) => {
    return season === 0 ? 'Specials' : `Season ${season}`;
  };

  const NavigationArrow = ({ direction }: { direction: 'left' | 'right' }) => {
    const isLeft = direction === 'left';
    return (
      <div
        className={css({
          position: 'absolute',
          top: 0,
          bottom: 0,
          [isLeft ? 'left' : 'right']: 0,
          width: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(to ${isLeft ? 'right' : 'left'}, rgba(15,15,15,0.9), rgba(15,15,15,0))`,
          zIndex: 3,
        })}
      >
        <Button
          onClick={() => {
            handleScroll(direction);
          }}
          overrides={{
            BaseButton: {
              style: {
                opacity: 0.7,
                ':hover': {
                  opacity: 1,
                },
              },
            },
          }}
        >
          {isLeft ? <ChevronLeft size={48} /> : <ChevronRight size={24} />}
        </Button>
      </div>
    );
  };

  const CustomCard = ({ episode }: { episode: Video }) => (
    <div
      className={css({
        flexShrink: 0,
        width: '460px',
        height: '260px',
        backgroundColor: '#141414',
        borderRadius: '10px',
        overflow: 'hidden',
        margin: '10px',
        position: 'relative',
        transition: 'all 0.3s ease',
        outline: 'none',
        opacity: 0.85,
        ':hover': {
          transform: 'scale(1.02)',
          cursor: 'pointer',
          opacity: 1,
          '::before': {
            opacity: 0.8,
          },
        },
        ':focus': {
          outline: '2px solid white',
          outlineOffset: '2px',
          opacity: 1,
        },
        '::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 100%)',
          opacity: 0.6,
          transition: 'opacity 0.3s ease',
          zIndex: 1,
        },
      })}
      tabIndex={0}
    >
      <div
        className={css({
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${episode.thumbnail})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 0,
        })}
      />

      <div
        className={css({
          position: 'relative',
          height: 'calc(100% - 20px - 20px)',
          marginTop: '12px',
          marginBottom: '12px',
          padding: '20px',
          color: 'white',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        })}
      >
        <div>
          <div
            className={css({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px',
            })}
          >
            <span
              className={css({
                backgroundColor: '#e50914',
                padding: '4px 12px',
                borderRadius: '4px',
                fontSize: '14px',
                fontWeight: '500',
              })}
            >
              Episode {episode.episode}
            </span>
            <span
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                opacity: 0.8,
                fontSize: '13px',
              })}
            >
              <Clock size={14} />
              {data.runtime}
            </span>
            <span
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                opacity: 0.8,
                fontSize: '13px',
              })}
            >
              <Calendar size={14} />
              {formatDate(episode.firstAired)}
            </span>
          </div>

          <div
            className={css({
              fontSize: '24px',
              fontWeight: '600',
              marginBottom: '12px',
              textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            })}
          >
            {episode.name}
          </div>

          <div
            className={css({
              fontSize: '14px',
              opacity: 0.9,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: '1.4',
              textShadow: '0 1px 2px rgba(0,0,0,0.5)',
            })}
          >
            {episode.overview}
          </div>
        </div>

        <Button
          onClick={() => {}}
          overrides={{
            BaseButton: {
              style: {
                backgroundColor: '#e50914',
                color: '#fff',
                width: 'auto',
                alignSelf: 'flex-start',
                ':hover': {
                  backgroundColor: '#f40612',
                  transform: 'translateY(-1px)',
                },
              },
            },
          }}
        >
          <Play size={16} style={{ marginRight: '8px' }} /> Play Episode
        </Button>
      </div>
    </div>
  );

  return (
    <div
      className={css({
        width: '100%',
        overflow: 'hidden',
        marginTop: '12px',
      })}
    >
      {seasons.length > 0 && (
        <div
          className={css({
            marginBottom: '12px',
          })}
        >
          <ButtonGroup>
            {seasons.map((season) => (
              <Button
                key={season}
                onClick={() => {
                  setActiveSeason(season);
                }}
                overrides={{
                  BaseButton: {
                    style: {
                      backgroundColor:
                        activeSeason === season ? '#e50914' : 'transparent',
                      opacity: activeSeason === season ? 1 : 0.7,
                      margin: '6px',
                      ':hover': {
                        backgroundColor:
                          activeSeason === season
                            ? '#e50914'
                            : 'rgba(255,255,255,0.1)',
                        opacity: 1,
                      },
                      ':focus': {
                        outline: '2px solid white',
                        outlineOffset: '2px',
                      },
                    },
                  },
                }}
              >
                {getSeasonLabel(season)}
              </Button>
            ))}
          </ButtonGroup>
        </div>
      )}

      <div
        className={css({
          position: 'relative',
          width: '100%',
        })}
      >
        <AnimatePresence>
          {showLeftArrow && <NavigationArrow direction="left" />}
        </AnimatePresence>

        <div
          ref={containerRef}
          onScroll={() => {
            updateArrowVisibility();
          }}
          className={css({
            display: 'flex',
            gap: '0px',
            overflowX: 'auto',
            scrollBehavior: 'smooth',
            '::-webkit-scrollbar': {
              display: 'none',
            },
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          })}
        >
          {episodes.map((episode) => (
            <CustomCard key={episode.id} episode={episode} />
          ))}
        </div>

        <AnimatePresence>
          {showRightArrow && <NavigationArrow direction="right" />}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EpisodeList;
