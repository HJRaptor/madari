import { DarkTheme } from 'baseui';

export const AppTheme = DarkTheme;

for (const res in AppTheme.typography) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error error
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  AppTheme.typography[res].fontFamily =
    '"Exo 2", system-ui, "Helvetica Neue", Helvetica, Arial, sans-serif';
}
