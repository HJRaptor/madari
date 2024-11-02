import React, { useContext, useState } from 'react';
import {
  Button,
  SIZE as ButtonSize,
  SHAPE as ButtonShape,
} from 'baseui/button';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalButton,
  SIZE as ModalSize,
  ROLE,
} from 'baseui/modal';
import { Input } from 'baseui/input';
import { Checkbox } from 'baseui/checkbox';
import { toaster } from 'baseui/toast';
import { useStyletron } from 'baseui';
import { useAtom } from 'jotai';
import { appSettingsAtom } from '@/atoms/app-settings.ts';
import { DeleteIcon, Plus, SettingsIcon, ShareIcon } from 'lucide-react';
import type { KIND } from 'baseui/button/constants';
import {
  HeadingMedium,
  LabelMedium,
  LabelXSmall,
  MonoLabelSmall,
} from 'baseui/typography';
import { AddonContext } from '@/features/addon/providers/AddonContext.ts';

interface Addon {
  url: string;
  hack?: {
    enable: boolean;
    realDebridApiKey: string;
  };
}

const CustomCard: React.FC<{
  children: React.ReactNode;
  $hover?: boolean;
}> = ({ children, $hover = true }) => {
  const [css] = useStyletron();
  return (
    <div
      className={css({
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        borderRadius: '8px',
        padding: '1.5rem',
        margin: '1rem 0',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease',
        border: '1px solid #333',
        position: 'relative',
        overflow: 'hidden',
        ':hover': $hover
          ? {
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 12px rgba(0, 0, 0, 0.2)',
              background: 'linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%)',
              borderColor: '#444',
            }
          : {},
        '::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background:
            'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
        },
      })}
    >
      {children}
    </div>
  );
};

