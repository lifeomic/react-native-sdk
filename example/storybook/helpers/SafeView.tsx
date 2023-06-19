import React from 'react';

import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
  children: React.ReactNode;
}

export function SafeView({ children }: Props) {
  return (
    <SafeAreaView
      edges={['top', 'bottom', 'left', 'right']}
      style={{ flex: 1 }}
    >
      {children}
    </SafeAreaView>
  );
}
