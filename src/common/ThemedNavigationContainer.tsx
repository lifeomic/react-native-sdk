import * as React from 'react';

import {
  createNavigationContainerRef,
  NavigationContainer,
  Theme,
} from '@react-navigation/native';
import { useTheme } from 'react-native-paper';

export const navigationRef = createNavigationContainerRef();

interface Props {
  children?: React.ReactNode;
}

export function ThemedNavigationContainer({ children }: Props) {
  const theme = useTheme<Theme>();

  return (
    <NavigationContainer theme={theme} ref={navigationRef}>
      {children}
    </NavigationContainer>
  );
}
