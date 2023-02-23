import { TextStyle } from 'react-native';
import { Theme } from '../BrandConfigProvider/Theme';

export type Variant = 'body' | 'heading' | 'subHeading';

export class TextStyles {
  body?: TextStyle;
  heading?: TextStyle;
  subHeading?: TextStyle;

  constructor(theme: Theme) {
    const defaultStyles: Partial<TextStyles> = {
      body: {
        color: theme.colors.text,
      },
      heading: {
        color: theme.colors.text,
        fontSize: 18,
        fontWeight: 'bold',
      },
      subHeading: {
        color: theme.colors.text,
        fontSize: 14,
        fontWeight: 'bold',
      },
    };

    this.mergeStyles(defaultStyles);
  }

  mergeStyles(styles: Partial<TextStyles>) {
    Object.assign(this, styles);
  }

  get(variant: Variant, style: TextStyle) {
    return {
      ...this[variant],
      ...style,
    };
  }
}
