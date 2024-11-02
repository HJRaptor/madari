import React, { useMemo } from 'react';
import { QueryKey, useSuspenseQueries } from '@tanstack/react-query';
import { fetchAddons } from '@/features/addon/hooks/use-fetch.tsx';
import { Addon } from '@/features/addon/service/Addon.tsx';
import { AddonContext } from '@/features/addon/providers/AddonContext.ts';

export interface AddonProvidersProps {
  children: React.JSX.Element;
  addons: string[];
}

export default function AddonProviders(props: AddonProvidersProps) {
  const data = useSuspenseQueries({
    queries: props.addons.map((item) => ({
      queryKey: ['addons', item] as QueryKey,
      queryFn: () => fetchAddons(item),
    })),
  });

  const addons = useMemo(() => {
    return data.map((res) => new Addon(res.data));
  }, [data]);

  return (
    <AddonContext.Provider value={addons}>
      {props.children}
    </AddonContext.Provider>
  );
}
