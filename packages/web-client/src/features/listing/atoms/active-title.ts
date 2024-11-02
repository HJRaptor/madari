import { atom } from 'jotai';

export const activeTitle = atom<
  | {
      categoryId: string;
      index: number;
      id?: string;
    }
  | undefined
  | null
>(null);
