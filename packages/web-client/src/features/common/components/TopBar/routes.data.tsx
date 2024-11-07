import React from 'react';
import { FormattedMessage } from 'react-intl';
import { HomeIcon, SettingsIcon, VideoIcon, VideotapeIcon } from 'lucide-react';

export const NavigationRouteData: {
  title: React.ReactNode;
  key: string;
  icon?: React.ReactNode;
}[] = [
  {
    key: '/',
    title: <FormattedMessage defaultMessage="Home" />,
    icon: <HomeIcon />,
  },
  {
    key: '/?type=movie',
    icon: <VideoIcon />,
    title: <FormattedMessage defaultMessage="Movies" />,
  },
  {
    key: '/?type=series',
    icon: <VideotapeIcon />,
    title: <FormattedMessage defaultMessage="Shows" />,
  },
  {
    icon: <SettingsIcon />,
    key: '/settings',
    title: <FormattedMessage defaultMessage="Settings" />,
  },
];
