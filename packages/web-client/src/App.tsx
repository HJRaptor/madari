import { useStyletron } from 'baseui';
import { useEffect } from 'react';
import { useAtom } from 'jotai/index';
import { tileViewAtom } from '@/features/listing/atoms/tiles-view.ts';
import { Outlet, useLocation } from 'react-router-dom';

function App() {
  const [css, $theme] = useStyletron();

  useEffect(() => {
    const classForBody = css({
      backgroundColor: $theme.colors.backgroundPrimary,
      color: $theme.colors.primaryA,
      fontFamily: $theme.typography.font450.fontFamily,
    });

    document.body.classList.add(...classForBody.split(' '));

    return () => {
      document.body.classList.remove(...classForBody.split(' '));
    };
  }, [
    $theme.colors.backgroundPrimary,
    $theme.colors.primaryA,
    $theme.typography.font450.fontFamily,
    css,
  ]);

  const [view, setView] = useAtom(tileViewAtom);
  const { pathname } = useLocation();

  if (pathname.startsWith('/player')) {
    return <Outlet />;
  }

  return (
    <div
      onWheel={() => {
        if (view === 'hidden') {
          setView('medium');
        }
      }}
      onMouseMove={() => {
        if (view === 'hidden' && pathname === '/') {
          setView('medium');
        }
      }}
      className={css({
        height: '100%',
        zIndex: 11,
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        background: `linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(0,0,0,.5) 30%, transparent 100%)`,
      })}
    >
      <Outlet />
    </div>
  );
}

export default App;
