import React from 'react';
import { Text as RNText, TextStyle, StyleSheet } from 'react-native';
import { useBrandConfig } from 'src/hooks/useBrandConfig';
import { colors } from '../theme';

interface Props {
  variant?: Variant;
  style?: TextStyle;
  children: React.ReactNode;
}

export function Text({ variant = 'base', style, children }: Props) {
  const { styles } = useBrandConfig();

  const mergedStyles = StyleSheet.flatten<TextStyle>([
    defaultTextStyles.base,
    styles.Text?.base,
    styles.Text?.[variant],
    style,
  ]);

  return <RNText style={mergedStyles}>{children}</RNText>;
}

export interface TextStyles {
  base?: TextStyle;
  body?: TextStyle;
  heading?: TextStyle;
  subHeading?: TextStyle;
}

type Variant = keyof TextStyles;

export const defaultTextStyles: TextStyles = {
  base: {
    color: colors.text,
  },
};
