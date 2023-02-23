import React from 'react';
import { Text as RNText, TextStyle } from 'react-native';
import { useBrandConfig } from '../../hooks/useBrandConfig';
import { defaultTextStyles } from './default';
import { Variant } from './types';

interface Props {
  variant?: Variant;
  style?: TextStyle;
  children: React.ReactNode;
}

export function Text({ variant = 'body', style, children }: Props) {
  const { theme, styles } = useBrandConfig();

  const mergedStyles = {
    ...defaultTextStyles(theme).base,
    ...styles.Text?.base,
    ...styles.Text?.[variant],
    ...style,
  };

  return <RNText style={mergedStyles}>{children}</RNText>;
}
