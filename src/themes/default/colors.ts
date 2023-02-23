// TODO: Replace with our real default colors
const palette = {
  white: '#FFFFFF',
  black: '#000000',

  neutral200: '#F4F2F1',
  neutral300: '#D7CEC9',
  neutral400: '#B6ACA6',
  neutral600: '#564E4A',
  neutral800: '#191015',

  primary500: '#C76542',

  secondary300: '#9196B9',

  accent300: '#FDD495',

  error100: '#F2D6CD',
  error500: '#C03403',
};

export const colors = {
  /**
   * Prefer semantic names over use of the palette directly
   */
  palette,
  /**
   * A helper for making something see-thru
   */
  transparent: 'rgba(0, 0, 0, 0)',
  /**
   * The default text color in many components
   */
  text: palette.neutral800,
  /**
   * Secondary text information
   */
  textDim: palette.neutral600,
  /**
   * The default color of the screen background
   */
  background: palette.neutral200,
  /**
   * The default border color
   */
  border: palette.neutral400,
  /**
   * The main tinting color
   */
  tint: palette.primary500,
  /**
   * A subtle color used for lines
   */
  separator: palette.neutral300,
  /**
   * Error messages
   */
  error: palette.error500,
  /**
   * Error Background
   */
  errorBackground: palette.error100,
};

export type Colors = Partial<typeof colors>;
