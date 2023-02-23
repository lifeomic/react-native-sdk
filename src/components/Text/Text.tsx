import React from 'react';

import { Text as RNText, TextStyle, StyleSheet } from 'react-native';
import { useBrandConfig } from '../../hooks/useBrandConfig';
import { Variant } from './TextStyles';

interface Props {
  variant?: Variant;
  style?: TextStyle;
  children: React.ReactNode;
}

export function Text({ variant = 'body', style, children }: Props) {
  const { styles } = useBrandConfig();

  return (
    <RNText style={StyleSheet.compose(styles.Text[variant], style)}>
      {children}
    </RNText>
  );
}
