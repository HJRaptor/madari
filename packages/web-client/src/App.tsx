import TopBar from '@/features/common/components/TopBar';
import { useStyletron } from 'baseui';
import { useContext, useEffect, useMemo } from 'react';
import HorizontalWindowList from '@/features/listing/components/ShowListContainer';
import { AddonContext } from '@/features/addon/providers/AddonContext.ts';
import { VisualViewer } from '@/features/visual/components';
import { useAtom } from 'jotai/index';
import { activeTitle } from '@/features/listing/atoms/active-title.ts';

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

  const [, setAtom] = useAtom(activeTitle);

  return (
    <div
      className={css({
        backgroundColor: $theme.colors.backgroundPrimary,
        height: '100%',
      })}
    >
      <TopBar />
      <div
        className={css({
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        })}
      >
        <VisualViewer />
        <div
          className={css({
            position: 'relative',
            flexGrow: 1,
            minHeight: '400px',
            paddingLeft: '24px',
            paddingRight: '24px',
          })}
          onScroll={() => {
            setAtom(undefined);
          }}
          onWheel={() => {}}
        >
          <div
            className={css({
              position: 'absolute',
              top: '0',
              left: 0,
              right: 0,
              height: '12px',
              background: `linear-gradient(to bottom, ${$theme.colors.backgroundPrimary} 0%, ${$theme.colors.backgroundPrimary} 100%)`,
              zIndex: 10,
            })}
          ></div>
          <ShowRenderer />
        </div>
      </div>
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
