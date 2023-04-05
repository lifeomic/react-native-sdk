import React, { FC } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { createStyles } from '../BrandConfigProvider';
import { useStyles } from '../BrandConfigProvider/styles/StylesProvider';

export interface ToggleButtonProps {
  testID: string;
  title: string;
  accessibilityLabel: string;
  onPress: () => void;
  enabled: boolean;
  icon?: React.ReactNode;
  disabled?: boolean;
  styles?: ToggleButtonStyles;
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
    styles: instanceStyles,
  } = props;

  const { styles } = useStyles(defaultStyles, instanceStyles);

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

const defaultStyles = createStyles('ToggleButton', (theme) => ({
  toggleButtonWrapper: {
    marginBottom: 8,
    marginTop: 16,
  },
  toggleButton: {
    height: 40,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: theme.colors.outline,
    borderWidth: 1,
  },
  toggleOffButton: {
    backgroundColor: theme.colors.error,
    borderWidth: 0,
  },
  toggleText: {
    fontWeight: '600',
  },
  toggleOffText: {
    color: 'white',
  },
  iconWrapper: {
    marginRight: 16,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type ToggleButtonStyles = NamedStylesProp<typeof defaultStyles>;
