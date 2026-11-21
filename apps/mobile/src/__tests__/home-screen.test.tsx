import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';

import HomeScreen from '@/app/index';
import { AppProviders } from '@/testing/app-providers';

describe('HomeScreen', () => {
  it('shows the brand, hero, 21-day cycle and all four principles', async () => {
    await render(<HomeScreen />, { wrapper: AppProviders });

    expect(screen.getByLabelText('Habit Tracker, Psycho-Cybernetics')).toBeTruthy();
    expect(screen.getByText('Build habits from the inside out.')).toBeTruthy();
    expect(screen.getByText('The 21-day cycle')).toBeTruthy();
    for (const title of [
      'Self-image',
      'Success mechanism',
      '21-day practice',
      'Theater of the mind',
    ]) {
      expect(screen.getByText(title)).toBeTruthy();
    }
  });
});
