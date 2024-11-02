import { createBrowserRouter } from 'react-router-dom';
import App from '@/App.tsx';
import React from 'react';

// eslint-disable-next-line react-refresh/only-export-components
const WatchPage = React.lazy(() => import('./pages/watch.page'));

export const router = createBrowserRouter([
  {
    path: '',
    element: <App />,
  },
  {
    path: 'player/*',
    element: <WatchPage />,
  },
]);
