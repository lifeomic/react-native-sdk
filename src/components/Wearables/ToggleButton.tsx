import React, { FC } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import merge from 'lodash/merge';
import { Colors, Margin } from './defaultTheme';

export interface ToggleButtonProps {
  testID: string;
  title: string;
  accessibilityLabel: string;
  onPress: () => void;
  enabled: boolean;
  icon?: React.ReactNode;
  disabled?: boolean;
  styles?: any;
}

export const ToggleButton: FC<ToggleButtonProps> = (props) => {
  const {
    accessibilityLabel,
    disabled,
    icon,
    onPress,
    testID,
    title,
    enabled,
  } = props;

  const styles = merge({}, defaultStyles, props.styles);

  return (
    <View style={styles.toggleButtonWrapper}>
      <TouchableOpacity
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        disabled={disabled}
        style={[
          styles.toggleButton,
          enabled ? styles.toggleOffButton : undefined,
        ]}
      >
        {icon && <View style={styles.iconWrapper}>{icon}</View>}
        <Text
          style={[
            styles.toggleText,
            enabled ? styles.toggleOffText : undefined,
          ]}
        >
          {title}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export const ToggleButtonDefaultStyles = {
  toggleButtonWrapper: {
    marginBottom: Margin.small,
    marginTop: Margin.standard,
  },
  toggleButton: {
    height: 40,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: Colors.connectButtonBorder,
    borderWidth: 1,
  },
  toggleOffButton: {
    backgroundColor: Colors.disconnectBackground,
    borderWidth: 0,
  },
  toggleText: {
    fontWeight: '600',
  },
  toggleOffText: {
    color: 'white',
  },
  iconWrapper: {
    marginRight: Margin.standard,
  },
};
const defaultStyles = StyleSheet.create(ToggleButtonDefaultStyles as any);
