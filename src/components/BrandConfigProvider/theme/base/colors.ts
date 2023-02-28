const palette = {
  neutral200: '#F4F2F1',
  neutral300: '#D7CEC9',
  neutral400: '#B6ACA6',
  neutral600: '#564E4A',
  neutral800: '#191015',

  blueGray200: '#B0BEC5',
  blueGray800: '#37474F',

  error100: '#F2D6CD',
  error500: '#C03403',
};

export const colors = {
  white: '#FFFFFF',
  black: '#000000',

  text: palette.neutral800,
  textDim: palette.neutral600,
  border: palette.neutral400,
  separator: palette.neutral300,
  background: palette.neutral200,

  primary: palette.blueGray800,
  secondary: palette.blueGray200,

  error: palette.error500,
  errorBackground: palette.error100,
};

export type Colors = typeof colors;
