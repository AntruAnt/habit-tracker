import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import { createHabit, type Habit, parseHabits, STORAGE_KEY, toggleToday } from '@/lib/habits';

/** Habits kept on the device. Changes are saved straight away. */
export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (active) setHabits(parseHabits(raw));
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const update = useCallback((next: (current: Habit[]) => Habit[]) => {
    setHabits((current) => {
      const value = next(current);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(value)).catch(() => {});
      return value;
    });
  }, []);

  const add = useCallback(
    (name: string) => {
      if (!name.trim()) return;
      update((current) => [...current, createHabit(name)]);
    },
    [update],
  );

  const toggle = useCallback(
    (id: string) => update((current) => current.map((h) => (h.id === id ? toggleToday(h) : h))),
    [update],
  );

  const remove = useCallback(
    (id: string) => update((current) => current.filter((h) => h.id !== id)),
    [update],
  );

  return { habits, loaded, add, toggle, remove };
}
