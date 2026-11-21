import { describe, expect, it } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { ThemeToggle } from '@/components/theme-toggle';
import { AppProviders } from '@/testing/app-providers';

describe('ThemeToggle', () => {
  it('starts in dark mode and switches to light mode when pressed', async () => {
    await render(<ThemeToggle />, { wrapper: AppProviders });

    await fireEvent.press(screen.getByRole('button', { name: 'Switch to light mode' }));

    expect(screen.getByRole('button', { name: 'Switch to dark mode' })).toBeTruthy();
  });
});
