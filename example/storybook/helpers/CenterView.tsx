import React from 'react';

import { View, ViewStyle } from 'react-native';

interface Props {
  children: React.ReactNode;
}

export function CenterView({ children }: Props) {
  return <View style={container}>{children}</View>;
}

const container: ViewStyle = {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
};
