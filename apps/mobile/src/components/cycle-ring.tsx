import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

/** One segment per day of a cycle. */
const SEGMENTS = 21;
/** Gap between segments, in degrees. */
const GAP = 4;

function arcPath(center: number, radius: number, startAngle: number, endAngle: number) {
  const point = (angle: number) => {
    // 0° points up; angles run clockwise.
    const radians = ((angle - 90) * Math.PI) / 180;
    return `${center + radius * Math.cos(radians)} ${center + radius * Math.sin(radians)}`;
  };
  return `M ${point(startAngle)} A ${radius} ${radius} 0 0 1 ${point(endAngle)}`;
}

type CycleRingProps = {
  size: number;
  /** How many of the 21 segments use `color`; the rest use `trackColor`. */
  filled: number;
  color: string;
  trackColor: string;
  /** Content centered inside the ring. */
  children?: ReactNode;
};

/** The logo's loop as a 21-segment ring, one segment per day of a 21-day cycle. */
export function CycleRing({ size, filled, color, trackColor, children }: CycleRingProps) {
  const strokeWidth = Math.round(size * 0.08);
  const radius = (size - strokeWidth) / 2;
  const step = 360 / SEGMENTS;

  return (
    <View style={[styles.ring, { width: size, height: size }]}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill} aria-hidden>
        {Array.from({ length: SEGMENTS }, (_, day) => (
          <Path
            key={day}
            d={arcPath(size / 2, radius, day * step + GAP / 2, (day + 1) * step - GAP / 2)}
            stroke={day < filled ? color : trackColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
        ))}
      </Svg>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
