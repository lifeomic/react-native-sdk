import * as baseTheme from './base';

interface Props {
  colors?: Partial<baseTheme.Colors>;
  spacing?: Partial<baseTheme.Spacing>;
}

export class Theme {
  colors: baseTheme.Colors = { ...baseTheme.colors };
  spacing: baseTheme.Spacing = { ...baseTheme.spacing };

  constructor({ colors, spacing }: Props = {}) {
    this.mergeColors(colors || {});
    this.mergeSpacing(spacing || {});
  }

  mergeColors(colors: Partial<baseTheme.Colors>) {
    Object.assign(this.colors, colors);
  }

  mergeSpacing(spacing: Partial<baseTheme.Spacing>) {
    Object.assign(this.spacing, spacing);
  }
}
