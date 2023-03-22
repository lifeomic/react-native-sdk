import React, { FC, useMemo } from 'react';
import { Platform, StyleSheet, Text as RNText, TextProps } from 'react-native';
import { composeStyles, StylesProp } from './compose-styles';

export const fontWeights = StyleSheet.create({
  regular: {
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'sans-serif',
      },
    }),
  },
  medium: {
    ...Platform.select({
      ios: {
        fontFamily: 'System',
        fontWeight: '500',
      },
      android: {
        fontFamily: 'sans-serif-medium',
      },
    }),
  },
  light: {
    ...Platform.select({
      ios: {
        fontFamily: 'System',
        fontWeight: '300',
      },
      android: {
        fontFamily: 'sans-serif-light',
      },
    }),
  },
  semibold: {
    ...Platform.select({
      ios: {
        fontFamily: 'System',
        fontWeight: '600',
      },
      android: {
        fontFamily: 'sans-serif-medium',
      },
    }),
  },
  bold: {
    ...Platform.select({
      ios: {
        fontFamily: 'System',
        fontWeight: '700',
      },
      android: {
        fontFamily: 'sans-serif',
      },
    }),
    fontWeight: 'bold',
  },
});

export type FontWeights = StylesProp<typeof fontWeights>;

export const FontOverridesContext = React.createContext<FontWeights>(
  undefined as any,
);
export const FontOverridesProvider = FontOverridesContext.Provider;

export const useFontOverrides = () => {
  const ctx = React.useContext(FontOverridesContext);

  return useMemo(() => composeStyles(fontWeights, ctx), [ctx]);
};

type Props = TextProps & { variant?: keyof typeof fontWeights };

export const Text: FC<Props> = ({ variant = 'regular', style, ...props }) => {
  const fonts = useFontOverrides();
  return <RNText {...props} style={[fonts[variant], style]} />;
};
