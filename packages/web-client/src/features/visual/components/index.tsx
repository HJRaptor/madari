import React, { useCallback, useEffect, useState } from 'react';
import { useStyletron } from 'baseui';
import { useAtomValue } from 'jotai';
import { activeTitle } from '@/features/listing/atoms/active-title.ts';
import { useQuery } from '@tanstack/react-query';
import { Tag } from 'baseui/tag';
import { MovieInfo } from '@/features/addon/service/Addon.tsx';
import {
  Award,
  Calendar,
  Clock,
  Film,
  Flag,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import { debounce } from 'lodash';
import { ErrorView } from '@/features/visual/components/ErrorViewer';
import ShimmerLoader from '@/features/visual/components/Shimmer';

export function VisualViewer() {
  const [css, theme] = useStyletron();
  const currentValue = useAtomValue(activeTitle);
  const [value, setValue] = useState<typeof currentValue>(currentValue);

  // Create a memoized debounced function that persists across renders
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSetValue = useCallback(
    debounce((newValue: typeof currentValue) => {
      setValue(newValue);
    }, 500),
    [],
  );

  useEffect(() => {
    if (!value && currentValue && currentValue.id) {
      setValue(currentValue);
    }
  }, [currentValue, value]);

  useEffect(() => {
    if (currentValue && currentValue.id) {
      // Debounce the update if setting a new value
      debouncedSetValue(currentValue);
    }

    if (currentValue === null) {
      debouncedSetValue(null);
    }

    return () => {
      debouncedSetValue.cancel();
    };
  }, [currentValue, debouncedSetValue]);

  const { isLoading, data, error, refetch } = useQuery({
    queryKey: ['visual', value],
    queryFn: () => {
      if (!value) return Promise.resolve(null);

      return fetch(
        `https://v3-cinemeta.strem.io/meta/${value.categoryId.split('/')[1]}/${value.id}.json`,
      )
        .then((docs) => docs.json())
        .then((docs: { meta: MovieInfo }) => docs.meta);
    },
  });

  const containerStyles = css({
    position: 'relative',
    height: '300px',
    maxHeight:
      currentValue !== null && value !== undefined && data ? '100vh' : '0',
    opacity: currentValue !== null ? 1 : 0,
    transitionProperty: 'max-height, opacity',
    width: '100%',
    overflow: 'hidden',

    // Opening animation
    ...(currentValue !== null
      ? {
          transitionTimingFunction: 'cubic-bezier(0.0, 0.0, 0.2, 1)', // deceleration
          transitionDuration: '400ms',
          transitionDelay: '0ms',
        }
      : {
          // Closing animation
          transitionTimingFunction: 'cubic-bezier(0.4, 0.0, 1, 1)', // acceleration
          transitionDuration: '400ms',
          transitionDelay: '0ms',
        }),
  });

  const contentContainerStyles = css({
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '0 64px',
    color: theme.colors.primaryA,
    zIndex: 2,
    animation: 'slideUp 0.4s ease-out forwards',
  });

  const titleStyles = css({
    fontSize: '5rem',
    fontWeight: 'bold',
    letterSpacing: '-0.025em',
    marginTop: theme.sizing.scale0,
    marginBottom: theme.sizing.scale600,
    animation: 'slideUp 0.3s ease-out forwards',
    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
    background:
      'linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0.9) 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  });

  const metadataRowStyles = css({
    display: 'flex',
    alignItems: 'center',
    gap: theme.sizing.scale600,
    marginBottom: theme.sizing.scale600,
    fontSize: '1rem',
  });

  const metadataItemStyles = css({
    display: 'flex',
    alignItems: 'center',
    gap: theme.sizing.scale300,
  });

  const twoColumnLayoutStyles = css({
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: theme.sizing.scale800,
    marginBottom: theme.sizing.scale0,
  });

  const descriptionStyles = css({
    fontSize: '1.125rem',
    lineHeight: '1.75',
    opacity: 0.9,
    marginBottom: theme.sizing.scale600,
    display: '-webkit-box',
    WebkitLineClamp: '2',
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  });

  const genresContainerStyles = css({
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.sizing.scale300,
    marginBottom: theme.sizing.scale800,
  });

  const castGridStyles = css({
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: theme.sizing.scale600,
  });

  if (isLoading) {
    return <ShimmerLoader />;
  }

  if (error) {
    // Determine error type based on error instance
    let errorType: 'network' | 'data' | 'server' | 'generic' = 'generic';

    if (error instanceof TypeError && error.message.includes('network')) {
      errorType = 'network';
    } else if (error instanceof Response && error.status >= 500) {
      errorType = 'server';
    } else if (error instanceof Response && error.status === 404) {
      errorType = 'data';
    }

    return (
      <ErrorView
        error={error}
        retry={() => {
          refetch().catch((err: unknown) => {
            console.error(err);
          });
        }}
        type={errorType}
      />
    );
  }

  const metadata = data
    ? ([
        data.imdbRating && {
          icon: Star,
          text: `${data.imdbRating} Rating`,
          color: '#FFD700',
        },
        data.year && { icon: Calendar, text: data.year },
        data.runtime && { icon: Clock, text: data.runtime },
        data.country && { icon: Flag, text: data.country },
        data?.popularity && {
          icon: Sparkles,
          text: `${data?.popularity?.toFixed(1) || 'N/A'} Popularity`,
        },
      ].filter(Boolean) as unknown as {
        icon: React.FC<{ size: number | string }>;
        text: React.JSX.Element;
      }[])
    : [];

  return (
    <div className={containerStyles} data-type="visual-wier">
      {data ? (
        <>
          <div className={contentContainerStyles}>
            <h1 className={titleStyles}>{data.name}</h1>

            <div className={metadataRowStyles}>
              {metadata.map(({ icon: Icon, text }, index) => (
                <div key={index} className={metadataItemStyles}>
                  <Icon size={18} />
                  <span>{text}</span>
                </div>
              ))}
            </div>

            <div className={twoColumnLayoutStyles}>
              <div>
                <p className={descriptionStyles}>{data.description}</p>

                <div className={genresContainerStyles}>
                  {(data.genres ?? []).map((genre) => (
                    <Tag
                      key={genre}
                      kind="neutral"
                      closeable={false}
                      overrides={{
                        Root: {
                          style: {
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            marginRight: '8px',
                          },
                        },
                        Text: {
                          style: {
                            color: theme.colors.primaryA,
                          },
                        },
                      }}
                    >
                      {genre}
                    </Tag>
                  ))}
                </div>
              </div>

              <div>
                <div className={castGridStyles}>
                  <div>
                    <div
                      className={css({
                        display: 'flex',
                        alignItems: 'center',
                        gap: theme.sizing.scale300,
                        marginBottom: theme.sizing.scale300,
                      })}
                    >
                      <Users size={18} />
                      <span className={css({ fontWeight: 500 })}>Cast</span>
                    </div>
                    <div className={css({ opacity: 0.9 })}>
                      {data.cast?.slice(0, 4).join(', ')}
                    </div>
                  </div>

                  {data.director && data.director.length > 0 && (
                    <div>
                      <div
                        className={css({
                          display: 'flex',
                          alignItems: 'center',
                          gap: theme.sizing.scale300,
                          marginBottom: theme.sizing.scale300,
                        })}
                      >
                        <Film size={18} />
                        <span className={css({ fontWeight: 500 })}>
                          Director
                        </span>
                      </div>
                      <div className={css({ opacity: 0.9 })}>
                        {data.director.join(', ')}
                      </div>
                    </div>
                  )}
                </div>

                {data.writer && data.writer.length > 0 && (
                  <div className={css({ marginTop: theme.sizing.scale600 })}>
                    <div
                      className={css({
                        display: 'flex',
                        alignItems: 'center',
                        gap: theme.sizing.scale300,
                        marginBottom: theme.sizing.scale300,
                      })}
                    >
                      <Award size={18} />
                      <span className={css({ fontWeight: 500 })}>Writers</span>
                    </div>
                    <div className={css({ opacity: 0.9 })}>
                      {data.writer.join(', ')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <ShimmerLoader />
      )}
    </div>
  );
}

export default VisualViewer;
