import React from 'react';
import { FormattedMessage } from 'react-intl';
import { HomeIcon, User2Icon, VideoIcon, VideotapeIcon } from 'lucide-react';

export const NavigationRouteData: {
  title: React.ReactNode;
  key: string;
  icon?: React.ReactNode;
}[] = [
  {
    key: 'home',
    title: <FormattedMessage defaultMessage="Home" />,
    icon: <HomeIcon />,
  },
  {
    key: 'movies',
    icon: <VideoIcon />,
    title: <FormattedMessage defaultMessage="Movies" />,
  },
  {
    key: 'shows',
    icon: <VideotapeIcon />,
    title: <FormattedMessage defaultMessage="Shows" />,
  },
  {
    icon: <User2Icon />,
    key: 'my-account',
    title: <FormattedMessage defaultMessage="My Account" />,
  },
];
