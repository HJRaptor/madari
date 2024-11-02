import React, { useMemo, useState } from 'react';
import { Modal, ModalBody, ROLE, SIZE } from 'baseui/modal';
import { Movie } from '@/features/video/components/VideoSelector/types.ts';
import { EpisodeGrid } from '@/features/video/components/VideoSelector/EpisodeGrid.tsx';
import { useAtomValue } from 'jotai';
import { videoInfoDialog } from '@/features/listing/atoms/video-info-dialog.ts';
import { Calendar } from 'lucide-react';
import {
  SeasonTab,
  TabContainer,
} from '@/features/video/components/VideoSelector/CustomCard.tsx';
import { Video } from '@/features/addon/service/Addon.tsx';
import { useStyletron } from 'baseui';

interface SeriesDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SeriesDialog: React.FC<SeriesDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const [css] = useStyletron();
  const info = useAtomValue(videoInfoDialog);
  const [selectedSeason, setSelectedSeason] = useState<number>(
    info?.videos?.[0]?.season ?? 1,
  );
  const [, setSelectedVideo] = useState<Video | null>(null);

  const seasons = useMemo(() => {
    const uniqueSeasons = Array.from(
      new Set(info?.videos?.map((v) => v.season)),
    ).sort((a, b) => a - b);
    return uniqueSeasons.map((season) => ({
      id: season.toString(),
      seasonNumber: season,
    }));
  }, [info?.videos]);

  const episodes = useMemo(() => {
    return info?.videos
      ?.filter((video) => video.season === selectedSeason)
      .sort((a, b) => a.episode - b.episode);
  }, [info?.videos, selectedSeason]);

  const handleEpisodeSelect = (video: Video) => {
    setSelectedVideo(video);
  };

  if (!info || info.type !== 'series') {
    return null;
  }

  return (
    <>
      <Modal
        onClose={onClose}
        isOpen={isOpen}
        size={SIZE.auto}
        role={ROLE.dialog}
        overrides={{
          Dialog: {
            style: {
              backgroundColor: '#181818',
              maxWidth: '1200px',
              width: '90vw',
            },
          },
        }}
      >
        <ModalBody>
          <div className={css({ padding: '20px' })}>
            <h1
              className={css({
                color: 'white',
                fontSize: '32px',
                marginBottom: '16px',
              })}
            >
              {info.name}
            </h1>
            <div
              className={css({
                display: 'flex',
                gap: '16px',
                marginBottom: '16px',
                color: '#999',
                fontSize: '14px',
              })}
            >
              {info.released && (
                <span
                  className={css({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  })}
                >
                  <Calendar size={14} />
                  {new Date(info.released).getFullYear()}
                </span>
              )}
              <span>{info.genre.join(' • ')}</span>
              {info.imdbRating && <span>IMDb: {info.imdbRating}</span>}
            </div>
            <p
              className={css({
                color: '#999',
                marginBottom: '24px',
              })}
            >
              {info.description}
            </p>

            <TabContainer>
              {seasons.map((season) => (
                <SeasonTab
                  key={season.id}
                  $active={selectedSeason === season.seasonNumber}
                  onClick={() => {
                    setSelectedSeason(season.seasonNumber);
                  }}
                >
                  Season {season.seasonNumber}
                </SeasonTab>
              ))}
            </TabContainer>

            <EpisodeGrid
              episodes={episodes ?? []}
              onEpisodeSelect={handleEpisodeSelect}
            />
          </div>
        </ModalBody>
      </Modal>
    </>
  );
};

interface MovieDialogProps {
  isOpen: boolean;
  onClose: () => void;
  movie: Movie;
}

export const MovieDialog: React.FC<MovieDialogProps> = ({
  isOpen,
  onClose,
}) => {
  const info = useAtomValue(videoInfoDialog);

  if (!info) {
    return null;
  }

  return (
    <Modal
      onClose={onClose}
      isOpen={isOpen}
      size={SIZE.auto}
      role={ROLE.dialog}
      overrides={{
        Dialog: {
          style: {
            maxWidth: '1000px',
            width: '90vw',
          },
        },
      }}
    >
      <ModalBody>
        <div style={{ position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(transparent, #181818)',
              height: '150px',
            }}
          />
        </div>
        <div style={{ padding: '20px' }}>
          <h1
            style={{ color: 'white', fontSize: '32px', marginBottom: '12px' }}
          >
            {info.name}
          </h1>

          <h2 style={{ color: '#888', marginBottom: '16px' }}>
            Available Streams
          </h2>
        </div>
      </ModalBody>
    </Modal>
  );
};
