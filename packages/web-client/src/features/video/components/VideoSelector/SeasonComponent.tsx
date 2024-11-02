import React from 'react';
import {
  ProviderInfo,
  QualityBadge,
  SeasonTab,
  StreamCard,
  StreamContainer,
  StreamInfo,
  TabContainer,
} from '@/features/video/components/VideoSelector/CustomCard.tsx';
import { Stream } from '@/features/video/components/VideoSelector/types.ts';
import { useNavigate } from 'react-router-dom';
import { Modal, ModalBody, ROLE, SIZE } from 'baseui/modal';
import { Award, Database, Play } from 'lucide-react';
import { Button } from 'baseui/button';

interface SeasonTabsProps {
  seasons: Array<{ id: number; seasonNumber: number }>;
  selectedSeason: number;
  onSelect: (seasonId: number) => void;
}

export const SeasonTabs: React.FC<SeasonTabsProps> = ({
  seasons,
  selectedSeason,
  onSelect,
}) => (
  <TabContainer>
    {seasons.map((season) => (
      <SeasonTab
        key={season.id}
        $active={season.id === selectedSeason}
        onClick={() => {
          onSelect(season.id);
        }}
      >
        Season {season.seasonNumber}
      </SeasonTab>
    ))}
  </TabContainer>
);

interface StreamListProps {
  isOpen: boolean;
  onClose: () => void;
  streams: Stream[];
  title?: string;
}

export const StreamList: React.FC<StreamListProps> = ({
  isOpen,
  onClose,
  streams,
  title,
}) => {
  const navigate = useNavigate();

  const handleStreamSelect = (stream: Stream) => {
    navigate(`/watch?streamUrl=${encodeURIComponent(stream.url)}`);
  };

  const getQualityColor = (quality: string): string => {
    if (quality.includes('4K')) return '#E50914';
    if (quality.includes('1080p')) return '#00C853';
    return '#FFB300';
  };

  return (
    <Modal
      onClose={onClose}
      isOpen={isOpen}
      size={SIZE.default}
      role={ROLE.dialog}
      overrides={{
        Dialog: {
          style: {
            backgroundColor: '#181818',
            width: '600px',
          },
        },
      }}
    >
      <ModalBody>
        {title && (
          <h2 style={{ color: 'white', marginBottom: '20px' }}>{title}</h2>
        )}
        <StreamContainer>
          {streams.map((stream) => (
            <StreamCard key={stream.id}>
              <StreamInfo>
                <QualityBadge
                  style={{
                    backgroundColor: getQualityColor(stream.quality),
                  }}
                >
                  {stream.quality}
                </QualityBadge>
                <ProviderInfo>
                  <Database size={16} />
                  {stream.provider}
                  {stream.quality.includes('4K') && (
                    <>
                      <Award size={16} />
                      Premium
                    </>
                  )}
                </ProviderInfo>
              </StreamInfo>
              <Button
                onClick={() => {
                  handleStreamSelect(stream);
                }}
                startEnhancer={<Play size={24} />}
              >
                Play
              </Button>
            </StreamCard>
          ))}
        </StreamContainer>
      </ModalBody>
    </Modal>
  );
};
