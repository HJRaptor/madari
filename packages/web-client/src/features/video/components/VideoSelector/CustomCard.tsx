import { styled } from 'baseui';

export const CustomCard = styled('div', {
  background: '#181818',
  borderRadius: '4px',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  ':hover': {
    transform: 'scale(1.02)',
    boxShadow: '0 0 15px rgba(0,0,0,0.3)',
  },
});

export const StreamContainer = styled('div', {
  maxHeight: '500px',
  overflowY: 'auto',
  paddingTop: '12px',
});

export const StreamCard = styled('div', {
  backgroundColor: 'rgba(47, 47, 47, 0.8)',
  borderRadius: '8px',
  marginBottom: '16px',
  padding: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  transition: 'transform 0.2s, background-color 0.2s',
  ':hover': {
    backgroundColor: 'rgba(63, 63, 63, 0.9)',
  },
});

export const QualityBadge = styled('span', {
  backgroundColor: '#E50914',
  color: 'white',
  padding: '4px 12px',
  borderRadius: '16px',
  fontSize: '14px',
  fontWeight: 'bold',
});

export const ProviderInfo = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: '#999',
});

export const StreamInfo = styled('div', {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
});

export const TabContainer = styled('div', {
  display: 'flex',
  gap: '8px',
  marginBottom: '24px',
  overflowX: 'auto',
  padding: '8px 4px',
});

export const SeasonTab = styled<'button', { $active?: boolean }>(
  'button',
  (props) => ({
    backgroundColor: props.$active ? '#E50914' : 'rgba(255, 255, 255, 0.1)',
    color: 'white',
    border: 'none',
    borderRadius: '20px',
    padding: '8px 20px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: props.$active ? '#F40612' : 'rgba(255, 255, 255, 0.2)',
    },
  }),
);
