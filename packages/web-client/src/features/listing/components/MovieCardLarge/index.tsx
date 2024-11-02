import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useStyletron } from 'baseui';
import { Info, Play, Star } from 'lucide-react';
import { MovieInfo } from '@/features/addon/service/Addon.tsx';
import { useAtom } from 'jotai/index';
import { activeTitle } from '@/features/listing/atoms/active-title.ts';

// Types
interface MovieData {
  title: string;
  year: string;
  genres: string[];
  rating?: string;
  description: string;
  castMembers: Array<{
    name: string;
    id: string;
  }>;
  images: {
    poster: string;
    hover: string;
  };
}

// Memoized Rating Badge Component
const RatingBadge = memo(({ rating }: { rating: string }) => {
  const [css] = useStyletron();
  return (
    <div
      className={css({
        position: 'absolute',
        top: '12px',
        right: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        padding: '6px 12px',
        borderRadius: '100px',
        color: '#ffd700',
        fontSize: '14px',
        fontWeight: '600',
        zIndex: 2,
        transition: 'all 300ms cubic-bezier(0.2, 0, 0, 1)',
        ':hover': {
          transform: 'scale(1.05)',
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
        },
      })}
    >
      <Star size={14} fill="#ffd700" />
      <span>{rating}</span>
    </div>
  );
});

interface TagProps {
  tag: string;
  index: number;
  isActive: boolean;
  timingFunctions: TimingFunctions;
}

interface CastMemberProps {
  actor: {
    name: string;
    id: string;
  };
  isLast: boolean;
}

interface TimingFunctions {
  expand: string;
  hover: string;
  rise: string;
  fade: string;
}

// Utility for creating timing functions
const createTimingFunctions = (): TimingFunctions => ({
  expand: 'cubic-bezier(0.26, 0.54, 0.32, 1)',
  hover: 'cubic-bezier(0.2, 0, 0, 1)',
  rise: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  fade: 'cubic-bezier(0.4, 0, 0.2, 1)',
});

// Memoized Tag Component
const Tag = memo(({ tag, index, isActive, timingFunctions }: TagProps) => {
  const [css] = useStyletron();
  return (
    <span
      className={css({
        padding: '4px 12px',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '100px',
        color: 'white',
        fontSize: '12px',
        transform: isActive ? 'translateY(0)' : 'translateY(10px)',
        opacity: isActive ? 1 : 0,
        transition: `all 400ms ${timingFunctions.rise} ${100 + index * 50}ms`,
      })}
    >
      {tag}
    </span>
  );
});

// Memoized Cast Member Component
const CastMember = memo(({ actor, isLast }: CastMemberProps) => {
  const [css] = useStyletron();
  return (
    <React.Fragment>
      <button
        onClick={(e) => {
          e.stopPropagation();
          console.log(`Clicked on ${actor.name}`);
        }}
        className={css({
          color: 'rgba(255, 255, 255, 0.9)',
          background: 'none',
          border: 'none',
          padding: '0',
          cursor: 'pointer',
          ':hover': {
            color: 'white',
            textDecoration: 'underline',
          },
          ':focus': {
            outline: 'none',
            color: 'white',
            textDecoration: 'underline',
          },
        })}
      >
        {actor.name}
      </button>
      {!isLast && <span className={css({ margin: '0 4px' })}>,</span>}
    </React.Fragment>
  );
});

// Memoized Image Component with loading handling
const MovieImage = memo(
  ({
    posterUrl,
    hoverUrl,
    isHovered,
    title,
    onLoad,
  }: {
    posterUrl: string;
    hoverUrl: string;
    isHovered: boolean;
    title: string;
    onLoad: () => void;
  }) => {
    const [css] = useStyletron();
    const [isHoverImageLoaded, setIsHoverImageLoaded] = useState(false);

    useEffect(() => {
      const img = new Image();
      img.src = hoverUrl;
      img.onload = () => {
        setIsHoverImageLoaded(true);
        onLoad();
      };
    }, [hoverUrl, onLoad]);

    return (
      <div
        className={css({
          position: 'relative',
          width: '100%',
          height: '100%',
          ':before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: isHovered
              ? 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 100%)'
              : 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.4) 100%)',
            zIndex: 1,
            transition: 'all 500ms cubic-bezier(0.2, 0, 0, 1)',
          },
        })}
      >
        <img
          src={isHovered && isHoverImageLoaded ? hoverUrl : posterUrl}
          alt={title}
          className={css({
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 600ms cubic-bezier(0.2, 0, 0, 1)',
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          })}
        />
      </div>
    );
  },
);

// Action Buttons Component
const ActionButtons = memo(
  ({
    isActive,
    timingFunctions,
  }: {
    isActive: boolean;
    timingFunctions: TimingFunctions;
  }) => {
    const [css] = useStyletron();

    return (
      <div
        className={css({
          display: 'flex',
          gap: '12px',
          opacity: isActive ? 1 : 0,
          transform: isActive ? 'translateY(0)' : 'translateY(10px)',
          transition: `all 400ms ${timingFunctions.rise} 200ms`,
        })}
      >
        <button
          className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            backgroundColor: 'white',
            border: 'none',
            borderRadius: '8px',
            color: 'black',
            fontWeight: '600',
            cursor: 'pointer',
            transition: `all 300ms ${timingFunctions.hover}`,
            ':hover': {
              transform: 'scale(1.05) translateY(-2px)',
              boxShadow: '0 7px 14px rgba(0,0,0,0.12)',
            },
          })}
        >
          <Play size={18} />
          Watch
        </button>

        <button
          className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '44px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            cursor: 'pointer',
            transition: `all 300ms ${timingFunctions.hover}`,
            ':hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              transform: 'translateY(-2px)',
            },
          })}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Info size={18} />
        </button>
      </div>
    );
  },
);

