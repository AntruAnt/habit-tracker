import { AppThemes } from '@/constants/app-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useAppTheme() {
  return AppThemes[useColorScheme()];
}
