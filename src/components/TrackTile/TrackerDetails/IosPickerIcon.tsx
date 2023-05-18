import { View, StyleSheet } from 'react-native';
import React from 'react';
import { StylesProp, useStyleOverrides } from '../styles';
import { useIcons } from '../../BrandConfigProvider';

export const IosPickerIcon = () => {
  const { ChevronUp, ChevronDown } = useIcons();
  const styles = useStyleOverrides(defaultStyles);

  return (
    <View style={styles.iosPickerIcon}>
      <ChevronUp />
      <ChevronDown />
    </View>
  );
};

declare module './TrackerDetails' {
  interface Styles extends StylesProp<typeof defaultStyles> {}
}

const defaultStyles = StyleSheet.create({
  iosPickerIcon: {
    flex: 1,
  },
});
