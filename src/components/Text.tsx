import React from 'react';
import { Text as RNText, TextStyle } from 'react-native';
import { useBrandConfig } from '../hooks/useBrandConfig';

interface Props {
  variant?: Variant;
  style?: TextStyle;
  children: React.ReactNode;
}

export function Text({ variant = 'base', style, children }: Props) {
  const { theme, styles } = useBrandConfig();

  const mergedStyles = {
    ...defaultTextStyles(theme).base,
    ...styles.Text?.base,
    ...styles.Text?.[variant],
    ...style,
  };

  return <RNText style={mergedStyles}>{children}</RNText>;
}

export interface TextStyles {
  base?: TextStyle;
  body?: TextStyle;
  heading?: TextStyle;
  subHeading?: TextStyle;
}

type Variant = keyof TextStyles;

export const defaultTextStyles = (theme: any) => {
  return {
    base: {
      color: theme.colors.text,
    },
    body: {
      fontSize: 12,
    },
    heading: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    subHeading: {
      fontSize: 14,
      fontWeight: 'bold',
    },
  };
};
