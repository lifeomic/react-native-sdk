import { I18nManager, View } from 'react-native';
import React, { FC, useCallback } from 'react';
import { createStyles, useIcons } from '../../BrandConfigProvider';
import { useStyles } from '../../../hooks';
import { IconButton, Text, useTheme } from 'react-native-paper';

export type DatePickerProps = {
  styles?: DatePickerStyles;
  color: string;
  backAccessibilityLabel: string;
  forwardAccessibilityLabel: string;
  dateText: string;
  onChange: (shiftByDays: number) => void;
  backValue: number;
  forwardValue: number;
  iconDisabledCondition: boolean;
};

export const DatePicker: FC<DatePickerProps> = (props) => {
  const {
    styles: styleOverrides,
    onChange,
    backValue,
    forwardValue,
    color,
    backAccessibilityLabel,
    forwardAccessibilityLabel,
    dateText,
    iconDisabledCondition,
  } = props;
  const { styles } = useStyles(defaultStyles, styleOverrides);
  const { TriangleFilled } = useIcons();
  const { isRTL } = I18nManager.getConstants();
  const theme = useTheme();
  const TriangleBack = useCallback(
    () => (
      <TriangleFilled
        direction={isRTL ? 'rtl' : 'ltr'}
        color={theme.colors.background}
        w={10}
      />
    ),
    [TriangleFilled, isRTL, theme],
  );

  const TriangleForwardDisabled = useCallback(
    () => (
      <TriangleFilled
        direction={isRTL ? 'ltr' : 'rtl'}
        color={theme.colors.shadow}
        w={10}
      />
    ),
    [TriangleFilled, isRTL, theme],
  );

  const TriangleForward = useCallback(
    () => (
      <TriangleFilled
        direction={isRTL ? 'ltr' : 'rtl'}
        color={theme.colors.background}
        w={10}
      />
    ),
    [TriangleFilled, isRTL, theme],
  );

  return (
    <View style={[styles.buttonContainer, { backgroundColor: color }]}>
      <IconButton
        style={styles.iconButton}
        icon={TriangleBack}
        accessibilityLabel={backAccessibilityLabel}
        onPress={() => {
          onChange(backValue);
        }}
      />
      <View style={styles.textContainer}>
        <Text style={styles.text} variant="titleMedium">
          {dateText}
        </Text>
      </View>
      <IconButton
        style={styles.iconButton}
        icon={iconDisabledCondition ? TriangleForwardDisabled : TriangleForward}
        disabled={iconDisabledCondition}
        accessibilityLabel={forwardAccessibilityLabel}
        onPress={() => onChange(forwardValue)}
      />
    </View>
  );
};

const defaultStyles = createStyles('TrackTile.DatePicker', (theme) => ({
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: theme.spacing.medium,
    alignItems: 'center',
    borderRadius: 8,
    height: 48,
    elevation: 1,
    shadowOpacity: 0.15,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  textContainer: {
    width: '70%',
    marginVertical: theme.spacing.medium - 4,
    height: '100%',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
  text: { textAlign: 'center' },
  iconButton: { borderRadius: 8, margin: 0 },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type DatePickerStyles = NamedStylesProp<typeof defaultStyles>;
