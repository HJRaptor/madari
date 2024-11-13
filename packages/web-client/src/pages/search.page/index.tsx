import HomePage from '@/pages/home.page';
import { useAtom } from 'jotai/index';
import { activeTitleAtom } from '@/features/listing/atoms/active-title-atom.ts';
import { useEffect } from 'react';

export default function SearchPage() {
  const [, setActiveTitle] = useAtom(activeTitleAtom);

  useEffect(() => {
    setActiveTitle(null);

    return () => {
      setActiveTitle(null);
    };
  }, [setActiveTitle]);

  return <HomePage />;
}
