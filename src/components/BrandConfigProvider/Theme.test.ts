import {
  colors as defaultColors,
  spacing as defaultSpacing,
} from '../../themes/default';
import { Theme } from './Theme';

describe('Theme', () => {
  test('loads defaults', () => {
    const theme = new Theme();

    expect(theme.colors).toStrictEqual(defaultColors);
    expect(theme.spacing).toStrictEqual(defaultSpacing);
  });

  test('merges custom colors with default', () => {
    expect(defaultColors.background).not.toBe('pink');

    const customColors = { background: 'pink' };

    const theme = new Theme({ colors: customColors });

    expect(theme.colors.background).toBe('pink');
    expect(theme.colors.text).toBe(defaultColors.text);
  });

  test('merges custom spacing with default', () => {
    expect(defaultSpacing.small).not.toBe(42);

    const customSpacing = { small: 42 };

    const theme = new Theme({ spacing: customSpacing });

    expect(theme.spacing.small).toBe(42);
    expect(theme.spacing.large).toBe(defaultSpacing.large);
  });
});
