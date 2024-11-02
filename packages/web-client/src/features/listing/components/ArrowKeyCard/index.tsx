import React, { HTMLAttributes, useEffect, useRef } from 'react';

interface ArrowKeyCardProps extends HTMLAttributes<HTMLDivElement> {
  onTop?: (div: HTMLDivElement, activeElement?: Element) => void;
  onRight?: (div: HTMLDivElement, activeElement?: Element) => void;
  onBottom?: (div: HTMLDivElement, activeElement?: Element) => void;
  onLeft?: (div: HTMLDivElement, activeElement?: Element) => void;
  children: React.ReactNode;
  isCurrent: boolean;
  className?: string;
}

export const ArrowKeyCard: React.FC<ArrowKeyCardProps> = ({
  onTop,
  onRight,
  onBottom,
  onLeft,
  children,
  isCurrent,
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = cardRef.current;
    if (!element) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle events if our element contains the active element
      if (!element.contains(document.activeElement) && !isCurrent) return;

      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          onTop?.(element, document.activeElement ?? undefined);
          break;
        case 'ArrowRight':
          event.preventDefault();
          onRight?.(element, document.activeElement ?? undefined);
          break;
        case 'ArrowDown':
          event.preventDefault();
          onBottom?.(element, document.activeElement ?? undefined);
          break;
        case 'ArrowLeft':
          event.preventDefault();
          onLeft?.(element, document.activeElement ?? undefined);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onTop, onRight, onBottom, onLeft, isCurrent]);

  return (
    <div ref={cardRef} tabIndex={-1} {...props}>
      {children}
    </div>
  );
};

export default ArrowKeyCard;
