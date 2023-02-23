import * as defaultTheme from '../../themes/default';

interface Props {
  colors?: defaultTheme.Colors;
  spacing?: defaultTheme.Spacing;
}

export class Theme {
  colors: defaultTheme.Colors = defaultTheme.colors;
  spacing: defaultTheme.Spacing = defaultTheme.spacing;

  constructor({ colors, spacing }: Props = {}) {
    this.mergeColors(colors || {});
    this.mergeSpacing(spacing || {});
  }

  mergeColors(colors: Partial<defaultTheme.Colors>) {
    Object.assign(this.colors, colors);
  }

  mergeSpacing(spacing: Partial<defaultTheme.Spacing>) {
    Object.assign(this.spacing, spacing);
  }
}
