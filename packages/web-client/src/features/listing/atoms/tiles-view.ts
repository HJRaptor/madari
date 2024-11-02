import { atom } from 'jotai';
import { withAtomEffect } from 'jotai-effect';
import { videoStateAtom } from '@/features/video/atom/video-state.ts';

export const tileViewAtom = withAtomEffect(
  atom<'full' | 'medium' | 'hidden'>('full'),
  (_get, set) => {
    set(videoStateAtom, {
      isPlaying: false,
      playerKind: 'mini',
    });
  },
);
