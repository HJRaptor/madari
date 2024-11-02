import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useStyletron } from 'baseui';
import { FixedSizeList, ListOnItemsRenderedProps } from 'react-window';
import { MovieInfo } from '@/features/addon/service/Addon';
import ArrowKeyCard from '@/features/listing/components/ArrowKeyCard';
import { debounce } from 'lodash';
import { useAtom } from 'jotai/index';
import { activeTitle } from '@/features/listing/atoms/active-title.ts';
import TvMovieCard from '@/features/listing/components/TvMovieCard';
import useDebounce from '@/features/common/hooks/use-debounce.ts';

interface ListRendererProps {
  gap?: number;
  data?: MovieInfo[];
  listId: string;
  itemWidth?: number;
  height?: number;
  prev?: string;
  next?: string;
  prevId?: string;
  nextId?: string;
}

interface ItemData {
  data: MovieInfo[];
  listId: string;
  gap: number;
}

const ListRenderer: React.FC<ListRendererProps> = ({
  gap = 16,
  data = [],
  listId,
  itemWidth = 180, // Default card width
  height = 240 + 24, // Default height including padding
}) => {
  const [css] = useStyletron();
  const listRef = useRef<FixedSizeList | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Calculate number of items that can be displayed at once
  const itemSize = itemWidth + gap;
  const itemCount = data.length;

  // Update container width on resize
  const updateWidth = useCallback(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, []);

  // Debounced resize handler
  const debouncedUpdateWidth = debounce(updateWidth, 100);

  useEffect(() => {
    updateWidth();
    window.addEventListener('resize', debouncedUpdateWidth);
    return () => {
      window.removeEventListener('resize', debouncedUpdateWidth);
      debouncedUpdateWidth.cancel();
    };
  }, [debouncedUpdateWidth, updateWidth]);

  // Memoized row renderer
  const Row = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => {
      const movie = data[index];
      return (
        <div
          style={{
            ...style,
            paddingLeft: index === 0 ? 0 : gap / 2,
            paddingRight: index === itemCount - 1 ? 0 : gap / 2,
          }}
        >
          <TvMovieCard
            width={itemWidth}
            height={height - 24}
            key={movie.id + index.toString()}
            listId={listId}
            index={index}
            data={movie}
          />
        </div>
      );
    },
    [data, gap, height, itemCount, itemWidth, listId],
  );

  // Handle scroll synchronization
  const handleItemsRendered = useCallback(
    ({}: ListOnItemsRenderedProps) => {},
    [],
  );

  const containerStyle = css({
    position: 'relative',
    width: '100%',
    // Prevent horizontal scroll bounce on Safari
    overscrollBehaviorX: 'contain',
  });

  const listStyle = css({
    outline: 'none',
    scrollBehavior: 'smooth',
    '::-webkit-scrollbar': {
      display: 'none',
    },
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
    WebkitOverflowScrolling: 'touch',
  });

  const [atom, setItem] = useAtom(activeTitle);

  const scrollTo = useDebounce(
    (index: number) => {
      listRef.current?.scrollToItem(index, 'start');
    },
    [],
    100,
  );

  return (
    <div ref={containerRef} className={containerStyle}>
      <ArrowKeyCard
        isCurrent={atom?.categoryId === listId}
        onRight={() => {
          setItem((prev) => {
            if (!prev) {
              return;
            }
            const index = 1 + prev.index;

            scrollTo(index);

            return {
              categoryId: listId,
              index,
              id: data[index]?.id,
              data: data[index],
            };
          });
        }}
        onLeft={() => {
          setItem((prev) => {
            if (!prev) {
              return;
            }

            const index = prev.index - 1 === -1 ? prev.index : prev.index - 1;

            requestAnimationFrame(() => {
              scrollTo(index);
            });

            return {
              categoryId: listId,
              id: data[index]?.id,
              index,
              data: data[index],
            };
          });
        }}
      >
        {containerWidth > 0 && (
          <FixedSizeList
            ref={listRef}
            className={listStyle}
            height={height}
            itemCount={itemCount}
            itemSize={itemSize}
            width={containerWidth}
            layout="horizontal"
            itemData={{ data, listId, gap } as ItemData}
            onItemsRendered={handleItemsRendered}
            overscanCount={2} // Number of items to render beyond visible area
          >
            {Row}
          </FixedSizeList>
        )}
      </ArrowKeyCard>
    </div>
  );
};

export default ListRenderer;
