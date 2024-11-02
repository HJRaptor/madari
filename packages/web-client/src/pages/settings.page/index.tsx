import TopBar from '@/features/common/components/TopBar';
import { useStyletron } from 'baseui';

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
    </div>
  );
}
