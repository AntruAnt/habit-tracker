import * as SplashScreen from 'expo-splash-screen';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, Keyframe } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { Logo } from '@/components/logo';
import { useAppTheme } from '@/hooks/use-app-theme';

const DURATION = 400;
/** Matches `imageWidth` of the expo-splash-screen plugin in app.json, so the handoff is seamless. */
const LOGO_SIZE = 96;

const fadeOut = new Keyframe({
  0: {
    opacity: 1,
    transform: [{ scale: 1 }],
  },
  100: {
    opacity: 0,
    transform: [{ scale: 1.08 }],
    easing: Easing.out(Easing.quad),
  },
});

/**
 * Covers the app with the logo on the theme background, matching the native splash screen,
 * then fades out once the first frame has rendered.
 */
export function SplashOverlay() {
  const theme = useAppTheme();
  const [animate, setAnimate] = useState(false);
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const logo = <Logo variant="mark" size={LOGO_SIZE} />;

  return animate ? (
    <Animated.View
      entering={fadeOut.duration(DURATION).withCallback((finished) => {
        'worklet';
        if (finished) {
          scheduleOnRN(setVisible, false);
        }
      })}
      style={[styles.overlay, { backgroundColor: theme.background }]}>
      {logo}
    </Animated.View>
  ) : (
    <View
      onLayout={() => {
        SplashScreen.hideAsync().finally(() => {
          setAnimate(true);
        });
      }}
      style={[styles.overlay, { backgroundColor: theme.background }]}>
      {logo}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
});
