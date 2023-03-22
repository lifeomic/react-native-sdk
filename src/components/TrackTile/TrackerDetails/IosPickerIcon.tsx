import { View, StyleSheet } from 'react-native';
import React from 'react';
import Chevron from '../icons/Chevron';
import { StylesProp, useStyleOverrides } from '../styles';

export const IosPickerIcon = () => {
  const styles = useStyleOverrides(defaultStyles);

  return (
    <View style={styles.iosPickerIcon}>
      <Chevron direction="up" strokeWidth={2} />
      <Chevron direction="down" strokeWidth={2} />
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