const AddonManager: React.FC = () => {
  const [css] = useStyletron();
  const [settings, setSettings] = useAtom(appSettingsAtom);
  const [isOpen, setIsOpen] = useState(false);
  const [newAddonUrl, setNewAddonUrl] = useState('');
  const [enableRealDebrid, setEnableRealDebrid] = useState(false);
  const [realDebridApiKey, setRealDebridApiKey] = useState('');
  const [isInstalling, setIsInstalling] = useState(false);
  const values = useContext(AddonContext);

  const handleAddAddon = async () => {
    setIsInstalling(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const newAddon: Addon = {
        url: newAddonUrl,
        ...(enableRealDebrid && {
          hack: {
            enable: true,
            realDebridApiKey,
          },
        }),
      };

      setSettings((prev) => ({
        ...prev,
        addons: [...prev.addons, newAddon],
      }));

      setIsOpen(false);
      setNewAddonUrl('');
      setEnableRealDebrid(false);
      setRealDebridApiKey('');
      toaster.positive('Addon installed successfully!', {
        overrides: {
          Body: {
            style: {
              backgroundColor: '#2d2d2d',
              color: '#fff',
            },
          },
        },
      });
    } catch (_error: unknown) {
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      toaster.negative('Failed to install addon ' + _error, {});
    } finally {
      setIsInstalling(false);
    }
  };

  const handleUninstall = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      addons: prev.addons.filter((_, i) => i !== index),
    }));
    toaster.info('Addon uninstalled', {});
  };

  const handleShare = async (url: string) => {
    await navigator.clipboard.writeText(url);
    toaster.info('Addon URL copied to clipboard', {});
  };

  const ActionButton = ({
    onClick,
    icon,
    label,
    kind = 'secondary',
  }: {
    onClick: VoidFunction;
    icon: React.ReactNode;
    label: React.ReactNode;
    kind?: keyof typeof KIND | 'negative';
  }) => (
    <Button
      onClick={onClick}
      size={ButtonSize.compact}
      kind={kind as never}
      shape={ButtonShape.pill}
    >
      <div
        className={css({
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        })}
      >
        {icon}
        {label}
      </div>
    </Button>
  );

  return (
    <div
      className={css({
        paddingLeft: '2rem',
        paddingRight: '2rem',
        paddingTop: '94px',
        backgroundColor: '#141414',
        minHeight: 'calc(100vh - 94px)',
      })}
    >
      <div
        className={css({
          maxWidth: '1200px',
          margin: '0 auto',
        })}
      >
        <div
          className={css({
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          })}
        >
          <HeadingMedium>Addons</HeadingMedium>

          <Button
            onClick={() => {
              setIsOpen(true);
            }}
            size={ButtonSize.compact}
            shape={ButtonShape.pill}
          >
            <div
              className={css({
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              })}
            >
              <Plus size={20} />
              Add New Addon
            </div>
          </Button>
        </div>

        <div className={css({ display: 'grid' })}>
          {settings.addons.map(function (addon, index) {
            const addonData = values.find(
              (res) => res.installUrl === addon.url,
            );

            return (
              <div
                key={addon.url}
                className={css({
                  userSelect: 'none',
                })}
              >
                <CustomCard>
                  <div
                    className={css({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1.5rem',
                      color: '#fff',
                    })}
                  >
                    {addonData?.config.logo ? (
                      <img
                        className={css({
                          width: '64px',
                        })}
                        src={addonData?.config.logo}
                        alt=""
                      />
                    ) : (
                      <SettingsIcon
                        className={css({
                          width: '64px',
                        })}
                      ></SettingsIcon>
                    )}
                    <div className={css({ flexGrow: 1 })}>
                      <LabelMedium marginBottom="scale200">
                        {addonData?.config.name ?? new URL(addon.url).hostname}
                      </LabelMedium>
                      <MonoLabelSmall color="#888">
                        {addonData?.config.description}
                      </MonoLabelSmall>
                      {addon.hack?.enable && (
                        <LabelXSmall
                          className={css({
                            color: '#46d369',
                            marginTop: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                          })}
                        >
                          <span
                            className={css({
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: '#46d369',
                              display: 'inline-block',
                            })}
                          />
                          RealDebrid Enabled
                        </LabelXSmall>
                      )}
                    </div>
                    <div className={css({ display: 'flex', gap: '0.75rem' })}>
                      <ActionButton
                        onClick={() => {
                          handleShare(addon.url).catch((e: unknown) => {
                            console.warn(e);
                          });
                        }}
                        icon={<ShareIcon size={16} />}
                        label="Share"
                      />
                      <ActionButton
                        onClick={() => {
                          handleUninstall(index);
                        }}
                        icon={<DeleteIcon size={16} />}
                        label="Remove"
                      />
                    </div>
                  </div>
                </CustomCard>
              </div>
            );
          })}
        </div>

        <Modal
          onClose={() => {
            setIsOpen(false);
          }}
          isOpen={isOpen}
          size={ModalSize.default}
          role={ROLE.dialog}
          overrides={{
            Dialog: {
              style: {
                backgroundColor: '#1a1a1a',
                border: '1px solid #333',
              },
            },
          }}
        >
          <ModalHeader>Install New Addon</ModalHeader>
          <ModalBody>
            <Input
              value={newAddonUrl}
              onChange={(e) => {
                setNewAddonUrl(e.currentTarget.value);
              }}
              placeholder="Enter addon URL"
              overrides={{
                Root: {
                  style: {
                    borderRadius: '4px',
                  },
                },
              }}
            />
            <div className={css({ marginTop: '1rem' })}>
              <Checkbox
                checked={enableRealDebrid}
                onChange={(e) => {
                  setEnableRealDebrid(e.currentTarget.checked);
                }}
                overrides={{
                  Root: {
                    style: {
                      color: '#fff',
                    },
                  },
                }}
              >
                Bypass with RealDebrid
              </Checkbox>
            </div>
            {enableRealDebrid && (
              <div className={css({ marginTop: '1rem' })}>
                <Input
                  value={realDebridApiKey}
                  onChange={(e) => {
                    setRealDebridApiKey(e.currentTarget.value);
                  }}
                  placeholder="Enter RealDebrid API Key"
                  type="password"
                />
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <ModalButton
              kind="tertiary"
              onClick={() => {
                setIsOpen(false);
              }}
            >
              Cancel
            </ModalButton>
            <Button
              onClick={handleAddAddon}
              isLoading={isInstalling}
              disabled={!newAddonUrl}
              overrides={{
                BaseButton: {
                  style: {
                    backgroundColor: '#E50914',
                    ':hover': {
                      backgroundColor: '#B2070E',
                    },
                  },
                },
              }}
            >
              Install
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  );
};

export default AddonManager;
