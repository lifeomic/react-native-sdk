import React from 'react';
import { ColorValue } from 'react-native';
import { useTheme } from 'react-native-paper';
import Info from './Info';

const Issue = ({ stroke }: { stroke?: ColorValue }) => {
  const theme = useTheme();
  return <Info stroke={stroke ?? theme.colors.error} />;
};

export default Issue;
