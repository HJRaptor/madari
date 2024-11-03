import TopBar from '@/features/common/components/TopBar';
import { useStyletron } from 'baseui';
import { useEffect } from 'react';
import HorizontalWindowList from '@/features/listing/components/ShowListContainer';
import { useAtom } from 'jotai/index';
import { tileViewAtom } from '@/features/listing/atoms/tiles-view.ts';
import { useLocation } from 'react-router-dom';

function App() {
  const [css, $theme] = useStyletron();

  // const [active, setActive] = useAtom(activeTitle);
  // const navigate = useNavigate();
  // const [, setTileView] = useAtom(tileViewAtom);

  // const { pathname } = useLocation();

  // useEffect(() => {
  //   const keyUp = (ev: KeyboardEvent) => {
  //     if (ev.key === 'Enter' && active && !pathname.startsWith('/info')) {
  //       ev.preventDefault();
  //       setTileView('hidden');
  //       navigate(`/info/${active.data.type}/${active.data.id}`);
  //     }
  //   };
  //
  //   document.addEventListener('keyup', keyUp);
  //   return () => {
  //     document.removeEventListener('keyup', keyUp);
  //   };
  // }, [active, navigate, pathname, setActive, setTileView]);

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
      <TopBar />

      <ShowRenderer />
    </div>
  );
}

const ShowRenderer = () => {
  return <HorizontalWindowList />;
};

export default App;
