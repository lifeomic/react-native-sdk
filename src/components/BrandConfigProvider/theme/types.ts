import merge from 'lodash/merge';
import { DefaultTheme as reactNavigationDefault } from '@react-navigation/native';
import { DefaultTheme as MD3DefaultTheme } from 'react-native-paper';

const combinedDefaultTheme = merge({}, MD3DefaultTheme, reactNavigationDefault);

type CombinedDefaultTheme = typeof combinedDefaultTheme;

export interface MaterialColorTokens {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;
  background: string;
  onBackground: string;
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;
  outline: string;
  outlineVariant: string;
  shadow: string;
  scrim: string;
  inverseSurface: string;
  inverseOnSurface: string;
  inversePrimary: string;
}

export interface PaperExtraColorTokens {
  elevation: {
    level0: string;
    level1: string;
    level2: string;
    level3: string;
    level4: string;
    level5: string;
  };
  surfaceDisabled: string;
  onSurfaceDisabled: string;
  backdrop: string;
}

export type Colors = MaterialColorTokens &
  PaperExtraColorTokens & {
    // Actual color used to generate dynamic colors
    primarySource: string;
  };

export type Spacing = {
  micro: number;
  tiny: number;
  extraSmall: number;
  small: number;
  medium: number;
  large: number;
  extraLarge: number;
  huge: number;
  massive: number;
};

export type Theme = CombinedDefaultTheme & {
  colors: Colors;
  spacing: Spacing;
};
