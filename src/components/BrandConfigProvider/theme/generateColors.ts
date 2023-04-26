import {
  argbFromHex,
  themeFromSourceColor,
  Theme,
} from '@material/material-color-utilities';
import Color from 'color';

export function generateColors(color: string) {
  const theme = themeFromSourceColor(argbFromHex(color));

  const colorTheme = lightColorTheme(theme);

  const mainColors = toRgbStrings(colorTheme);
  const elevation = prepareElevations(colorTheme);
  const surfaceColors = prepareSurfaceColors(colorTheme, theme.palettes);

  return {
    ...mainColors,
    elevation,
    ...surfaceColors,
  };
}

type ColorTheme = ReturnType<typeof lightColorTheme>;

const lightColorTheme = (theme: Theme) => {
  return theme.schemes.light.toJSON();
};

const toRgbStrings = (theme: ColorTheme) => {
  return Object.fromEntries(
    Object.entries(theme).map(([key, value]) => [
      key,
      Color(value).rgb().string(),
    ]),
  );
};

const prepareElevations = (colorTheme: ColorTheme) => {
  let elevations: Record<string, string> = {
    level0: 'transparent',
  };

  const { primary, surface } = colorTheme;

  const elevationLevels = [0.05, 0.08, 0.11, 0.12, 0.14];

  elevationLevels.forEach((level, i) => {
    elevations[`level${i + 1}`] = Color(surface)
      .mix(Color(primary), Number(level))
      .rgb()
      .string();
  });

  return elevations;
};

const prepareSurfaceColors = (
  colorTheme: ColorTheme,
  palettes: Theme['palettes'],
) => {
  const surfaceDisabled = Color(colorTheme.onSurface)
    .alpha(0.12)
    .rgb()
    .string();

  const onSurfaceDisabled = Color(colorTheme.onSurface)
    .alpha(0.38)
    .rgb()
    .string();

  const backdrop = Color(palettes.neutralVariant.tone(20))
    .alpha(0.4)
    .rgb()
    .string();

  return {
    surfaceDisabled,
    onSurfaceDisabled,
    backdrop,
  };
};
