import { atom } from 'jotai';
import { MovieInfo } from '@/features/addon/service/Addon.tsx';

export const videoInfoDialog = atom<MovieInfo | null>(null);
