import { TextStyle } from 'react-native';
import { Theme } from '../BrandConfigProvider/Theme';

export type Variant = 'body' | 'heading' | 'subHeading';

export class TextStyles {
  body: TextStyle = {};
  heading: TextStyle = {};
  subHeading: TextStyle = {};

  private _variants: Variant[] = ['body', 'heading', 'subHeading'];

  constructor(theme: Theme) {
    const defaultStyles: Partial<TextStyles> = {
      body: {
        color: theme.colors.text,
      },
      heading: {
        color: theme.colors.text,
        fontSize: 24,
        fontWeight: 'bold',
      },
      subHeading: {
        color: theme.colors.text,
        fontSize: 18,
        fontWeight: 'bold',
      },
    };

    this.mergeStyles(defaultStyles);
  }

  mergeStyles(styles: Partial<TextStyles>) {
    this._variants.forEach((variant) => {
      Object.assign(this[variant], styles[variant]);
    });
  }
}
