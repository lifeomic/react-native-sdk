import * as baseTheme from './base';

interface Props {
  colors?: Partial<baseTheme.Colors>;
  spacing?: Partial<baseTheme.Spacing>;
  roundness?: number;
}

export class Theme {
  colors: baseTheme.Colors = { ...baseTheme.colors };
  spacing: baseTheme.Spacing = { ...baseTheme.spacing };
  roundness: number;

  constructor({ colors, spacing, roundness }: Props = {}) {
    this.mergeColors(colors || {});
    this.mergeSpacing(spacing || {});
    this.roundness = roundness || baseTheme.roundness;
  }

  mergeColors(colors: Partial<baseTheme.Colors>) {
    Object.assign(this.colors, colors);
  }

  mergeSpacing(spacing: Partial<baseTheme.Spacing>) {
    Object.assign(this.spacing, spacing);
  }
}
