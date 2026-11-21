import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';
import type { JsonElement } from 'test-renderer';

import { CycleRing } from '@/components/cycle-ring';

/** Every rendered SVG path in the tree (the ring's segments carry a `d` prop). */
function collectPaths(node: JsonElement | null, found: JsonElement[] = []) {
  if (!node) return found;
  if (typeof node.props?.d === 'string') found.push(node);
  for (const child of node.children ?? []) {
    if (typeof child === 'object') collectPaths(child, found);
  }
  return found;
}

describe('CycleRing', () => {
  it('draws one segment per day and colors the filled days', async () => {
    const { toJSON } = await render(
      <CycleRing size={88} filled={14} color="#1abc9c" trackColor="#2c3e50" />,
    );

    const segments = collectPaths(toJSON());
    expect(segments).toHaveLength(21);

    // Group segments by their (renderer-processed) stroke value: 14 filled, 7 track.
    const counts = new Map<string, number>();
    for (const segment of segments) {
      const stroke = JSON.stringify(segment.props.stroke);
      counts.set(stroke, (counts.get(stroke) ?? 0) + 1);
    }
    expect([...counts.values()].sort((a, b) => a - b)).toEqual([7, 14]);
  });
});
