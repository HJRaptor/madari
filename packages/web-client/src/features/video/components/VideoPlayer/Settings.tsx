import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { useStyletron } from 'baseui';

interface Track {
  id: string;
  lang: string;
  label: string;
  roles?: string[];
}

interface SettingsMenuProps {
  availableQualities: Record<string, string>;
  audioTracks?: Track[];
  subtitleTracks?: Track[];
  setQuality: (quality: string) => void;
  setAudioTrack: (trackId: string) => void;
  setSubtitleTrack: (trackId: string) => void;
  showQualityMenu: boolean;
  onToggleMenu: () => void;
}

type MenuSection = 'main' | 'quality' | 'audio' | 'subtitles';

const SettingsMenu: React.FC<SettingsMenuProps> = ({
  availableQualities,
  audioTracks,
  subtitleTracks,
  setQuality,
  setAudioTrack,
  setSubtitleTrack,
  showQualityMenu,
  onToggleMenu,
}) => {
  const [css] = useStyletron();
  const [activeSection, setActiveSection] = useState<MenuSection>('main');
  const [selectedQuality, setSelectedQuality] = useState<string>(
    Object.values(availableQualities)[0] || '',
  );
  const [selectedAudio, setSelectedAudio] = useState<string>(
    audioTracks?.[0]?.id || '',
  );
  const [selectedSubtitle, setSelectedSubtitle] = useState<string>('off');

  const menuStyles = css({
    position: 'absolute',
    bottom: '60px',
    right: '16px',
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderRadius: '8px',
    minWidth: '280px',
    display: showQualityMenu ? 'flex' : 'none',
    flexDirection: 'column',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow:
      '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    zIndex: 1000,
    overflow: 'hidden',
  });

  const headerStyles = css({
    padding: '12px 16px',
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '16px',
    fontWeight: 500,
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  });

  const menuItemStyles = css({
    padding: '12px 16px',
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
  });

  const valueStyles = css({
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  });

  const backButtonStyles = css({
    background: 'none',
    border: 'none',
    padding: '8px',
    cursor: 'pointer',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    marginRight: '4px',
  });

  const iconButtonStyles = css({
    background: 'none',
    border: 'none',
    padding: '8px',
    cursor: 'pointer',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
  });

  const getQualityLabel = (value: string) => {
    return (
      Object.entries(availableQualities).find(([, v]) => v === value)?.[0] ||
      value
    );
  };

  const handleQualitySelect = (value: string) => {
    setSelectedQuality(value);
    setQuality(value);
    setActiveSection('main');
  };

  const handleAudioSelect = (id: string) => {
    setSelectedAudio(id);
    setAudioTrack(id);
    setActiveSection('main');
  };

  const handleSubtitleSelect = (id: string) => {
    setSelectedSubtitle(id);
    setSubtitleTrack(id === 'off' ? '' : id);
    setActiveSection('main');
  };

  const renderMainMenu = () => (
    <>
      <div className={headerStyles}>Settings</div>
      {availableQualities && Object.keys(availableQualities).length > 0 && (
        <div
          className={menuItemStyles}
          onClick={() => setActiveSection('quality')}
          role="button"
          tabIndex={0}
        >
          <span>Quality</span>
          <span className={valueStyles}>
            {getQualityLabel(selectedQuality)}
            <ChevronRight size={16} />
          </span>
        </div>
      )}
      {audioTracks && audioTracks.length > 0 && (
        <div
          className={menuItemStyles}
          onClick={() => setActiveSection('audio')}
          role="button"
          tabIndex={0}
        >
          <span>Audio</span>
          <span className={valueStyles}>
            {audioTracks.find((t) => t.id === selectedAudio)?.label ||
              'Default'}
            <ChevronRight size={16} />
          </span>
        </div>
      )}
      {subtitleTracks && subtitleTracks.length > 0 && (
        <div
          className={menuItemStyles}
          onClick={() => setActiveSection('subtitles')}
          role="button"
          tabIndex={0}
        >
          <span>Subtitles</span>
          <span className={valueStyles}>
            {selectedSubtitle === 'off'
              ? 'Off'
              : subtitleTracks.find((t) => t.id === selectedSubtitle)?.label ||
                'Default'}
            <ChevronRight size={16} />
          </span>
        </div>
      )}
    </>
  );

  const renderQualityMenu = () => (
    <>
      <div className={headerStyles}>
        <button
          onClick={() => setActiveSection('main')}
          className={backButtonStyles}
        >
          <ChevronLeft size={16} />
        </button>
        Quality
      </div>
      {Object.entries(availableQualities).map(([label, value]) => (
        <div
          key={value}
          className={menuItemStyles}
          onClick={() => handleQualitySelect(value)}
          role="button"
          tabIndex={0}
          style={{
            backgroundColor:
              selectedQuality === value
                ? 'rgba(255, 255, 255, 0.1)'
                : undefined,
          }}
        >
          <span>{label}</span>
          {value.includes('mbps') && (
            <span className={valueStyles}>
              {value.split('_')[1].replace('mbps', ' Mbps')}
            </span>
          )}
        </div>
      ))}
    </>
  );

  const renderAudioMenu = () => (
    <>
      <div className={headerStyles}>
        <button
          onClick={() => setActiveSection('main')}
          className={backButtonStyles}
        >
          <ChevronLeft size={16} />
        </button>
        Audio
      </div>
      {audioTracks?.map((track) => (
        <div
          key={track.id}
          className={menuItemStyles}
          onClick={() => handleAudioSelect(track.id)}
          role="button"
          tabIndex={0}
          style={{
            backgroundColor:
              selectedAudio === track.id
                ? 'rgba(255, 255, 255, 0.1)'
                : undefined,
          }}
        >
          {track.label || track.lang}
        </div>
      ))}
    </>
  );

  const renderSubtitlesMenu = () => (
    <>
      <div className={headerStyles}>
        <button
          onClick={() => setActiveSection('main')}
          className={backButtonStyles}
        >
          <ChevronLeft size={16} />
        </button>
        Subtitles
      </div>
      <div
        className={menuItemStyles}
        onClick={() => handleSubtitleSelect('off')}
        role="button"
        tabIndex={0}
        style={{
          backgroundColor:
            selectedSubtitle === 'off' ? 'rgba(255, 255, 255, 0.1)' : undefined,
        }}
      >
        Off
      </div>
      {subtitleTracks?.map((track) => (
        <div
          key={track.id}
          className={menuItemStyles}
          onClick={() => handleSubtitleSelect(track.id)}
          role="button"
          tabIndex={0}
          style={{
            backgroundColor:
              selectedSubtitle === track.id
                ? 'rgba(255, 255, 255, 0.1)'
                : undefined,
          }}
        >
          {track.label || track.lang}
        </div>
      ))}
    </>
  );

  return (
    <>
      <button
        onClick={onToggleMenu}
        className={iconButtonStyles}
        aria-label="Settings"
      >
        <Settings size={20} />
      </button>

      <div className={menuStyles}>
        {activeSection === 'main' && renderMainMenu()}
        {activeSection === 'quality' && renderQualityMenu()}
        {activeSection === 'audio' && renderAudioMenu()}
        {activeSection === 'subtitles' && renderSubtitlesMenu()}
      </div>
    </>
  );
};

export default SettingsMenu;
