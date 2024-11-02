import { useEffect, useState } from 'react';

export const useDeviceDetection = () => {
  const [isTV, setIsTV] = useState(false);

  useEffect(() => {
    // Check if it's a TV device
    const checkIfTV = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isSamsungTV =
        userAgent.includes('smart-tv') || userAgent.includes('tizen');
      const isLGTV =
        userAgent.includes('webos') ||
        userAgent.includes('web0s') ||
        userAgent.includes('webappmanager') ||
        userAgent.includes('smarttv') ||
        userAgent.includes('colt');
      const isTV = isSamsungTV || isLGTV;
      setIsTV(isTV);
    };

    checkIfTV();
    window.addEventListener('resize', checkIfTV);
    return () => {
      window.removeEventListener('resize', checkIfTV);
    };
  }, []);

  return { isTV };
};
