import React, { FC } from 'react';
import { Text, StyleSheet, Switch, View, SwitchProps } from 'react-native';
import merge from 'lodash/merge';

export interface SwitchRowProps extends SwitchProps {
  title: string;
  styles?: any;
}

export const SwitchRow: FC<SwitchRowProps> = (props) => {
  const { testID, title, accessibilityLabel } = props;
  const styles = merge({}, defaultStyles, props.styles);

  return (
    <View testID={testID} style={styles.container}>
      <View testID={`${testID}-switch-label`} style={styles.textWrapper}>
        <Text style={styles.headerText}>{title}</Text>
      </View>
      <Switch
        {...props}
        testID={`${testID}-switch`}
        accessibilityLabel={accessibilityLabel || `${title} app switch`}
      />
    </View>
  );
};

export const SwitchRowDefaultStyles = {
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    fontWeight: 'bold',
  },
  textWrapper: {
    flex: 1,
  },
};
const defaultStyles = StyleSheet.create(SwitchRowDefaultStyles as any);