const MovieCardLarge = forwardRef<
  HTMLDivElement,
  {
    data: MovieInfo;
    listId: string;
    index: number;
    height: number;
    width: number;
  }
>((_props, ref) => {
  const [css] = useStyletron();
  const [, setIsHoverImageLoaded] = useState(false);

  const timingFunctions = createTimingFunctions();

  // Movie data (in real app, this would be passed as props)
  const movieData: MovieData = {
    title: _props.data.name,
    year: _props.data.year,
    genres: _props.data.genres,
    rating: _props.data.imdbRating,
    description: _props.data.description,
    castMembers: _props.data.cast.map((res) => ({
      id: res,
      name: res,
    })),
    images: {
      poster: `https://images.metahub.space/poster/medium/${_props.data.imdb_id}/img`,
      hover: `https://images.metahub.space/background/medium/${_props.data.imdb_id}/img`,
    },
  };

  const handleHoverImageLoad = useCallback(() => {
    setIsHoverImageLoaded(true);
  }, []);

  const [active, setActiveCard] = useAtom(activeTitle);

  const isActive = useMemo(() => {
    return (
      active?.index === _props.index && active.categoryId === _props.listId
    );
  }, [_props.index, _props.listId, active?.categoryId, active?.index]);

  const htmlRef = useRef<HTMLDivElement>();

  useEffect(() => {
    htmlRef.current?.scrollIntoView({
      block: 'center',
      inline: 'nearest',
      behavior: 'smooth',
    });
  }, []);

  return (
    <div
      ref={ref}
      className={css({
        position: 'relative',
        flexShrink: 0,
        height: _props.height.toString() + 'px',
        width: _props.width.toString() + 'px',
      })}
      onBlur={() => {
        setActiveCard(undefined);
      }}
      onFocus={() => {
        setActiveCard({
          index: _props.index,
          categoryId: _props.listId,
          id: _props.data.id,
        });
      }}
      data-card-type="show-card"
      data-movie={_props.data.id}
      data-index={_props.index}
      data-category={_props.listId}
    >
      <div
        ref={ref}
        className={css({
          width: isActive
            ? (_props.width * 2).toString() + 'px'
            : _props.width.toString() + 'px',
          height: _props.height.toString() + 'px',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          transition: `all 400ms ${timingFunctions.expand}`,
          zIndex: isActive ? 1 : 0,
          userSelect: 'none',
          borderRadius: '8px',
          outline: '0px solid #FFF',
        })}
        tabIndex={0}
      >
        <div
          className={css({
            position: 'relative',
            width: '100%',
            height: '100%',
            borderRadius: '12px',
            overflow: 'hidden',
            backgroundColor: '#1a1a1a',
            cursor: 'pointer',
            boxShadow: isActive
              ? '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)'
              : '0 4px 12px rgba(0,0,0,0.15)',
            transition: `all 500ms ${timingFunctions.hover}`,
          })}
        >
          {/* Rating Badge - Always visible */}
          {movieData.rating && <RatingBadge rating={movieData.rating} />}

          {/* Movie Image with gradient overlay */}
          <MovieImage
            posterUrl={movieData.images.poster}
            hoverUrl={movieData.images.hover}
            isHovered={isActive}
            title={movieData.title}
            onLoad={handleHoverImageLoad}
          />

          {/* Detailed Overlay - Visible on hover */}
          <div
            className={css({
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              padding: '24px',
              opacity: isActive ? 1 : 0,
              transform: isActive ? 'translateY(0)' : 'translateY(20px)',
              transition: `all 450ms ${timingFunctions.rise}`,
              pointerEvents: isActive ? 'auto' : 'none',
              zIndex: 2,
            })}
          >
            {/* Tags */}
            <div
              className={css({
                display: 'flex',
                gap: '8px',
                marginBottom: '12px',
                flexWrap: 'wrap',
              })}
            >
              {[movieData.year, ...movieData.genres].map((tag, index) => (
                <Tag
                  key={tag}
                  tag={tag}
                  index={index}
                  isActive={isActive}
                  timingFunctions={timingFunctions}
                />
              ))}
            </div>

            <h3
              className={css({
                color: 'white',
                fontSize: '28px',
                fontWeight: 'bold',
                marginBottom: '12px',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              })}
            >
              {movieData.title}
            </h3>

            <p
              className={css({
                color: '#ffffff90',
                fontSize: '14px',
                lineHeight: '1.6',
                marginBottom: '16px',
                display: '-webkit-box',
                WebkitLineClamp: '3',
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              })}
            >
              {movieData.description}
            </p>

            <div className={css({ marginBottom: '20px' })}>
              <div
                className={css({
                  color: '#ffffff80',
                  fontSize: '14px',
                })}
              >
                <span className={css({ color: '#ffffff' })}>Cast:</span>{' '}
                {movieData.castMembers.map((actor, index) => (
                  <CastMember
                    key={actor.id}
                    actor={actor}
                    isLast={index === movieData.castMembers.length - 1}
                  />
                ))}
              </div>
            </div>

            <ActionButtons
              isActive={isActive}
              timingFunctions={timingFunctions}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

export default MovieCardLarge;
