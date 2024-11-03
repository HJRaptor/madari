import React from 'react';
import { useStyletron } from 'baseui';
import { useAtom } from 'jotai';
import { HeadingSmall } from 'baseui/typography';
import { Checkbox } from 'baseui/checkbox';
import { Select } from 'baseui/select';
import { StatefulPopover } from 'baseui/popover';
import { toaster } from 'baseui/toast';
import { Block } from 'baseui/block';
import { Card } from 'baseui/card';
import { FormControl } from 'baseui/form-control';
import { Slider } from 'baseui/slider';
import { Input } from 'baseui/input';
import {
  audioSettingsAtom,
  generalSettingsAtom,
  playerSettingsAtom,
} from '@/features/settings/components/atoms/all.tsx';
import allSubtitles from '../../data/languages.json';

const SettingsCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  const [, theme] = useStyletron();
  return (
    <Card
      overrides={{
        Root: {
          style: {
            backgroundColor: theme.colors.backgroundSecondary,
            marginBottom: theme.sizing.scale800,
          },
        },
      }}
    >
      <HeadingSmall marginBottom="scale200" marginTop="scale300">
        {title}
      </HeadingSmall>
      <Block paddingTop="scale400">{children}</Block>
    </Card>
  );
};

export const GeneralSettings: React.FC = () => {
  const [, theme] = useStyletron();
  const [settings, setSettings] = useAtom(generalSettingsAtom);

  const languages = [
    { id: 'en', label: 'English' },
    { id: 'mr', label: 'Marathi' },
  ];

  return (
    <SettingsCard title="General Settings">
      <FormControl label="Performance">
        <Checkbox
          checked={settings.performance}
          onChange={(e) => {
            setSettings((prev) => ({ ...prev, performance: e.target.checked }));
            toaster.positive('Performance setting updated');
          }}
        >
          Enable performance mode
        </Checkbox>
      </FormControl>
      <FormControl label="Disable Animation">
        <Checkbox
          checked={settings.noAnimation}
          onChange={(e) => {
            setSettings((prev) => ({ ...prev, noAnimation: e.target.checked }));
            toaster.positive('Performance setting updated');
          }}
        >
          Disable animation
        </Checkbox>
      </FormControl>

      <FormControl label="Language">
        <Select
          options={languages}
          value={[
            {
              id: settings.language,
              label: languages.find((l) => l.id === settings.language)?.label,
            },
          ]}
          onChange={(params) => {
            if (params.value[0]) {
              setSettings((prev) => ({
                ...prev,
                language: params.value[0].id as string,
              }));
              toaster.positive('Language setting updated');
            }
          }}
          overrides={{
            ControlContainer: {
              style: {
                backgroundColor: theme.colors.backgroundPrimary,
              },
            },
          }}
        />
      </FormControl>
    </SettingsCard>
  );
};

export const PlayerSettings: React.FC = () => {
  const [, theme] = useStyletron();
  const [settings, setSettings] = useAtom(playerSettingsAtom);

  const subtitlesLanguages = allSubtitles;

  return (
    <SettingsCard title="Player Settings">
      <FormControl label="Default Subtitles Language">
        <Select
          options={subtitlesLanguages}
          value={[
            {
              id: settings.defaultSubtitlesLanguage,
              label: subtitlesLanguages.find(
                (l) => l.id === settings.defaultSubtitlesLanguage,
              )?.label,
            },
          ]}
          onChange={(params) => {
            if (params.value[0]) {
              setSettings((prev) => ({
                ...prev,
                defaultSubtitlesLanguage: params.value[0].id as string,
              }));
              toaster.positive('Subtitles language updated');
            }
          }}
        />
      </FormControl>

      <FormControl label="Subtitles Size">
        <Slider
          value={[settings.defaultSubtitlesSize]}
          onChange={({ value }) => {
            setSettings((prev) => ({
              ...prev,
              defaultSubtitlesSize: value[0],
            }));
            toaster.positive('Subtitles size updated');
          }}
          min={50}
          max={200}
        />
      </FormControl>

      <FormControl label="Subtitles Color">
        <StatefulPopover
          content={() => (
            <Input
              type="color"
              value={settings.subtitlesColor}
              onChange={(color) => {
                setSettings((prev) => ({
                  ...prev,
                  subtitlesColor: color.target.value,
                }));
                toaster.positive('Subtitles color updated');
              }}
            />
          )}
        >
          <Block
            as="div"
            backgroundColor={settings.subtitlesColor}
            height="scale800"
            width="scale1600"
            style={{
              cursor: 'pointer',
              border: `1px solid ${theme.colors.borderOpaque}`,
            }}
          />
        </StatefulPopover>
      </FormControl>

      <FormControl label="Subtitles Background Color">
        <StatefulPopover
          content={() => (
            <Input
              value={settings.subtitlesBackgroundColor}
              onChange={(color) => {
                setSettings((prev) => ({
                  ...prev,
                  subtitlesBackgroundColor: color.target.value,
                }));
                toaster.positive('Subtitles background color updated');
              }}
            />
          )}
        >
          <Block
            as="div"
            backgroundColor={settings.subtitlesBackgroundColor}
            height="scale800"
            width="scale1600"
            style={{
              cursor: 'pointer',
              border: `1px solid ${theme.colors.borderOpaque}`,
            }}
          />
        </StatefulPopover>
      </FormControl>

      <FormControl label="Subtitles Outline Color">
        <StatefulPopover
          content={() => (
            <Input
              value={settings.subtitlesOutlineColor}
              onChange={(color) => {
                setSettings((prev) => ({
                  ...prev,
                  subtitlesOutlineColor: color.target.value,
                }));
                toaster.positive('Subtitles outline color updated');
              }}
            />
          )}
        >
          <Block
            as="div"
            backgroundColor={settings.subtitlesOutlineColor}
            height="scale800"
            width="scale1600"
            style={{
              cursor: 'pointer',
              border: `1px solid ${theme.colors.borderOpaque}`,
            }}
          />
        </StatefulPopover>
      </FormControl>
    </SettingsCard>
  );
};

export const AudioSettings: React.FC = () => {
  const [settings, setSettings] = useAtom(audioSettingsAtom);

  const audioTracks = [
    { id: 'original', label: 'Original' },
    { id: 'stereo', label: 'Stereo' },
    { id: 'surround', label: 'Surround' },
  ];

  return (
    <SettingsCard title="Audio Settings">
      <FormControl label="Default Audio Track">
        <Select
          options={allSubtitles}
          value={[
            {
              id: settings.defaultAudioTrack,
              label: audioTracks.find(
                (t) => t.id === settings.defaultAudioTrack,
              )?.label,
            },
          ]}
          onChange={(params) => {
            if (params.value[0]) {
              setSettings((prev) => ({
                ...prev,
                defaultAudioTrack: params.value[0].id as string,
              }));
              toaster.positive('Default audio track updated');
            }
          }}
        />
      </FormControl>

      <FormControl label="Surround Sound">
        <Checkbox
          checked={settings.surroundSound}
          onChange={(e) => {
            setSettings((prev) => ({
              ...prev,
              surroundSound: e.target.checked,
            }));
            toaster.positive('Surround sound setting updated');
          }}
        >
          Enable surround sound
        </Checkbox>
      </FormControl>
    </SettingsCard>
  );
};
