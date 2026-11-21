import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { useAppTheme } from '@/hooks/use-app-theme';

export default function AppTabs() {
  const theme = useAppTheme();

  return (
    <NativeTabs
      backgroundColor={theme.background}
      indicatorColor={theme.card}
      // Selected tab uses the brand accent, as iOS apps tint with their key color.
      tintColor={theme.accent}
      iconColor={{ default: theme.textMedium, selected: theme.accent }}
      labelStyle={{ default: { color: theme.textMedium }, selected: { color: theme.accent } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'house', selected: 'house.fill' }}
          md="home"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="habits">
        <NativeTabs.Trigger.Label>Habits</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'checkmark.circle', selected: 'checkmark.circle.fill' }}
          md="check_circle"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
