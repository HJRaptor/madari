import { createBrowserRouter, Outlet } from 'react-router-dom';
import { VideoPlayer } from '@/features/video/components/VideoPlayer';
import App from '@/App.tsx';
import SettingsPage from '@/pages/settings.page';

export const router = createBrowserRouter([
  {
    path: '',
    element: (
      <>
        <Outlet />
        <VideoPlayer />
      </>
    ),
    children: [
      {
        path: '',
        element: <App />,
      },
      {
        path: 'player',
        element: <></>,
      },
    ],
  },
  {
    path: 'settings',
    element: <SettingsPage />,
  },
]);
