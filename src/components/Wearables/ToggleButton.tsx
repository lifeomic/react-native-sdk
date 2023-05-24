import React, { FC } from 'react';
import { Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
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
  loading?: boolean;
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
    loading = false,
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
        <View style={styles.loadingWrapper}>
          <ActivityIndicator
            size="small"
            animating={loading}
            hidesWhenStopped
            testID={`${testID}-loader`}
          />
        </View>
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
    marginBottom: theme.spacing.extraSmall,
    marginTop: theme.spacing.medium,
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
  loadingWrapper: {
    width: 0,
    alignItems: 'flex-end',
    transform: [{ translateX: -theme.spacing.extraSmall }],
    opacity: 1,
  },
  iconWrapper: {
    marginRight: theme.spacing.medium,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type ToggleButtonStyles = NamedStylesProp<typeof defaultStyles>;
