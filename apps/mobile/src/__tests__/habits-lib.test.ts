import { describe, expect, it } from '@jest/globals';

import { createHabit, currentStreak, cycleProgress, parseHabits, toggleToday } from '@/lib/habits';

describe('habit helpers', () => {
  it('counts a streak ending today or yesterday', () => {
    const h = { ...createHabit('Read', '2026-11-01'), doneOn: ['2026-11-19', '2026-11-20'] };
    expect(currentStreak(h, '2026-11-21')).toBe(2);
    expect(currentStreak(toggleToday(h, '2026-11-21'), '2026-11-21')).toBe(3);
    expect(currentStreak(h, '2026-11-23')).toBe(0);
  });

  it('caps cycle progress at 21 and handles month boundaries', () => {
    const days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(2026, 9, 10 + i);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });
    const h = { ...createHabit('Walk', days[0]), doneOn: days };
    expect(cycleProgress(h, days[29])).toBe(21);
    expect(currentStreak(h, days[29])).toBe(30);
  });

  it('toggles today on and off', () => {
    const h = createHabit('Meditate', '2026-11-21');
    const on = toggleToday(h, '2026-11-21');
    expect(on.doneOn).toEqual(['2026-11-21']);
    expect(toggleToday(on, '2026-11-21').doneOn).toEqual([]);
  });

  it('ignores malformed stored data', () => {
    expect(parseHabits(null)).toEqual([]);
    expect(parseHabits('not json')).toEqual([]);
    expect(parseHabits('[{"id":1}]')).toEqual([]);
  });
});
