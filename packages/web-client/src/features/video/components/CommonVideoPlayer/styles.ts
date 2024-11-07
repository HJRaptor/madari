// Styled Components
import { styled } from 'baseui';

export const Container = styled('div', {
  position: 'relative',
  width: '100vw',
  height: '100vh',
  backgroundColor: '#000',
  overflow: 'hidden',
});

export const VideoWrapper = styled('div', {
  position: 'relative',
  width: '100%',
  height: '100%',
});

export const Video = styled('video', {
  width: '100%',
  height: '100%',
  objectFit: 'contain',
});

export const ControlsOverlay = styled('div', {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background:
    'linear-gradient(0deg, rgba(0,0,0,0.7) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.7) 100%)',
  opacity: 1,
  transition: 'opacity 0.3s ease',
  padding: '24px',
});

export const TopBar = styled('div', {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  padding: '20px',
});

export const Title = styled('h1', {
  color: '#fff',
  margin: 0,
  fontSize: '24px',
  fontWeight: 600,
  textShadow: '0 2px 4px rgba(0,0,0,0.4)',
});

export const CenterControls = styled('div', {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  display: 'flex',
  alignItems: 'center',
  gap: '32px',
});

export const CenterButton = styled('button', {
  backgroundColor: 'rgba(0,0,0,0.6)',
  border: '2px solid rgba(255,255,255,0.7)',
  borderRadius: '50%',
  width: '56px',
  height: '56px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
});

export const PlayPauseButton = styled('button', {
  backgroundColor: 'rgba(0,0,0,0.6)',
  border: '2px solid rgba(255,255,255,0.7)',
  borderRadius: '50%',
  width: '72px',
  height: '72px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
});

export const BottomControls = styled('div', {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  padding: '20px',
});

export const ProgressBar = styled('div', {
  width: '100%',
  height: '4px',
  backgroundColor: 'rgba(255,255,255,0.3)',
  cursor: 'pointer',
  borderRadius: '2px',
  position: 'relative',
  marginBottom: '16px',
  transitionProperty: 'height',
  transitionDuration: '200ms',
  transitionTimingFunction: 'ease',
  ':hover': {
    height: '8px',
  },
});

export const BufferProgress = styled('div', {
  position: 'absolute',
  top: 0,
  left: 0,
  height: '100%',
  backgroundColor: 'rgba(255,255,255,0.5)',
  borderRadius: '2px',
});

export const CurrentProgress = styled('div', {
  position: 'absolute',
  top: 0,
  left: 0,
  height: '100%',
  backgroundColor: '#E50914',
  borderRadius: '2px',
});

export const Scrubber = styled('div', {
  position: 'absolute',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  width: '12px',
  height: '12px',
  backgroundColor: '#E50914',
  borderRadius: '50%',
});

export const ControlsRow = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const LeftControls = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '20px',
});

export const RightControls = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
});

export const IconButton = styled('button', {
  backgroundColor: 'transparent',
  border: 'none',
  color: '#fff',
  width: '40px',
  height: '40px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
});

export const VolumeControl = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

export const VolumeSlider = styled('input', {
  width: '0',
  transition: 'width 0.2s ease',
  cursor: 'pointer',
  appearance: 'none',
  background: 'rgba(255,255,255,0.2)',
  height: '4px',
  borderRadius: '2px',
  outline: 'none',
});

export const TimeDisplay = styled('span', {
  color: '#fff',
  fontSize: '14px',
  fontFamily: 'system-ui',
});

export const QualityMenu = styled('div', {
  position: 'absolute',
  bottom: '100%',
  right: '0',
  backgroundColor: 'rgba(20,20,20,0.98)',
  borderRadius: '4px',
  padding: '8px 0',
  minWidth: '240px',
  marginBottom: '8px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
});

export const QualityOption = styled('button', {
  backgroundColor: 'transparent',
  border: 'none',
  width: '100%',
  padding: '12px 16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  color: '#fff',
  fontSize: '14px',
  cursor: 'pointer',
});
