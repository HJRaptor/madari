import { useStyletron } from 'baseui';
import { NavigationRouteData } from '@/features/common/components/TopBar/routes.data.tsx';
import { Button } from 'baseui/button';
import { ButtonGroup } from 'baseui/button-group';
import { Search } from 'baseui/icon';
import SearchBox from '@/features/common/components/SearchBox';
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';

export default function TopBar() {
  const [css] = useStyletron();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => {
    buttonRefs.current = buttonRefs.current.slice(
      0,
      NavigationRouteData.length + 1,
    );
  }, []);

  useLayoutEffect(() => {
    buttonRefs.current[0]?.focus();
  }, []);

  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  const location = useLocation();

  const firstMatch = useMemo(() => {
    return NavigationRouteData.map((item) => {
      const url = new URL(
        window.location.protocol + '//' + window.location.hostname + item.key,
      );

      const matchAllQueryParams = Array.from(url.searchParams.keys()).every(
        (res) => {
          return searchParams.get(res) === url.searchParams.get(res);
        },
      );

      const isPathNameMatch = url.pathname === location.pathname;

      if (matchAllQueryParams && url.searchParams.size !== 0) {
        return {
          priority: 2,
          key: item.key,
        };
      }

      return {
        key: item.key,
        priority: isPathNameMatch ? 1 : 0,
      };
    }).sort((res1, res2) => res2.priority - res1.priority)[0];
  }, [location.pathname, searchParams]);

  return (
    <>
      <SearchBox
        isActive={isSearchOpen}
        onClose={() => {
          setIsSearchOpen(false);
        }}
      />

      <div
        data-test="app-top-bar"
        className={css({
          height: '96px',
          position: 'fixed',
          width: '100%',
          top: 0,
          zIndex: 5,
        })}
      >
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            gap: '12px',
          })}
        >
          <Button
            size="compact"
            ref={(el: never) => (buttonRefs.current[0] = el)}
            shape="pill"
            onClick={() => {
              setIsSearchOpen(true);
            }}
          >
            <Search size={28} />
          </Button>
          <ButtonGroup shape="pill" kind="secondary">
            {NavigationRouteData.map((item, index) => {
              return (
                <Button
                  onClick={() => {
                    navigate(item.key);
                  }}
                  isSelected={firstMatch?.key === item.key}
                  startEnhancer={item.icon}
                  key={item.key}
                  ref={(el: never) => (buttonRefs.current[index + 1] = el)}
                >
                  {item.title}
                </Button>
              );
            })}
          </ButtonGroup>
        </div>
      </div>
    </>
  );
}
