import { createBrowserRouter } from 'react-router-dom';
import { VideoPlayer } from '@/features/video/components/VideoPlayer';
import App from '@/App.tsx';
import SettingsPage from '@/pages/settings.page';
import React, { Suspense } from 'react';
import HomePage from '@/pages/home.page';
import { styletronEngine } from '@/utils/styletron.ts';
import HomeWrapperPage from '@/pages/home-wrapper.page';
import PlayerPage from '@/pages/player.page';

// eslint-disable-next-line react-refresh/only-export-components
const InfoPage = React.lazy(() => import('./pages/info.page'));

export const router = createBrowserRouter([
  {
    path: '',
    element: (
      <>
        <App />
        <VideoPlayer />
      </>
    ),
    children: [
      {
        path: '',
        element: <HomeWrapperPage />,
        children: [
          {
            path: '',
            element: <HomePage />,
          },
          {
            path: 'info/:type/:id',
            element: (
              <Suspense
                fallback={
                  <div
                    className={styletronEngine.renderStyle({
                      minHeight: '120px',
                    })}
                  />
                }
              >
                <InfoPage />
              </Suspense>
            ),
            loader: async () => {
              await Promise.resolve();

              return null;
            },
          },
        ],
      },
    ],
  },
  {
    path: 'player',
    element: <PlayerPage />,
  },
  {
    path: 'settings',
    element: <SettingsPage />,
  },
]);
