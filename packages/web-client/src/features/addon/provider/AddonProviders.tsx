import React, { useMemo } from 'react';
import { QueryKey, useSuspenseQueries } from '@tanstack/react-query';
import { fetchAddons } from '@/features/addon/hooks/use-fetch.tsx';
import { Addon } from '@/features/addon/service/Addon.tsx';
import { AddonContext } from '@/features/addon/providers/AddonContext.ts';
import { useAtomValue } from 'jotai';
import { appSettingsAtom } from '@/atoms/app-settings.ts';

export interface AddonProvidersProps {
  children: React.JSX.Element;
}

export default function AddonProviders(props: AddonProvidersProps) {
  const { addons: addonsUrl } = useAtomValue(appSettingsAtom);

  const data = useSuspenseQueries({
    queries: addonsUrl.map((item) => ({
      queryKey: ['addons', item.url] as QueryKey,
      queryFn: async () => ({
        data: await fetchAddons(item.url),
        url: item.url,
      }),
    })),
  });

  const addons = useMemo(() => {
    return data.map((res) => new Addon(res.data.data, res.data.url));
  }, [data]);

  return (
    <AddonContext.Provider value={addons}>
      {props.children}
    </AddonContext.Provider>
  );
}
