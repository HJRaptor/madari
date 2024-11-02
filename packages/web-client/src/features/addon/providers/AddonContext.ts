import React from 'react';
import { Addon } from '@/features/addon/service/Addon.tsx';

export const AddonContext = React.createContext<Addon[]>([]);
