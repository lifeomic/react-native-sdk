import React from 'react';

import { ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CenterView({ children, style }: Props) {
  return (
    <SafeAreaView
      edges={['top', 'bottom', 'left', 'right']}
      style={[container, style]}
    >
      {children}
    </SafeAreaView>
  );
}

const container: ViewStyle = {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
};
