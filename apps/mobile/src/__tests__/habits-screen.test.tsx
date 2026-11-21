import { describe, expect, it } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';

import HabitsScreen from '@/app/habits';
import { AppProviders } from '@/testing/app-providers';

describe('HabitsScreen', () => {
  it('adds a habit and marks it done today', async () => {
    await render(<HabitsScreen />, { wrapper: AppProviders });

    expect(await screen.findByText('No habits yet. Add the first one above.')).toBeTruthy();
    await fireEvent.changeText(screen.getByLabelText('New habit name'), 'Read 10 pages');
    await fireEvent.press(screen.getByText('Add'));
    expect(screen.getByText('Read 10 pages')).toBeTruthy();
    expect(screen.getByText('Day 0 of 21')).toBeTruthy();

    await fireEvent.press(screen.getByText('Mark done today'));
    expect(screen.getByText('✓ Done today')).toBeTruthy();
    expect(screen.getByText('Day 1 of 21')).toBeTruthy();
  });
});
