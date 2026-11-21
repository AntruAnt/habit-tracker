import Svg, { G, Path, Polyline, Rect } from 'react-native-svg';

import { FlatUI, MidnightBlue } from '@/constants/app-theme';

/** Brand colors. Fixed in both themes so the logo matches the app icon. */
export const LogoColors = {
  tile: MidnightBlue[500],
  ring: FlatUI.turquoise,
  check: '#ffffff',
} as const;

// Geometry on a 100x100 grid. Keep in sync with the source art in assets/brand/.
const RING_PATH = 'M84 50 A34 34 0 1 1 67 20.555';
const CHECK_POINTS = '31,50 44,63 82,25';
const STROKE_WIDTH = 9;

function Mark() {
  return (
    <>
      <Path
        d={RING_PATH}
        fill="none"
        stroke={LogoColors.ring}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
      />
      <Polyline
        points={CHECK_POINTS}
        fill="none"
        stroke={LogoColors.check}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  );
}

type LogoProps = {
  size: number;
  /** `tile` matches the app icon; `mark` is the bare symbol for dark brand surfaces like the splash. */
  variant?: 'tile' | 'mark';
};

/**
 * The app logo: a feedback loop (the 21-day cycle) with a check mark breaking out through its gap.
 * Decorative by default; give the surrounding element an accessible name.
 */
export function Logo({ size, variant = 'tile' }: LogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      {variant === 'tile' ? (
        <>
          <Rect width={100} height={100} rx={23} fill={LogoColors.tile} />
          <G transform="translate(11 11) scale(0.78)">
            <Mark />
          </G>
        </>
      ) : (
        <Mark />
      )}
    </Svg>
  );
}
