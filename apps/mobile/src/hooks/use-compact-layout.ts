import { useWindowDimensions } from 'react-native';

/**
 * True on small phones (iPhone SE: 375×667 pt, iPhone mini: 375 pt wide), where display-size
 * type and generous spacing crowd the first screen.
 */
export function useCompactLayout() {
  const { width, height } = useWindowDimensions();
  return width < 390 || height < 700;
}
