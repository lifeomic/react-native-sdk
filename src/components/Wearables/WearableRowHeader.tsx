import React, { FC } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import merge from 'lodash/merge';

export interface WearableRowHeaderProps {
  testID: string;
  title: string;
  icon?: React.ReactNode;
  styles?: any;
}

export const WearableRowHeader: FC<WearableRowHeaderProps> = (props) => {
  const { testID, title, icon } = props;
  const styles = merge({}, defaultStyles, props.styles);

  return (
    <View testID={testID} style={styles.container}>
      {icon && <View style={styles.iconWrapper}>{icon}</View>}
      <View testID={`${testID}-header-label`} style={styles.textWrapper}>
        <Text style={styles.headerText}>{title}</Text>
      </View>
    </View>
  );
};

export const WearableRowHeaderDefaultStyles = {
  container: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerText: {
    fontWeight: 'bold'
  },
  iconWrapper: {
    width: 34,
    marginStart: -5
  },
  textWrapper: {
    flex: 1
  }
};
const defaultStyles = StyleSheet.create(WearableRowHeaderDefaultStyles as any);
