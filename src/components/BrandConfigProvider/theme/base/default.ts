/**
 * Base (wireFrame-like) color scheme
 *
 * The base color scheme uses a popular design system to
 * dynamically generate all color tokens from the HTML color:
 * "gray" - #808080	- rgb(128,128,128) - This is available in the
 * theme colors object as primarySource.
 *
 * We are also using this file as a test fixture to make sure
 * the generateColors function works perfectly.
 */
export const colors = {
  primarySource: 'rgb(128,128,128)',

  primary: 'rgb(0, 104, 116)',
  onPrimary: 'rgb(255, 255, 255)',
  primaryContainer: 'rgb(151, 240, 255)',
  onPrimaryContainer: 'rgb(0, 31, 36)',

  secondary: 'rgb(74, 98, 103)',
  onSecondary: 'rgb(255, 255, 255)',
  secondaryContainer: 'rgb(205, 231, 236)',
  onSecondaryContainer: 'rgb(5, 31, 35)',

  tertiary: 'rgb(82, 94, 125)',
  onTertiary: 'rgb(255, 255, 255)',
  tertiaryContainer: 'rgb(218, 226, 255)',
  onTertiaryContainer: 'rgb(14, 27, 55)',

  error: 'rgb(186, 26, 26)',
  onError: 'rgb(255, 255, 255)',
  errorContainer: 'rgb(255, 218, 214)',
  onErrorContainer: 'rgb(65, 0, 2)',

  background: 'rgb(250, 253, 253)',
  onBackground: 'rgb(25, 28, 29)',

  surface: 'rgb(250, 253, 253)',
  onSurface: 'rgb(25, 28, 29)',
  surfaceVariant: 'rgb(219, 228, 230)',
  onSurfaceVariant: 'rgb(63, 72, 74)',

  outline: 'rgb(111, 121, 122)',
  outlineVariant: 'rgb(191, 200, 202)',

  shadow: 'rgb(0, 0, 0)',
  scrim: 'rgb(0, 0, 0)',
  inverseSurface: 'rgb(46, 49, 50)',
  inverseOnSurface: 'rgb(239, 241, 241)',
  inversePrimary: 'rgb(79, 216, 235)',

  elevation: {
    level0: 'transparent',
    level1: 'rgb(238, 246, 246)',
    level2: 'rgb(230, 241, 242)',
    level3: 'rgb(223, 237, 238)',
    level4: 'rgb(220, 235, 237)',
    level5: 'rgb(215, 232, 234)',
  },

  surfaceDisabled: 'rgba(25, 28, 29, 0.12)',
  onSurfaceDisabled: 'rgba(25, 28, 29, 0.38)',

  backdrop: 'rgba(41, 50, 52, 0.4)',
};

export type Colors = typeof colors;

export const spacing = {
  micro: 2,
  tiny: 4,
  extraSmall: 8,
  small: 12,
  medium: 16,
  large: 24,
  extraLarge: 32,
  huge: 48,
  massive: 64,
};
