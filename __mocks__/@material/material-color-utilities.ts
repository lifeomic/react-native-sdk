/**
 * Currently mocking instead of testing until this is fixed:
 * https://github.com/material-foundation/material-color-utilities/issues/35
 *
 * Google promises next release.
 */

// Input color #808080
export const argbFromHex = jest.fn().mockReturnValue(4286611584);

export const themeFromSourceColor = jest.fn().mockReturnValue({
  source: 4286611584,
  schemes: {
    light: {
      toJSON: jest.fn().mockReturnValue({
        primary: 4278216820,
        onPrimary: 4294967295,
        primaryContainer: 4288147711,
        onPrimaryContainer: 4278198052,
        secondary: 4283064935,
        onSecondary: 4294967295,
        secondaryContainer: 4291684332,
        onSecondaryContainer: 4278525731,
        tertiary: 4283588221,
        onTertiary: 4294967295,
        tertiaryContainer: 4292535039,
        onTertiaryContainer: 4279114551,
        error: 4290386458,
        onError: 4294967295,
        errorContainer: 4294957782,
        onErrorContainer: 4282449922,
        background: 4294639101,
        onBackground: 4279835677,
        surface: 4294639101,
        onSurface: 4279835677,
        surfaceVariant: 4292601062,
        onSurfaceVariant: 4282337354,
        outline: 4285495674,
        outlineVariant: 4290758858,
        shadow: 4278190080,
        scrim: 4278190080,
        inverseSurface: 4281217330,
        inverseOnSurface: 4293915121,
        inversePrimary: 4283422955,
      }),
    },
    dark: {
      toJSON: jest.fn().mockReturnValue({
        primary: 4283422955,
        onPrimary: 4278203965,
        primaryContainer: 4278210392,
        onPrimaryContainer: 4288147711,
        secondary: 4289842128,
        onSecondary: 4280038456,
        secondaryContainer: 4281551695,
        onSecondaryContainer: 4291684332,
        tertiary: 4290430698,
        onTertiary: 4280561741,
        tertiaryContainer: 4282074724,
        onTertiaryContainer: 4292535039,
        error: 4294948011,
        onError: 4285071365,
        errorContainer: 4287823882,
        onErrorContainer: 4294948011,
        background: 4279835677,
        onBackground: 4292994019,
        surface: 4279835677,
        onSurface: 4292994019,
        surfaceVariant: 4282337354,
        onSurfaceVariant: 4290758858,
        outline: 4287206036,
        outlineVariant: 4282337354,
        shadow: 4278190080,
        scrim: 4278190080,
        inverseSurface: 4292994019,
        inverseOnSurface: 4281217330,
        inversePrimary: 4278216820,
      }),
    },
  },
  palettes: {
    primary: {
      hue: 209.49382556955806,
      chroma: 48,
      cache: [],
      tone: jest.fn(),
    },
    secondary: {
      hue: 209.49382556955806,
      chroma: 16,
      cache: [],
      tone: jest.fn(),
    },
    tertiary: {
      hue: 269.49382556955806,
      chroma: 24,
      cache: [],
      tone: jest.fn(),
    },
    neutral: {
      hue: 209.49382556955806,
      chroma: 4,
      cache: [],
      tone: jest.fn(),
    },
    neutralVariant: {
      hue: 209.49382556955806,
      chroma: 8,
      cache: [],
      tone: jest.fn(),
    },
    error: {
      hue: 25,
      chroma: 84,
      cache: [],
      tone: jest.fn(),
    },
  },
  customColors: [],
});
