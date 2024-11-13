import React, { useState } from 'react';
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
import { Button } from 'baseui/button';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { GripVertical, Plus, X } from 'lucide-react';

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
  const [newExtension, setNewExtension] = useState('');

  const subtitlesLanguages = allSubtitles;
  const audioLanguages = allSubtitles; // Replace with actual audio languages if different

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(settings.fileExtensionPreference);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSettings((prev) => ({
      ...prev,
      fileExtensionPreference: items,
    }));
    toaster.positive('Extension order updated');
  };

  const addExtension = () => {
    if (
      newExtension &&
      !settings.fileExtensionPreference.includes(newExtension)
    ) {
      setSettings((prev) => ({
        ...prev,
        fileExtensionPreference: [
          ...prev.fileExtensionPreference,
          newExtension,
        ],
      }));
      setNewExtension('');
      toaster.positive('Extension added');
    }
  };

  const removeExtension = (extension: string) => {
    setSettings((prev) => ({
      ...prev,
      fileExtensionPreference: prev.fileExtensionPreference.filter(
        (ext) => ext !== extension,
      ),
    }));
    toaster.positive('Extension removed');
  };

  return (
    <SettingsCard title="Player Settings">
      <FormControl label="Default Audio Language">
        <Select
          options={audioLanguages}
          value={[
            {
              id: settings.defaultAudioLanguage,
              label: audioLanguages.find(
                (l) => l.id === settings.defaultAudioLanguage,
              )?.label,
            },
          ]}
          onChange={(params) => {
            if (params.value[0]) {
              setSettings((prev) => ({
                ...prev,
                defaultAudioLanguage: params.value[0].id as string,
              }));
              toaster.positive('Audio language updated');
            }
          }}
        />
      </FormControl>

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

      <FormControl label="File Extension Preferences">
        <Block marginBottom="scale400">
          <Block display="flex" alignItems="center">
            <Block flex="1" marginRight="scale300">
              <Input
                value={newExtension}
                onChange={(e) => setNewExtension(e.currentTarget.value)}
                placeholder="Enter file extension (e.g., mkv)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addExtension();
                  }
                }}
              />
            </Block>
            <Button onClick={addExtension} size="compact">
              <Plus size={16} />
            </Button>
          </Block>
        </Block>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="extensions">
            {(provided) => (
              <Block {...provided.droppableProps} ref={provided.innerRef}>
                {settings.fileExtensionPreference.map((extension, index) => (
                  <Draggable
                    key={extension}
                    draggableId={extension}
                    index={index}
                  >
                    {(provided) => (
                      <Block
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        margin="scale200"
                        padding="scale400"
                        backgroundColor={theme.colors.backgroundTertiary}
                        display="flex"
                        alignItems="center"
                      >
                        <Block
                          {...provided.dragHandleProps}
                          marginRight="scale300"
                        >
                          <GripVertical size={16} />
                        </Block>
                        <Block flex="1">{extension}</Block>
                        <Button
                          onClick={() => {
                            removeExtension(extension);
                          }}
                          kind="tertiary"
                          size="mini"
                        >
                          <X size={16} />
                        </Button>
                      </Block>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Block>
            )}
          </Droppable>
        </DragDropContext>
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
      <FormControl label="Preffered Default Audio Track">
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
