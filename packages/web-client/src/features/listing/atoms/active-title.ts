import { atom } from 'jotai';
import { withAtomEffect } from 'jotai-effect';
import { tileViewAtom } from '@/features/listing/atoms/tiles-view.ts';
import { MovieInfo } from '@/features/addon/service/Addon.tsx';
import { videoStateAtom } from '@/features/video/atom/video-state.ts';

export const activeTitle = withAtomEffect(
  atom<
    | ({
        categoryId: string;
        index: number;
        id?: string;
      } & {
        data: MovieInfo;
      })
    | undefined
    | null
  >(null),
  (get, set) => {
    const val = get(activeTitle);

    if (val && val.data) {
      set(tileViewAtom, 'medium');
      set(videoStateAtom, {
        isPlaying: true,
        playerKind: 'mini',
        videoUrl: `youtube/${val.data.trailers?.[0].source}`,
        posterImage: val.data.background,
        type: 'movie',
        title: val.data.name,
      });
    }
  },
);
