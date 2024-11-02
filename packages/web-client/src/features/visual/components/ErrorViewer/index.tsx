import { useStyletron } from 'baseui';
import {
  AlertTriangle,
  Database,
  RefreshCcw,
  Server,
  Wifi,
} from 'lucide-react';
import { Button } from 'baseui/button';

export interface ErrorProps {
  error?: Error;
  retry?: () => void;
  type?: 'network' | 'data' | 'server' | 'generic';
}

export function ErrorView({ error, retry, type = 'generic' }: ErrorProps) {
  const [css, theme] = useStyletron();

  const containerStyles = css({
    position: 'relative',
    height: '85vh',
    width: '100%',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#141414',
    color: theme.colors.primaryA,
    padding: theme.sizing.scale800,
  });

  const overlayStyles = css({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `radial-gradient(
      circle at center,
      rgba(30, 30, 30, 0.8) 0%,
      rgba(20, 20, 20, 0.95) 100%
    )`,
    zIndex: 1,
  });

  const contentStyles = css({
    position: 'relative',
    zIndex: 2,
    textAlign: 'center',
    animation: 'fadeInScale 0.5s ease-out forwards',
  });

  const iconContainerStyles = css({
    marginBottom: theme.sizing.scale800,
    animation: 'pulse 2s ease-in-out infinite',
  });

  const titleStyles = css({
    fontSize: theme.typography.HeadingXLarge.fontSize,
    fontWeight: 'bold',
    marginBottom: theme.sizing.scale600,
    background:
      'linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0.8) 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  });

  const messageStyles = css({
    fontSize: theme.typography.ParagraphLarge.fontSize,
    marginBottom: theme.sizing.scale800,
    color: theme.colors.contentSecondary,
    maxWidth: '500px',
  });

  const getErrorContent = () => {
    switch (type) {
      case 'network':
        return {
          icon: <Wifi size={48} />,
          title: 'Connection Error',
          message:
            "We're having trouble connecting to our servers. Please check your internet connection and try again.",
        };
      case 'data':
        return {
          icon: <Database size={48} />,
          title: 'Data Unavailable',
          message:
            "We couldn't load the content you requested. The data might be temporarily unavailable.",
        };
      case 'server':
        return {
          icon: <Server size={48} />,
          title: 'Server Error',
          message:
            'Our servers are experiencing some issues. Our team has been notified and is working on a fix.',
        };
      default:
        return {
          icon: <AlertTriangle size={48} />,
          title: 'Something Went Wrong',
          message:
            error?.message ||
            'An unexpected error occurred while loading the content. Please try again.',
        };
    }
  };

  const { icon, title, message } = getErrorContent();

  return (
    <div className={containerStyles}>
      <div className={overlayStyles} />

      <div className={contentStyles}>
        <div className={iconContainerStyles}>{icon}</div>

        <h1 className={titleStyles}>{title}</h1>
        <p className={messageStyles}>{message}</p>

        {retry && (
          <Button
            onClick={retry}
            startEnhancer={() => <RefreshCcw size={20} />}
            overrides={{
              BaseButton: {
                style: {
                  backgroundColor: theme.colors.contentAccent,
                  color: theme.colors.primaryA,
                  paddingLeft: '24px',
                  paddingRight: '24px',
                  paddingTop: '12px',
                  paddingBottom: '12px',
                  transition: 'all 0.2s ease-out',
                  ':hover': {
                    backgroundColor: theme.colors.contentAccent,
                    transform: 'scale(1.05)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  },
                },
              },
            }}
          >
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}
