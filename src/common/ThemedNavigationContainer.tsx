import * as React from 'react';

import { NavigationContainer, Theme } from '@react-navigation/native';
import { useTheme } from 'react-native-paper';

interface Props {
  children?: React.ReactNode;
}

export function ThemedNavigationContainer({ children }: Props) {
  const theme = useTheme<Theme>();

  return <NavigationContainer theme={theme}>{children}</NavigationContainer>;
}
