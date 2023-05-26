import { View } from 'react-native';
import React from 'react';
import { createStyles, useIcons } from '../../BrandConfigProvider';
import { useStyles } from '../../../hooks';

export const IosPickerIcon = () => {
  const { ChevronUp, ChevronDown } = useIcons();
  const { styles } = useStyles(defaultStyles);

  return (
    <View style={styles.container}>
      <ChevronUp />
      <ChevronDown />
    </View>
  );
};

const defaultStyles = createStyles('TrackTile.iosPickerIcon', () => ({
  container: {
    flex: 1,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}
