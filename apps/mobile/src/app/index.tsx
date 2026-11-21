import { StatusBar } from 'expo-status-bar';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Platform, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useReducedMotion,
  useScrollOffset,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { Card } from '@/components/card';
import { CycleRing } from '@/components/cycle-ring';
import { ScrollReveal, ScrollRevealProvider } from '@/components/scroll-reveal';
import { FlatUI, Shape, Typography, withAlpha } from '@/constants/app-theme';
import { BottomTabInset, MaxContentWidth, Spacing, WebNavBarHeight } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCompactLayout } from '@/hooks/use-compact-layout';

type Principle = {
  title: string;
  description: string;
  icon: SymbolViewProps['name'];
  color: string;
};

const PRINCIPLES: Principle[] = [
  {
    title: 'Self-image',
    description:
      'You act in line with how you see yourself. Change that picture and your behavior follows.',
    icon: { ios: 'person.crop.circle', android: 'person', web: 'person' },
    color: FlatUI.turquoise,
  },
  {
    title: 'Success mechanism',
    description:
      'Your mind steers toward a clear goal like a servo-mechanism, correcting course as it goes.',
    icon: { ios: 'scope', android: 'track_changes', web: 'track_changes' },
    color: FlatUI.peterRiver,
  },
  {
    title: '21-day practice',
    description: 'A new self-image takes about three weeks of daily practice to settle in.',
    icon: { ios: 'calendar', android: 'calendar_month', web: 'calendar_month' },
    color: FlatUI.sunFlower,
  },
  {
    title: 'Theater of the mind',
    description:
      'Rehearse the person you want to become with a few minutes of vivid visualization each day.',
    icon: { ios: 'theatermasks.fill', android: 'theater_comedy', web: 'theater_comedy' },
    color: FlatUI.amethyst,
  },
];

