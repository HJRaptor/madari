import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  ListChildComponentProps,
  VariableSizeList as List,
} from 'react-window';
import { styled, useStyletron } from 'baseui';
import { HeadingMedium } from 'baseui/typography';
import { Button } from 'baseui/button';
import { FormattedMessage } from 'react-intl';
import ListRenderer from '@/features/listing/components/ListRenderer';
import { useQuery } from '@tanstack/react-query';
import { MovieInfo } from '@/features/addon/service/Addon.tsx';
import { useAtom } from 'jotai';
import { activeTitle } from '@/features/listing/atoms/active-title.ts';

interface Item {
  id: string;
  order?: number;
  title: string;
  url: string;
}

interface VerticalWindowListProps {
  items: Item[];
  onViewAll?: (item: Item) => void;
}

interface ItemRendererProps extends ListChildComponentProps {
  data: {
    items: Item[];
    onViewAll?: (item: Item) => void;
  };
}

interface Dimensions {
  width: number;
  height: number;
}

const ITEM_HEIGHT = 280 + 48; // Fixed height for better performance
const PADDING_X = 24;
const OVERSCAN_COUNT = 1;

// Styled components with performance optimizations
const Container = styled('div', {
  width: '100%',
  height: '100%',
  position: 'relative',
  contain: 'strict', // CSS containment for better performance
});

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

// Memoized item renderer for better performance
const ItemRenderer = memo(
  ({ index, style, data: _data }: ItemRendererProps) => {
    const item = _data.items[index];
    const prevItem: Item | undefined = _data.items[index - 1];
    const nextItem: Item | undefined = _data.items[index + 1];

    const handleViewAll = useCallback(() => {
      _data.onViewAll?.(item);
    }, [_data, item]);

    const modifiedStyle = {
      ...style,
      left: `${PADDING_X}px`,
      width: `calc(100% - ${PADDING_X * 2}px)`,
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

// Main component with performance optimizations
const VerticalWindowList: React.FC<VerticalWindowListProps> = ({
  items,
  onViewAll,
}) => {
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

  // Optimized resize observer setup
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

  const [atom, setAtom] = useAtom(activeTitle);

  useEffect(() => {
    const index = items.findIndex((item) => item.id === atom?.categoryId);

    if (index === -1) {
      return;
    }

    listRef.current?.scrollToItem(index, 'start');
  }, [atom?.categoryId, atom?.index, items]);

  const [css] = useStyletron();

  // Don't render until we have dimensions
  if (dimensions.width === 0 || dimensions.height === 0) {
    return <Container ref={containerRef} />;
  }

  return (
    <div
      onBlur={() => {
        setAtom(undefined);
      }}
      data-card-type="main-list-wrapper"
      className={css({
        height: '100%',
        width: '100%',
      })}
    >
      <Container ref={containerRef}>
        <ScrollContainer
          onWheel={() => {
            setAtom(null);
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
            itemData={{ items, onViewAll }}
          >
            {ItemRenderer}
          </List>
        </ScrollContainer>
      </Container>
    </div>
  );
};

export default memo(VerticalWindowList);
