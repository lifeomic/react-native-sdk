import * as React from 'react';

import {
  createNavigationContainerRef,
  NavigationContainer,
  Theme,
} from '@react-navigation/native';
import { useTheme } from 'react-native-paper';
import { useDeveloperConfig } from '../hooks';

export const navigationRef = createNavigationContainerRef();

interface Props {
  children?: React.ReactNode;
}

export function ThemedNavigationContainer({ children }: Props) {
  const theme = useTheme<Theme>();
  const { navigationLinking } = useDeveloperConfig();

  return (
    <NavigationContainer
      theme={theme}
      ref={navigationRef}
      linking={navigationLinking}
    >
      {children}
    </NavigationContainer>
  );
}
