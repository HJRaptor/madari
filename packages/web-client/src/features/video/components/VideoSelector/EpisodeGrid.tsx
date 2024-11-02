// components/EpisodeGrid.tsx
import React, { MouseEvent, useState } from 'react';
import { styled } from 'baseui';
import { Skeleton } from 'baseui/skeleton';
import { Clock, Info, Play } from 'lucide-react';
import { Video } from '@/features/addon/service/Addon.tsx';

const Grid = styled('div', {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: '12px',
  padding: '1px',
});

const Card = styled('div', {
  position: 'relative',
  backgroundColor: '#181818',
  overflow: 'hidden',
  cursor: 'pointer',
  borderRadius: '12px',
  transition: 'all 0.2s ease',
  ':hover': {
    backgroundColor: '#282828',
    '::before': {
      opacity: 1,
    },
  },
  '::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background:
      'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 60%)',
    opacity: 0.7,
    transition: 'opacity 0.3s ease',
    zIndex: 1,
  },
});

const ThumbnailContainer = styled('div', {
  position: 'relative',
  width: '100%',
  paddingTop: '56.25%', // 16:9 aspect ratio
  backgroundColor: '#141414',
});

const Thumbnail = styled('img', {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  transition: 'opacity 0.3s ease',
});

const ContentContainer = styled('div', {
  padding: '16px',
  display: 'flex',
  gap: '16px',
  alignItems: 'flex-start',
});

const EpisodeNumber = styled('div', {
  minWidth: '32px',
  fontSize: '24px',
  color: '#999',
  textAlign: 'center',
  marginTop: '12px',
});

const ContentDetails = styled('div', {
  flex: 1,
});

const PreviewContainer = styled('div', {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.9)',
  zIndex: 10,
  padding: '20px',
  opacity: 0,
  transform: 'translateY(20px)',
  transition: 'opacity 0.3s ease, transform 0.3s ease',
});

const ButtonOverlay = styled('div', {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 2,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '16px',
  opacity: 0,
  transition: 'opacity 0.3s ease',
  [':hover &']: {
    opacity: 1,
  },
});

const ActionButton = styled('button', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '12px 24px',
  borderRadius: '4px',
  border: 'none',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  color: 'white',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  ':hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});

const PlayButton = styled(ActionButton, {
  backgroundColor: '#E50914',
  ':hover': {
    backgroundColor: '#F40612',
  },
});

interface EpisodeCardProps {
  episode: Video;
  onClick: () => void;
}

const EpisodeCard: React.FC<EpisodeCardProps> = ({ episode, onClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  return (
    <Card>
      <ThumbnailContainer>
        {!imageLoaded && (
          <Skeleton
            animation
            height="100%"
            width="100%"
            overrides={{
              Root: {
                style: {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  backgroundColor: '#282828',
                },
              },
            }}
          />
        )}
        <Thumbnail
          src={episode.thumbnail}
          alt={episode.name}
          onLoad={() => {
            setImageLoaded(true);
          }}
          onError={() => {
            setImageLoaded(true);
          }}
          style={{ opacity: imageLoaded ? 1 : 0 }}
        />
        <ButtonOverlay>
          <PlayButton onClick={onClick}>
            <Play size={24} strokeWidth={1.5} />
            Play
          </PlayButton>
          <ActionButton
            onClick={(e: unknown) => {
              (e as MouseEvent).stopPropagation();
              setShowPreview(true);
            }}
          >
            <Info size={24} strokeWidth={1.5} />
          </ActionButton>
        </ButtonOverlay>
      </ThumbnailContainer>
      <ContentContainer>
        {!imageLoaded ? (
          <>
            <Skeleton
              animation
              height="24px"
              width="32px"
              overrides={{
                Root: {
                  style: {
                    backgroundColor: '#282828',
                  },
                },
              }}
            />
            <ContentDetails>
              <Skeleton
                animation
                height="16px"
                width="80%"
                overrides={{
                  Root: {
                    style: {
                      backgroundColor: '#282828',
                      marginBottom: '8px',
                    },
                  },
                }}
              />
              <Skeleton
                animation
                height="14px"
                width="40%"
                overrides={{
                  Root: {
                    style: {
                      backgroundColor: '#282828',
                    },
                  },
                }}
              />
            </ContentDetails>
          </>
        ) : (
          <>
            <EpisodeNumber>{episode.episode}</EpisodeNumber>
            <ContentDetails>
              <h3
                style={{
                  color: 'white',
                  margin: '0 0 8px 0',
                  fontSize: '16px',
                  fontWeight: 'normal',
                }}
              >
                {episode.name}
              </h3>
            </ContentDetails>
          </>
        )}
      </ContentContainer>
      <PreviewContainer
        onClick={(e: unknown) => {
          (e as MouseEvent).stopPropagation();
          setShowPreview(false);
        }}
        style={{
          opacity: showPreview ? 1 : 0,
          transform: showPreview ? 'translateY(0)' : 'translateY(20px)',
          pointerEvents: showPreview ? 'auto' : 'none',
        }}
      >
        <div>
          <h3
            style={{
              color: 'white',
              marginBottom: '12px',
            }}
          >
            {episode.name}
          </h3>
          <p
            style={{
              color: '#999',
              lineHeight: '1.6',
              fontSize: '14px',
            }}
          >
            {episode.description}
          </p>
          <div
            style={{
              marginTop: '20px',
              color: '#999',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Clock size={14} strokeWidth={1.5} />
            {episode.name}
          </div>
        </div>
      </PreviewContainer>
    </Card>
  );
};

interface EpisodeGridProps {
  episodes: Video[];
  onEpisodeSelect: (episode: Video) => void;
}

export const EpisodeGrid: React.FC<EpisodeGridProps> = ({
  episodes,
  onEpisodeSelect,
}) => {
  return (
    <Grid>
      {episodes.map((episode) => (
        <EpisodeCard
          key={episode.id}
          episode={episode}
          onClick={() => {
            onEpisodeSelect(episode);
          }}
        />
      ))}
    </Grid>
  );
};
