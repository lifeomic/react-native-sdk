import React, { FC } from 'react';
import { StyleSheet, View } from 'react-native';
import merge from 'lodash/merge';

import { Margin } from './defaultTheme';

export interface WearableRowDetailSection {
  styles?: any;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export const WearableRowDetailSection: FC<WearableRowDetailSection> = (
  props
) => {
  const { icon, children } = props;

  const styles = merge({}, defaultStyles, props.styles);

  return (
    <View style={styles.iconAndDetails}>
      <View style={styles.iconWrapper}>{icon}</View>
      <View style={styles.sectionDetails}>{children}</View>
    </View>
  );
};

export const WearableRowDetailSectionDefaultStyles = {
  iconAndDetails: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: Margin.standard
  },
  iconWrapper: {
    width: 30
  },
  sectionDetails: {
    flex: 1,
    flexShrink: 1
  }
};
const defaultStyles = StyleSheet.create(
  WearableRowDetailSectionDefaultStyles as any
);
