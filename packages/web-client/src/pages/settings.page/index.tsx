import TopBar from '@/features/common/components/TopBar';
import { useStyletron } from 'baseui';
import AddonManager from '@/features/settings/components/AddonManager';

export default function SettingsPage() {
  const [css, $theme] = useStyletron();

  return (
    <div
      className={css({
        backgroundColor: $theme.colors.backgroundPrimary,
        minHeight: '100vh',
      })}
    >
      <TopBar />

      <AddonManager />
    </div>
  );
}
