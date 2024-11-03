import React, { memo, useEffect, useMemo, useRef } from 'react';
import { useStyletron } from 'baseui';
import { useAtom, useAtomValue } from 'jotai';
import { tileViewAtom } from '@/features/listing/atoms/tiles-view.ts';
import { StyleObject } from 'styletron-react';
import VisualViewer from '@/features/visual/components';
import { videoStateAtom } from '@/features/video/atom/video-state.ts';
import { Outlet, useLocation } from 'react-router-dom';

const VerticalWindowList: React.FC = () => {
  const [css] = useStyletron();
  const [tileView, setTileView] = useAtom(tileViewAtom);

  const timeout = useRef<null | number>();

  const video = useAtomValue(videoStateAtom);

  useEffect(() => {
    if (timeout.current) {
      clearTimeout(timeout.current);
      timeout.current = null;
    }
    if (video.isPlaying) {
      timeout.current = setTimeout(() => {
        setTileView((prev) => {
          if (prev === 'medium') {
            return 'hidden';
          }

          return prev;
        });
      }, 15_000) as unknown as number;

      return () => {
        if (timeout.current) {
          clearTimeout(timeout.current);
        }
      };
    }
  }, [video.isPlaying, video.videoUrl, setTileView]);

  const path = useLocation();

  const transformCss: StyleObject = useMemo(() => {
    switch (tileView) {
      case 'hidden':
        if (path.pathname.startsWith('/info')) {
          return {
            transform: 'translateY(min(34vh, calc(100vh - 420px)))',
          };
        }
        return {
          transform: 'translateY(calc(100vh - 420px))',
        };
      case 'medium':
        return {
          transform: 'translateY(min(34vh, calc(100vh - 820px)))',
        };
      case 'full':
        return {
          transform: 'translateY(0)',
        };
    }

    return {
      height: '100%',
      transform: 'transformY(0)',
    };
  }, [path.pathname, tileView]);

  const [view, setView] = useAtom(tileViewAtom);

  return (
    <div
      data-testid="show-list-container"
      onWheel={() => {
        if (view === 'hidden') {
          setView('medium');
        }
      }}
      data-card-type="main-list-wrapper"
      className={css({
        width: '100%',
        height: 'calc(100vh - 96px)',
        marginTop: '96px',
        transitionProperty: 'all',
        transitionDuration: '300ms',
        transitionTimingFunction: 'cubic-bezier(0.26, 0.54, 0.32, 1)',
        ...transformCss,
      })}
    >
      <VisualViewer />
      <Outlet />
    </div>
  );
};

export default memo(VerticalWindowList);