/** Screens at least this wide (tablets, desktop web) get the larger headline. */
const WIDE_LAYOUT = 600;
/** Scroll distance over which the hero drifts and fades as it passes under the app bar. */
const HERO_FADE_DISTANCE = 200;
/** Delay between elements revealed together on first load. */
const STAGGER = 90;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const theme = useAppTheme();
  const reduceMotion = useReducedMotion();
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollY = useScrollOffset(scrollRef);
  const contentHeight = useSharedValue(0);
  const compact = useCompactLayout();
  const cardText = { color: theme.cardText };

  const sectionGap = compact ? Spacing.four : Spacing.five;
  // The hero lags behind the scroll (parallax) by slightly less than the gap below it,
  // so it never slides under the next card.
  const heroDrift = sectionGap - Spacing.one;

  const heroStyle = useAnimatedStyle(() => {
    if (reduceMotion) return {};
    const y = scrollY.get();
    return {
      opacity: interpolate(y, [0, HERO_FADE_DISTANCE], [1, 0], Extrapolation.CLAMP),
      transform: [
        {
          translateY: interpolate(y, [0, HERO_FADE_DISTANCE], [0, heroDrift], Extrapolation.CLAMP),
        },
      ],
    };
  });

  // On web the floating navigation bar carries the brand and theme toggle instead.
  const showAppHeader = Platform.OS !== 'web';

  // Parts of the scroll view hidden behind overlaid UI: the web nav bar on top, the tab bar below.
  const coveredTop = showAppHeader ? 0 : WebNavBarHeight;
  const coveredBottom = insets.bottom + BottomTabInset;

  const contentInsets = {
    paddingTop: coveredTop + Spacing.three,
    paddingBottom: coveredBottom + Spacing.four,
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

      {showAppHeader && <AppHeader scrollY={scrollY} />}

      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        onContentSizeChange={(_, height) => contentHeight.set(height)}
        contentContainerStyle={[styles.content, contentInsets]}>
        <ScrollRevealProvider
          scrollRef={scrollRef}
          scrollY={scrollY}
          topInset={coveredTop}
          bottomInset={coveredBottom}
          contentHeight={contentHeight}>
          <View style={[styles.column, { gap: sectionGap }]}>
            <ScrollReveal>
              <Animated.View style={[styles.hero, heroStyle]}>
                <Text
                  accessibilityRole="header"
                  maxFontSizeMultiplier={1.4}
                  style={[
                    width >= WIDE_LAYOUT ? styles.headlineWide : styles.headline,
                    { color: theme.textHigh },
                  ]}>
                  Build habits from the inside out.
                </Text>
                <Text style={[styles.lead, { color: theme.textMedium }]}>
                  Based on Dr. Maxwell Maltz&apos;s 1960 classic Psycho-Cybernetics: change how you
                  see yourself, and new habits follow.
                </Text>
              </Animated.View>
            </ScrollReveal>

            <ScrollReveal delay={STAGGER}>
              <Card accessible style={[styles.featureCard, compact && styles.featureCardCompact]}>
                <View style={styles.featureHeader}>
                  <CycleRing
                    size={compact ? 76 : 88}
                    filled={21}
                    color={theme.accent}
                    trackColor={theme.cardBorder}>
                    <Text maxFontSizeMultiplier={1.2} style={[styles.ringNumber, cardText]}>
                      21
                    </Text>
                    <Text maxFontSizeMultiplier={1.2} style={[styles.ringLabel, cardText]}>
                      DAYS
                    </Text>
                  </CycleRing>
                  <View style={styles.featureSummary}>
                    <Text style={[styles.cardTitle, cardText]}>The 21-day cycle</Text>
                    <Text style={[styles.cardBody, cardText]}>
                      Maltz&apos;s minimum for a new self-image to settle in.
                    </Text>
                  </View>
                </View>

                <View style={[styles.blockquote, { borderLeftColor: theme.accent }]}>
                  <Text style={[styles.quote, cardText]}>
                    “It usually requires a minimum of about 21 days to effect any perceptible change
                    in a mental image.”
                  </Text>
                  <Text style={[styles.attribution, cardText]}>— Maxwell Maltz</Text>
                </View>
              </Card>
            </ScrollReveal>

            <View style={styles.section}>
              <ScrollReveal delay={STAGGER * 2} style={styles.sectionHeader}>
                <Text
                  accessibilityRole="header"
                  style={[styles.sectionTitle, { color: theme.textHigh }]}>
                  Core principles
                </Text>
                <Text style={[styles.sectionSubtitle, { color: theme.textMedium }]}>
                  Four ideas from the book that shape how habits form.
                </Text>
              </ScrollReveal>
              <View style={styles.grid}>
                {PRINCIPLES.map((principle, index) => (
                  <ScrollReveal
                    key={principle.title}
                    delay={STAGGER * (3 + index)}
                    style={styles.gridItem}>
                    <Card accessible style={styles.principleCard}>
                      <View
                        style={[
                          styles.iconTile,
                          { backgroundColor: withAlpha(principle.color, 0.18) },
                        ]}>
                        <SymbolView name={principle.icon} size={22} tintColor={principle.color} />
                      </View>
                      <View style={styles.principleText}>
                        <Text style={[styles.cardTitle, cardText]}>{principle.title}</Text>
                        <Text style={[styles.cardBody, cardText]}>{principle.description}</Text>
                      </View>
                    </Card>
                  </ScrollReveal>
                ))}
              </View>
            </View>

            <ScrollReveal delay={STAGGER * 7}>
              <Card accessible style={[styles.pullQuoteCard, compact && styles.featureCardCompact]}>
                <SymbolView
                  name={{ ios: 'quote.opening', android: 'format_quote', web: 'format_quote' }}
                  size={28}
                  tintColor={theme.accent}
                />
                <Text style={[styles.pullQuote, cardText]}>
                  Our self-image and our habits tend to go together. Change one and you will
                  automatically change the other.
                </Text>
                <Text style={[styles.attribution, styles.centered, cardText]}>— Maxwell Maltz</Text>
              </Card>
            </ScrollReveal>
          </View>
        </ScrollRevealProvider>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
  },
  column: {
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.three,
  },
  hero: {
    gap: Spacing.two + Spacing.one,
  },
  headline: {
    ...Typography.title1,
  },
  headlineWide: {
    ...Typography.largeTitle,
  },
  lead: {
    ...Typography.body,
  },
  featureCard: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  featureCardCompact: {
    padding: Spacing.three + Spacing.one,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  featureSummary: {
    flex: 1,
    gap: Spacing.one,
  },
  ringNumber: {
    ...Typography.title1,
    textAlign: 'center',
  },
  ringLabel: {
    ...Typography.caption,
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  blockquote: {
    borderLeftWidth: 3,
    paddingLeft: Spacing.three,
    gap: Spacing.two,
  },
  quote: {
    ...Typography.body,
    fontStyle: 'italic',
  },
  attribution: {
    ...Typography.subheadline,
    fontWeight: 600,
  },
  centered: {
    textAlign: 'center',
  },
  section: {
    gap: Spacing.three,
  },
  sectionHeader: {
    gap: Spacing.one,
  },
  sectionTitle: {
    ...Typography.title2,
  },
  sectionSubtitle: {
    ...Typography.subheadline,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  gridItem: {
    flexGrow: 1,
    flexBasis: 280,
  },
  principleCard: {
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.three,
    gap: Spacing.three,
  },
  iconTile: {
    width: 44,
    height: 44,
    borderRadius: Shape.medium,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  principleText: {
    flex: 1,
    gap: Spacing.one,
  },
  cardTitle: {
    ...Typography.headline,
  },
  cardBody: {
    ...Typography.subheadline,
  },
  pullQuoteCard: {
    alignItems: 'center',
    padding: Spacing.four,
    gap: Spacing.three,
  },
  pullQuote: {
    ...Typography.title3,
    fontWeight: 400,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
