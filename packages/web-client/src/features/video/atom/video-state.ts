import { atom } from 'jotai';

export const videoStateAtom = atom<{
  isPlaying: boolean;
  videoUrl?: string;
  posterImage?: string;
  playerKind: 'full' | 'mini';
  type?: 'movie' | 'show';
  title?: string;
}>({
  isPlaying: false,
  playerKind: 'mini',
});
