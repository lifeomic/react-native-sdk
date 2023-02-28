import { colors as baseColors, spacing as baseSpacing } from './base';
import { Theme } from './Theme';

describe('Theme', () => {
  test('loads defaults', () => {
    const theme = new Theme();

    expect(theme.colors).toStrictEqual(baseColors);
    expect(theme.spacing).toStrictEqual(baseSpacing);
  });

  test('merges custom colors with default', () => {
    expect(baseColors.background).not.toBe('pink');

    const customColors = { background: 'pink' };

    const theme = new Theme({ colors: customColors });

    expect(theme.colors.background).toBe('pink');
    expect(theme.colors.text).toBe(baseColors.text);
  });

  test('merges custom spacing with default', () => {
    expect(baseSpacing.small).not.toBe(42);

    const customSpacing = { small: 42 };

    const theme = new Theme({ spacing: customSpacing });

    expect(theme.spacing.small).toBe(42);
    expect(theme.spacing.large).toBe(baseSpacing.large);
  });
});
