import {
  ListChildComponentProps,
  VariableSizeList as List,
} from 'react-window';
import { styled } from 'baseui';
import {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAtom } from 'jotai/index';
import { tileViewAtom } from '@/features/listing/atoms/tiles-view.ts';
import { AddonContext } from '@/features/addon/providers/AddonContext.ts';
import { activeTitle } from '@/features/listing/atoms/active-title.ts';
import { useQuery } from '@tanstack/react-query';
import { MovieInfo } from '@/features/addon/service/Addon.tsx';
import { HeadingMedium } from 'baseui/typography';
import { Button } from 'baseui/button';
import { FormattedMessage } from 'react-intl';
import ListRenderer from '@/features/listing/components/ListRenderer';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

const PADDING_X = 24;

const ItemContainer = styled('div', {
  width: '100%',
  padding: '16px 2',
  margin: '12px 0',
  transform: 'translate3d(0, 0, 0)', // Force GPU acceleration
  willChange: 'transform', // Hint to browser about animations
});

const HeaderContainer = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '16px',
});

interface Item {
  id: string;
  order?: number;
  title: string;
  url: string;
}

const ItemRenderer = memo(
  ({ index, style, data: _data }: ItemRendererProps) => {
    const item = _data.items[index];
    const prevItem: Item | undefined = _data.items[index - 1];
    const nextItem: Item | undefined = _data.items[index + 1];

    const navigate = useNavigate();

    const handleViewAll = useCallback(() => {
      navigate(`/discover/${item.id}`);
    }, [item.id, navigate]);

    const modifiedStyle = {
      ...style,
      left: `${PADDING_X}px`,
      width: `calc(100% - ${PADDING_X * 2}px - 24px)`,
    };

    const { data } = useQuery({
      queryFn: () => {
        return fetch(item.url)
          .then((docs) => docs.json())
          .then((docs: { metas: MovieInfo[] }) => {
            return docs.metas;
          });
      },
      queryKey: ['query', item.id],
    });

    return (
      <ItemContainer style={modifiedStyle}>
        <HeaderContainer>
          <HeadingMedium marginTop="scale200" marginBottom="0">
            {item.title}
          </HeadingMedium>
          <Button kind="tertiary" onClick={handleViewAll}>
            <FormattedMessage defaultMessage="View all" />
          </Button>
        </HeaderContainer>
        <ListRenderer
          data={data}
          listId={item.id}
          next={nextItem?.id}
          prev={prevItem?.id}
        />
      </ItemContainer>
    );
  },
);

ItemRenderer.displayName = 'ItemRenderer';

interface ItemRendererProps extends ListChildComponentProps {
  data: {
    items: Item[];
    onViewAll?: (item: Item) => void;
  };
}

const ScrollContainer = styled('div', {
  '::-webkit-scrollbar': { width: '6px' },
  '::-webkit-scrollbar-track': { background: 'transparent' },
  '::-webkit-scrollbar-thumb': {
    background: '#888',
    borderRadius: '3px',
    '&:hover': { background: '#666' },
  },
  // Add Firefox scrollbar styles
  scrollbarWidth: 'thin',
  height: '100%',
  scrollbarColor: '#888 transparent',
});
const OVERSCAN_COUNT = 1;
const ITEM_HEIGHT = 280 + 48; // Fixed height for better performance

interface Dimensions {
  width: number;
  height: number;
}

// Styled components with performance optimizations
const Container = styled('div', {
  width: 'calc(100% - 36px - 36px - 36px- 36px - 36px)',
  height: '100%',
  paddingLeft: '36px',
  paddingRight: '36px',
  position: 'relative',
  contain: 'strict', // CSS containment for better performance
});

export default function HomePage() {
  const addons = useContext(AddonContext);
  const [atom] = useAtom(activeTitle);
  const [, setTileView] = useAtom(tileViewAtom);

  useEffect(() => {
    setTileView((prev) => {
      if (prev === 'full') {
        return prev;
      }
      return 'medium';
    });
  }, [setTileView]);

  const [searchParams] = useSearchParams();

  const path = useLocation();

  const items_ = useMemo(() => {
    if (path.pathname.startsWith('/search')) {
      return addons
        .map((res) => res.search(searchParams.get('q') ?? ''))
        .flat();
    }

    return addons.map((res) => res.loadCatalog()).flat();
  }, [addons, path.pathname, searchParams]);

  const types = searchParams.getAll('type');

  const items = useMemo(() => {
    return items_.filter((item) => {
      return types.indexOf(item.type) !== -1 || types.length === 0;
    });
  }, [items_, types]);

  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<List>(null);
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: 0,
    height: 0,
  });

  // Memoized dimension update handler
  const updateDimensions = useCallback(() => {
    if (containerRef.current) {
      const { offsetWidth, offsetHeight } = containerRef.current;
      setDimensions((prev) => {
        // Only update if dimensions actually changed
        if (prev.width !== offsetWidth || prev.height !== offsetHeight) {
          return { width: offsetWidth, height: offsetHeight };
        }
        return prev;
      });
    }
  }, []);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(updateDimensions);
    const currentContainer = containerRef.current;

    if (currentContainer) {
      resizeObserver.observe(currentContainer);
      updateDimensions(); // Initial measurement
    }

    return () => {
      if (currentContainer) {
        resizeObserver.unobserve(currentContainer);
      }
      resizeObserver.disconnect();
    };
  }, [updateDimensions]);

  // Memoized item size getter
  const getItemSize = useCallback(() => ITEM_HEIGHT, []);

  useEffect(() => {
    const index = items.findIndex((item) => item.id === atom?.categoryId);

    if (index === -1) {
      return;
    }

    listRef.current?.scrollToItem(index, 'start');
  }, [atom?.categoryId, atom?.index, items]);

  // Don't render until we have dimensions
  if (dimensions.width === 0 || dimensions.height === 0) {
    return <Container ref={containerRef} />;
  }

  return (
    <Container ref={containerRef}>
      <ScrollContainer
        onWheel={() => {
          setTileView('full');
        }}
      >
        <List
          className="custom-scrollbar"
          ref={listRef}
          height={dimensions.height}
          itemCount={items.length}
          itemSize={getItemSize}
          width={dimensions.width}
          overscanCount={OVERSCAN_COUNT}
          itemData={{ items, onViewAll: () => {} }}
        >
          {ItemRenderer}
        </List>
      </ScrollContainer>
    </Container>
  );
}
