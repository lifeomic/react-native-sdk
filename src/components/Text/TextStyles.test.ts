import { TextStyles } from './TextStyles';
import { Theme } from '../BrandConfigProvider/Theme';

describe('TextStyles', () => {
  test('has defaults', () => {
    const theme = new Theme();
    const textStyles = new TextStyles(theme);

    expect(textStyles.body.color).toBe(theme.colors.text);
  });

  test('can merge custom styles', () => {
    const theme = new Theme();
    const textStyles = new TextStyles(theme);
    const heading = { ...textStyles.heading };

    textStyles.mergeStyles({ heading: { color: 'red' } });

    expect(textStyles.heading).toStrictEqual({ ...heading, color: 'red' });
  });
});
