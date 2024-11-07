import React from 'react';
import { Button, KIND as ButtonKIND, SIZE as ButtonSIZE } from 'baseui/button';
import { PLACEMENT, StatefulPopover, TRIGGER_TYPE } from 'baseui/popover';
import { StatefulMenu } from 'baseui/menu';
import { useStyletron } from 'baseui';
import {
  ChevronDown,
  FullscreenIcon,
  Settings,
  Subtitles,
  Volume2,
} from 'lucide-react';
import { useManifestUrl } from '@/features/video/hooks/use-manifest-url.ts';
import { IconButton } from '@/features/video/components/CommonVideoPlayer/styles.ts';

type VideoMetadata = Awaited<ReturnType<typeof useManifestUrl>>;

interface VideoControlsProps {
  metadata: VideoMetadata;
  onSubtitleChange: (subtitle: string) => void;
  onAudioChange: (audio: string) => void;
  onQualityChange: (quality: string) => void;
}

const VideoControls: React.FC<VideoControlsProps> = ({
  metadata,
  onSubtitleChange,
  onAudioChange,
  onQualityChange,
}) => {
  const [css, theme] = useStyletron();

  const qualityOptions = Object.entries(metadata.qualities ?? {}).map(
    ([label, value]) => ({
      label,
      value,
    }),
  );

  const subtitleOptions = [
    { label: 'Off', id: null },
    ...(metadata.subtitles?.map((sub) => ({
      label: `${sub.lang} (${sub.lang_iso.toUpperCase()})`,
      ...sub,
    })) ?? []),
  ];

  const audioOptions =
    metadata.audios?.map((audio) => ({
      label: `${audio.lang} (${audio.codec.toUpperCase()})`,
      ...audio,
    })) ?? [];

  const buttonStyles = css({
    marginRight: theme.sizing.scale300,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    ':hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
  });

  const menuStyles = css({
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: theme.borders.radius300,
    padding: theme.sizing.scale300,
    maxHeight: '400px',
    overflowY: 'auto',
  });

  function renderMenu<T>(
    items: T[],
    onChange: (input: string) => void,
    onFinish: VoidFunction,
  ) {
    return (
      <StatefulMenu
        items={items}
        onItemSelect={({ item }) => {
          if (item && 'lang_iso' in item) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument
            onChange?.(item?.lang_iso);
            onFinish();
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          } else if (item && 'id' in item && typeof item.id === 'string') {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument
            onChange?.(item?.id);
            onFinish();
          }
        }}
        overrides={{
          List: {
            style: {
              backgroundColor: 'transparent',
            },
          },
          Option: {
            style: {
              color: theme.colors.contentPrimary,
              ':hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              },
            },
          },
        }}
      />
    );
  }

  return (
    <div
      className={css({
        display: 'flex',
        alignItems: 'center',
        padding: theme.sizing.scale400,
      })}
    >
      <StatefulPopover
        placement={PLACEMENT.top}
        triggerType={TRIGGER_TYPE.click}
        content={(close) => (
          <div className={menuStyles}>
            {renderMenu(subtitleOptions, onSubtitleChange, close.close)}
          </div>
        )}
        accessibilityType="tooltip"
      >
        <Button
          kind={ButtonKIND.secondary}
          size={ButtonSIZE.compact}
          className={buttonStyles}
          endEnhancer={() => <ChevronDown size={22} />}
        >
          <Subtitles size={22} />
        </Button>
      </StatefulPopover>

      <StatefulPopover
        placement={PLACEMENT.top}
        triggerType={TRIGGER_TYPE.click}
        content={(close) => (
          <div className={menuStyles}>
            {renderMenu(audioOptions, onAudioChange, close.close)}
          </div>
        )}
        accessibilityType="tooltip"
      >
        <Button
          kind={ButtonKIND.secondary}
          size={ButtonSIZE.compact}
          className={buttonStyles}
          endEnhancer={() => <ChevronDown size={22} />}
        >
          <Volume2 size={22} />
        </Button>
      </StatefulPopover>

      <StatefulPopover
        placement={PLACEMENT.top}
        triggerType={TRIGGER_TYPE.click}
        content={(close) => (
          <div className={menuStyles}>
            {renderMenu(
              qualityOptions.map((res) => ({
                id: res.value,
                label: res.label,
              })),
              onQualityChange,
              close.close,
            )}
          </div>
        )}
        accessibilityType="tooltip"
      >
        <Button
          kind={ButtonKIND.secondary}
          size={ButtonSIZE.compact}
          className={buttonStyles}
          endEnhancer={() => <ChevronDown size={22} />}
        >
          <Settings size={22} />
        </Button>
      </StatefulPopover>
      <IconButton
        onClick={() => {
          if (document.fullscreenElement) {
            void document.fullscreenElement.requestFullscreen();
          } else {
            void document
              .querySelector('video')
              ?.parentElement?.requestFullscreen();
          }
        }}
      >
        <FullscreenIcon />
      </IconButton>
    </div>
  );
};

export default VideoControls;
