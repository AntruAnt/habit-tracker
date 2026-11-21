import { createContext, use, type ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  measure,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
  type AnimatedRef,
  type SharedValue,
} from 'react-native-reanimated';

/**
 * Anchor lines, as fractions of the visible height measured from its top. Scrolling down, an
 * element animates in when its top edge reaches the lower line (75% down the screen); scrolling
 * up, when its bottom edge reaches the upper line (75% up from the bottom).
 */
const LOWER_ANCHOR = 0.75;
const UPPER_ANCHOR = 0.25;
/** Distance the element travels into place: up from below, or down from above. */
const TRAVEL = 24;
const DURATION = 520;

type ScrollRevealContextValue = {
  scrollRef: AnimatedRef<Animated.ScrollView>;
  /** Scroll offset of `scrollRef`, from `useScrollOffset`. */
  scrollY: SharedValue<number>;
  /** Space at the top of the scroll view covered by other UI (e.g. a floating nav bar). */
  topInset: number;
  /** Space at the bottom of the scroll view covered by other UI (e.g. the tab bar). */
  bottomInset: number;
  /** Height of the scroll content, from the scroll view's `onContentSizeChange`. */
  contentHeight: SharedValue<number>;
};

const ScrollRevealContext = createContext<ScrollRevealContextValue | null>(null);

/** Wrap a scroll view's content so `ScrollReveal` elements inside can track it. */
export function ScrollRevealProvider({
  children,
  ...value
}: ScrollRevealContextValue & { children: ReactNode }) {
  return <ScrollRevealContext value={value}>{children}</ScrollRevealContext>;
}

type ScrollRevealProps = {
  /** Stagger for elements visible on first load. Ignored once the user has scrolled. */
  delay?: number;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
};

/**
 * Fades its content in and slides it into place whenever it scrolls into view, in either
 * direction: up from below once it reaches the lower anchor while scrolling down, down from
 * above once it reaches the upper anchor while scrolling up. Once it is fully off screen it
 * resets, so it animates again on the way back.
 *
 * Positions are measured only when layout changes; each scroll frame is plain arithmetic on
 * the UI thread. With Reduce Motion on, content is always shown without animation.
 */
export function ScrollReveal({ delay = 0, style, children }: ScrollRevealProps) {
  const context = use(ScrollRevealContext);
  if (!context) {
    throw new Error('<ScrollReveal> must be used inside <ScrollRevealProvider>.');
  }
  const { scrollRef, scrollY, topInset, bottomInset, contentHeight } = context;

  const ref = useAnimatedRef<Animated.View>();
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(reduceMotion ? 1 : 0);
  const visible = useSharedValue(reduceMotion);
  /** +TRAVEL when entering from below, -TRAVEL when entering from above. */
  const enterFrom = useSharedValue(TRAVEL);
  // Layout, in scroll-content coordinates, refreshed whenever this element lays out.
  const layoutVersion = useSharedValue(0);
  const contentTop = useSharedValue(0);
  const height = useSharedValue(0);
  const viewportHeight = useSharedValue(0);

  useAnimatedReaction(
    () => ({ y: scrollY.get(), version: layoutVersion.get() }),
    (current, previous) => {
      if (reduceMotion || current.version === 0) return;

      if (previous === null || current.version !== previous.version) {
        const element = measure(ref);
        const viewport = measure(scrollRef);
        if (element === null || viewport === null) return;
        // Undo this element's own slide so the stored position is its resting place.
        const offset = (1 - progress.get()) * enterFrom.get();
        contentTop.set(element.pageY - offset - viewport.pageY + current.y);
        height.set(element.height);
        viewportHeight.set(viewport.height);
      }

      const top = contentTop.get() - current.y;
      const bottom = top + height.get();
      const viewTop = topInset;
      const viewBottom = viewportHeight.get() - bottomInset;
      const visibleHeight = viewBottom - viewTop;
      // Near either end of the content an element can only move as far as the scroll can still
      // go, so an anchor never sits further in than that. Mid-page the 75% anchors apply exactly;
      // at the very top or bottom they reach the screen edge, so nothing stays hidden there.
      const scrollableUp = Math.max(0, current.y);
      // Until the content has been measured, assume there is plenty left to scroll.
      const scrollableDown =
        contentHeight.get() > 0
          ? Math.max(0, contentHeight.get() - viewportHeight.get() - current.y)
          : Infinity;
      const lowerLine =
        viewBottom - Math.min(visibleHeight * (1 - LOWER_ANCHOR), scrollableDown);
      const upperLine = viewTop + Math.min(visibleHeight * UPPER_ANCHOR, scrollableUp);

      if (!visible.get()) {
        if (top < lowerLine && bottom > upperLine) {
          visible.set(true);
          // Scrolling up brings content in from above; scrolling down (and first load) from below.
          const scrollingUp = previous !== null && current.y < previous.y;
          enterFrom.set(scrollingUp ? -TRAVEL : TRAVEL);
          const animation = withTiming(1, { duration: DURATION, easing: Easing.out(Easing.cubic) });
          progress.set(current.y <= 0 ? withDelay(delay, animation) : animation);
        }
      } else if (bottom < viewTop || top > viewBottom) {
        // Fully off screen: reset so it animates again when it comes back.
        visible.set(false);
        progress.set(0);
      }
    },
  );

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.get(),
    transform: [{ translateY: (1 - progress.get()) * enterFrom.get() }],
  }));

  return (
    <Animated.View
      ref={ref}
      onLayout={() => layoutVersion.set((version) => version + 1)}
      style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}
