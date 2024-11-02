import { useStyletron } from 'baseui';

const ShimmerLoader = () => {
  const [css] = useStyletron();

  const shimmerContainerStyles = css({
    height: '300px',
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  });

  const contentStyles = css({
    position: 'absolute',
    bottom: '48px',
    left: '64px',
    right: '64px',
  });

  const shimmerBlockStyles = (
    width: string,
    height: string,
    margin: string = '0',
  ) =>
    css({
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      borderRadius: '4px',
      width,
      height,
      margin,
    });

  return (
    <div className={shimmerContainerStyles}>
      <div className={contentStyles}>
        <div
          className={css({
            display: 'flex',
            gap: '16px',
            marginBottom: '32px',
          })}
        >
          <div className={shimmerBlockStyles('120px', '40px')} />
          <div className={shimmerBlockStyles('120px', '40px')} />
        </div>
        <div className={shimmerBlockStyles('50%', '60px', '0 0 24px 0')} />
        <div className={shimmerBlockStyles('40%', '24px', '0 0 16px 0')} />
        <div className={shimmerBlockStyles('60%', '80px', '0 0 24px 0')} />
        <div
          className={css({ display: 'flex', gap: '8px', marginBottom: '32px' })}
        >
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={shimmerBlockStyles('80px', '32px')} />
          ))}
        </div>
        <div
          className={css({
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '32px',
          })}
        >
          <div>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={shimmerBlockStyles('100%', '20px', '0 0 16px 0')}
              />
            ))}
          </div>
          <div>
            {[1, 2].map((i) => (
              <div
                key={i}
                className={shimmerBlockStyles('100%', '24px', '0 0 24px 0')}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShimmerLoader;
