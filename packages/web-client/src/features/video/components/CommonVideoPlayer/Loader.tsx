import { useStyletron } from 'baseui';
import { useEffect, useRef, useState } from 'react';

const LoaderComponent: React.FC<{ buffering: boolean }> = ({ buffering }) => {
  const [css] = useStyletron();
  const [show, setShow] = useState(false);
  const rotationRef = useRef(0);
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();

  useEffect(() => {
    if (buffering) {
      setShow(true);
    } else {
      const timeout = setTimeout(() => {
        setShow(false);
      }, 300); // Allow exit animation
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [buffering]);

  const animate = (time: number) => {
    if (previousTimeRef.current !== undefined) {
      rotationRef.current = (rotationRef.current + 1) % 360;
      if (spinnerRef.current) {
        spinnerRef.current.style.transform = `rotate(${rotationRef.current}deg)`;
      }
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (show) {
      requestRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [show]);

  const spinnerRef = useRef<HTMLDivElement>(null);

  const containerStyles = css({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    opacity: 0,
    transition: 'opacity 0.1s ease',
  });

  const spinnerContainerStyles = css({
    position: 'relative',
    width: '64px',
    height: '64px',
    transform: 'scale(0.5)',
    transition: 'transform 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
  });

  const spinnerStyles = css({
    position: 'absolute',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    border: '3px solid rgba(229, 9, 20, 0.2)',
    borderTop: '3px solid rgb(229, 9, 20)',
    borderRadius: '50%',
  });

  return show ? (
    <div
      data-type="buffer"
      className={containerStyles}
      style={{
        opacity: show ? 1 : 0,
      }}
    >
      <div
        className={spinnerContainerStyles}
        style={{
          transform: show ? 'scale(1)' : 'scale(0.5)',
        }}
      >
        <div ref={spinnerRef} className={spinnerStyles} />
      </div>
    </div>
  ) : null;
};

export default LoaderComponent;
