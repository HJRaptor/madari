import { atom } from 'jotai';

export const AppSizing = atom<{
  cardHeight: number;
  cardWidth: number;
}>({
  cardHeight: 120,
  cardWidth: 220,
});
