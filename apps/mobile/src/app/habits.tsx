import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '@/components/card';
import { CycleRing } from '@/components/cycle-ring';
import { Shape, Typography } from '@/constants/app-theme';
import { BottomTabInset, MaxContentWidth, Spacing, WebNavBarHeight } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useHabits } from '@/hooks/use-habits';
import { currentStreak, CYCLE_DAYS, cycleProgress, dateKey, type Habit, isDoneOn } from '@/lib/habits';

export default function HabitsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const colorScheme = useColorScheme();
  const { habits, loaded, add, toggle, remove } = useHabits();
  const [name, setName] = useState('');
  const today = dateKey();

  const coveredTop = Platform.OS === 'web' ? WebNavBarHeight : insets.top;
  const submit = () => {
    if (!name.trim()) return;
    add(name);
    setName('');
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: coveredTop + Spacing.four,
            paddingBottom: insets.bottom + BottomTabInset + Spacing.four,
          },
        ]}>
        <View style={styles.column}>
          <View style={styles.header}>
            <Text accessibilityRole="header" style={[styles.title, { color: theme.textHigh }]}>
              My habits
            </Text>
            <Text style={[styles.lead, { color: theme.textMedium }]}>
              Tick each habit once a day. 21 days in a row complete a cycle.
            </Text>
          </View>

          <Card style={styles.addCard}>
            <TextInput
              value={name}
              onChangeText={setName}
              onSubmitEditing={submit}
              placeholder="New habit, e.g. 10 minutes of reading"
              placeholderTextColor={theme.textMedium}
              accessibilityLabel="New habit name"
              maxLength={60}
              returnKeyType="done"
              style={[styles.input, { color: theme.cardText, borderColor: theme.cardBorder }]}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: !name.trim() }}
              disabled={!name.trim()}
              onPress={submit}
              style={({ pressed }) => [
                styles.addButton,
                { backgroundColor: theme.accent, opacity: !name.trim() ? 0.5 : pressed ? 0.8 : 1 },
              ]}>
              <Text style={styles.addButtonText}>Add</Text>
            </Pressable>
          </Card>

          {loaded && habits.length === 0 && (
            <Text style={[styles.empty, { color: theme.textMedium }]}>
              No habits yet. Add the first one above.
            </Text>
          )}

          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              today={today}
              onToggle={() => toggle(habit.id)}
              onRemove={() => remove(habit.id)}
            />
          ))}

          <Text style={[styles.note, { color: theme.textMedium }]}>
            Your habits are saved only on this device.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function HabitCard({
  habit,
  today,
  onToggle,
  onRemove,
}: {
  habit: Habit;
  today: string;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const theme = useAppTheme();
  const [confirming, setConfirming] = useState(false);
  const done = isDoneOn(habit, today);
  const progress = cycleProgress(habit, today);
  const streak = currentStreak(habit, today);
  const cardText = { color: theme.cardText };

  return (
    <Card style={styles.habitCard}>
      <View style={styles.habitRow}>
        <CycleRing size={64} filled={progress} color={theme.accent} trackColor={theme.cardBorder}>
          <Text maxFontSizeMultiplier={1.2} style={[styles.ringNumber, cardText]}>
            {progress}
          </Text>
        </CycleRing>
        <View style={styles.habitText}>
          <Text style={[styles.habitName, cardText]}>{habit.name}</Text>
          <Text style={[styles.habitMeta, { color: theme.textMedium }]}>
            {progress >= CYCLE_DAYS
              ? `Cycle complete · ${streak}-day streak`
              : `Day ${progress} of ${CYCLE_DAYS}`}
          </Text>
        </View>
      </View>
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: done }}
          accessibilityLabel={`${habit.name}: done today`}
          onPress={onToggle}
          style={({ pressed }) => [
            styles.doneButton,
            done
              ? { backgroundColor: theme.accent, borderColor: theme.accent }
              : { borderColor: theme.accent },
            pressed && { opacity: 0.8 },
          ]}>
          <Text style={[styles.doneText, { color: done ? '#ffffff' : theme.accent }]}>
            {done ? '✓ Done today' : 'Mark done today'}
          </Text>
        </Pressable>
        {confirming ? (
          <View style={styles.confirmRow}>
            <Pressable accessibilityRole="button" onPress={onRemove} hitSlop={8}>
              <Text style={[styles.link, { color: '#e74c3c' }]}>Delete</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => setConfirming(false)} hitSlop={8}>
              <Text style={[styles.link, { color: theme.textMedium }]}>Keep</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Remove ${habit.name}`}
            onPress={() => setConfirming(true)}
            hitSlop={8}>
            <Text style={[styles.link, { color: theme.textMedium }]}>Remove</Text>
          </Pressable>
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { alignItems: 'center' },
  column: {
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.three,
    gap: Spacing.three,
  },
  header: { gap: Spacing.two },
  title: { ...Typography.title1 },
  lead: { ...Typography.body },
  addCard: { flexDirection: 'row', gap: Spacing.two, padding: Spacing.three, alignItems: 'center' },
  input: {
    ...Typography.body,
    flex: 1,
    borderWidth: 1,
    borderRadius: Shape.medium,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    minHeight: 44,
  },
  addButton: {
    borderRadius: Shape.medium,
    paddingHorizontal: Spacing.three,
    minHeight: 44,
    justifyContent: 'center',
  },
  addButtonText: { ...Typography.headline, color: '#ffffff' },
  empty: { ...Typography.subheadline, textAlign: 'center', paddingVertical: Spacing.four },
  habitCard: { padding: Spacing.three, gap: Spacing.three },
  habitRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  habitText: { flex: 1, gap: Spacing.one },
  habitName: { ...Typography.headline },
  habitMeta: { ...Typography.subheadline },
  ringNumber: { ...Typography.headline, textAlign: 'center' },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  doneButton: {
    borderWidth: 1.5,
    borderRadius: Shape.full,
    paddingHorizontal: Spacing.three,
    minHeight: 40,
    justifyContent: 'center',
  },
  doneText: { ...Typography.subheadline, fontWeight: 600 },
  confirmRow: { flexDirection: 'row', gap: Spacing.three },
  link: { ...Typography.subheadline, fontWeight: 600 },
  note: { ...Typography.caption, textAlign: 'center' },
});
