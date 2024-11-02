import { atomWithStorage } from 'jotai/utils';

export const appSettingsAtom = atomWithStorage<{
  removeDuplicateTiles: boolean;
  addons: {
    url: string;
    hack?: {
      enable: boolean;
      realDebridApiKey: string;
    };
  }[];
}>('app_settings', {
  removeDuplicateTiles: true,
  addons: [
    {
      url: 'https://v3-cinemeta.strem.io/manifest.json',
    },
    {
      url: 'https://7a82163c306e-stremio-netflix-catalog-addon.baby-beamup.club/ZG5wLGFtcCxhdHAsaGJtLG5meCxjcnUsaHN0LHplZSxkcGUsY3RzOjppbjoxNzI3MzgyNzI4OTMx/manifest.json',
    },
  ],
});
