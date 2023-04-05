import React, { FC } from 'react';
import { View } from 'react-native';

import { createStyles } from '../BrandConfigProvider';
import { useStyles } from '../BrandConfigProvider/styles/StylesProvider';

export interface WearableRowDetailSection {
  styles?: WearableRowDetailSectionStyles;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export const WearableRowDetailSection: FC<WearableRowDetailSection> = (
  props,
) => {
  const { icon, children, styles: instanceStyles } = props;

  const { styles } = useStyles(defaultStyles, instanceStyles);

  return (
    <View style={styles.iconAndDetails}>
      <View style={styles.iconWrapper}>{icon}</View>
      <View style={styles.sectionDetails}>{children}</View>
    </View>
  );
};

const defaultStyles = createStyles('WearableRowDetailSection', () => ({
  iconAndDetails: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
  },
  iconWrapper: {
    width: 30,
  },
  sectionDetails: {
    flex: 1,
    flexShrink: 1,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type WearableRowDetailSectionStyles = NamedStylesProp<
  typeof defaultStyles
>;
