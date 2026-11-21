/**
 * Habit model and pure helpers. Habits are stored only on the device (AsyncStorage);
 * nothing is sent to a server.
 */

export const CYCLE_DAYS = 21;
export const STORAGE_KEY = 'habit-tracker/habits/v1';

export type Habit = {
  id: string;
  name: string;
  /** Local date the habit was added, as YYYY-MM-DD. */
  createdOn: string;
  /** Local dates (YYYY-MM-DD) on which the habit was done. */
  doneOn: string[];
};

/** Local calendar date as YYYY-MM-DD. */
export function dateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function previousDay(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  return dateKey(new Date(y, m - 1, d - 1));
}

export function isDoneOn(habit: Habit, key: string): boolean {
  return habit.doneOn.includes(key);
}

/**
 * Consecutive days done, ending today (or yesterday, if today is not done yet,
 * so a streak is not shown as broken before the day is over).
 */
export function currentStreak(habit: Habit, today: string = dateKey()): number {
  const done = new Set(habit.doneOn);
  let day = done.has(today) ? today : previousDay(today);
  let streak = 0;
  while (done.has(day)) {
    streak += 1;
    day = previousDay(day);
  }
  return streak;
}

/** Days of the current 21-day cycle completed (0–21). */
export function cycleProgress(habit: Habit, today: string = dateKey()): number {
  return Math.min(currentStreak(habit, today), CYCLE_DAYS);
}

export function toggleToday(habit: Habit, today: string = dateKey()): Habit {
  const doneOn = isDoneOn(habit, today)
    ? habit.doneOn.filter((d) => d !== today)
    : [...habit.doneOn, today].sort();
  return { ...habit, doneOn };
}

export function createHabit(name: string, today: string = dateKey()): Habit {
  return {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    name: name.trim().slice(0, 60),
    createdOn: today,
    doneOn: [],
  };
}

/** Parses stored JSON defensively; anything malformed becomes an empty list. */
export function parseHabits(raw: string | null): Habit[] {
  if (!raw) return [];
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.filter(
      (h): h is Habit =>
        typeof h === 'object' &&
        h !== null &&
        typeof h.id === 'string' &&
        typeof h.name === 'string' &&
        typeof h.createdOn === 'string' &&
        Array.isArray(h.doneOn),
    );
  } catch {
    return [];
  }
}
