import TopBar from '@/features/common/components/TopBar';
import { useStyletron } from 'baseui';
import { useContext, useEffect, useMemo } from 'react';
import HorizontalWindowList from '@/features/listing/components/ShowListContainer';
import { AddonContext } from '@/features/addon/providers/AddonContext.ts';
import { useAtom } from 'jotai/index';
import { tileViewAtom } from '@/features/listing/atoms/tiles-view.ts';
import { activeTitle } from '@/features/listing/atoms/active-title.ts';
import { videoInfoDialog } from '@/features/listing/atoms/video-info-dialog.ts';

function App() {
  const [css, $theme] = useStyletron();

  const [active] = useAtom(activeTitle);
  const [, setValue] = useAtom(videoInfoDialog);

  useEffect(() => {
    const keyUp = (ev: KeyboardEvent) => {
      if (ev.key === 'Enter' && active) {
        ev.preventDefault();
        setValue(active.data);
      }
    };

    document.addEventListener('keyup', keyUp);
    return () => {
      document.removeEventListener('keyup', keyUp);
    };
  }, [active, setValue]);

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

  return (
    <div
      onWheel={() => {
        if (view === 'hidden') {
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
  const addons = useContext(AddonContext);

  const catalog = useMemo(() => {
    return addons.map((res) => res.loadCatalog()).flat();
  }, [addons]);

  return <HorizontalWindowList items={catalog} />;
};

export default App;
