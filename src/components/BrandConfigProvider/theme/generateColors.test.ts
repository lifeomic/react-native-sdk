import { generateColors } from './generateColors';
import * as defaultTheme from './base/default';

describe('generateTheme', () => {
  it('should generate the theme from a primaryColor', () => {
    const primaryColor = '#808080';
    const colors = generateColors(primaryColor);

    expect(colors).toEqual(defaultTheme.colors);
  });
});
