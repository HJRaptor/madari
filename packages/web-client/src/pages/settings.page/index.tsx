import React, { useState } from 'react';
import TopBar from '@/features/common/components/TopBar';
import { useStyletron } from 'baseui';
import AddonManager from '@/features/settings/components/AddonManager';
import {
  AudioSettings,
  GeneralSettings,
  PlayerSettings,
} from '@/features/settings/components/GeneralSettings';
import { Block } from 'baseui/block';
import { Button, KIND } from 'baseui/button';
import {
  Monitor as MonitorIcon,
  Music as MusicIcon,
  Puzzle as PuzzleIcon,
  Settings as SettingsIcon,
} from 'lucide-react';

const TabItem = ({
  icon: Icon,
  label,
  isActive,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) => {
  const [css, theme] = useStyletron();
  return (
    <Button
      kind={KIND.tertiary}
      onClick={onClick}
      overrides={{
        BaseButton: {
          style: {
            backgroundColor: isActive
              ? theme.colors.backgroundTertiary
              : 'transparent',
            paddingLeft: theme.sizing.scale800,
            paddingRight: theme.sizing.scale800,
            paddingTop: theme.sizing.scale600,
            paddingBottom: theme.sizing.scale600,
            marginRight: theme.sizing.scale400,
            ':hover': {
              backgroundColor: isActive
                ? theme.colors.backgroundTertiary
                : theme.colors.backgroundSecondary,
            },
            transitionProperty: 'all',
            transitionDuration: '0.2s',
            transitionTimingFunction: 'ease-in-out',
          },
        },
      }}
    >
      <Block display="flex" alignItems="center">
        <Icon
          size={20}
          style={{
            marginRight: theme.sizing.scale300,
            color: isActive
              ? theme.colors.primaryA
              : theme.colors.contentSecondary,
          }}
        />
        <span
          className={css({
            color: isActive
              ? theme.colors.primaryA
              : theme.colors.contentSecondary,
            ...theme.typography.LabelMedium,
            fontWeight: isActive ? 600 : 400,
          })}
        >
          {label}
        </span>
      </Block>
    </Button>
  );
};

export default function SettingsPage() {
  const [css, theme] = useStyletron();
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    {
      id: 'general',
      label: 'General',
      icon: SettingsIcon,
      component: GeneralSettings,
    },
    {
      id: 'player',
      label: 'Player',
      icon: MonitorIcon,
      component: PlayerSettings,
    },
    {
      id: 'audio',
      label: 'Audio',
      icon: MusicIcon,
      component: AudioSettings,
    },
    {
      id: 'addons',
      label: 'Add-ons',
      icon: PuzzleIcon,
      component: AddonManager,
    },
  ];

  return (
    <Block
      paddingTop="96px"
      backgroundColor={theme.colors.backgroundPrimary}
      minHeight="calc(100vh - 96px)"
      display="flex"
      flexDirection="column"
    >
      <TopBar />

      <Block
        paddingTop={theme.sizing.scale1000}
        paddingBottom={theme.sizing.scale1000}
        backgroundColor={theme.colors.backgroundSecondary}
        display="flex"
        justifyContent="center"
        $style={{
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        }}
      >
        <Block
          maxWidth="1200px"
          width="100%"
          paddingLeft={theme.sizing.scale800}
          paddingRight={theme.sizing.scale800}
          display="flex"
          alignItems="center"
        >
          <Block
            className={css({
              display: 'flex',
              alignItems: 'center',
              overflowX: 'auto',
              '::-webkit-scrollbar': {
                display: 'none',
              },
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
            })}
          >
            {tabs.map((tab) => (
              <TabItem
                key={tab.id}
                icon={tab.icon}
                label={tab.label}
                isActive={activeTab === tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                }}
              />
            ))}
          </Block>
        </Block>
      </Block>

      <Block
        flex={1}
        position="relative"
        backgroundColor={theme.colors.backgroundPrimary}
      >
        {tabs.map((tab) => (
          <Block
            key={tab.id}
            display={activeTab === tab.id ? 'block' : 'none'}
            position="absolute"
            top="0"
            left="0"
            maxWidth="1200px"
            margin="0 auto"
            paddingTop="24px"
            right="0"
            bottom="0"
            className={css({
              animationName: {
                '0%': {
                  opacity: 0,
                  transform: 'translateY(10px)',
                },
                '100%': {
                  opacity: 1,
                  transform: 'translateY(0)',
                },
              },
              animationDuration: '0.3s',
              animationTimingFunction: 'ease-out',
            })}
          >
            <tab.component />
          </Block>
        ))}
      </Block>
    </Block>
  );
}
