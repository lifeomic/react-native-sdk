import { I18nManager, View } from 'react-native';
import React, { Dispatch, FC, SetStateAction, useCallback } from 'react';
import { t } from '../../../../lib/i18n';
import { Tracker, UnitType } from '../services/TrackTileService';
import { addDays, format, isToday } from 'date-fns';
import { unitDisplay } from './unit-display';
import { createStyles, useIcons } from '../../BrandConfigProvider';
import { useStyles } from '../../../hooks';
import { IconButton, Text, useTheme } from 'react-native-paper';

export type DatePickerProps = {
  dateRange: {
    start: Date;
    end: Date;
  };
  tracker: Tracker;
  unit: UnitType;
  target: number;
  color: string;
  onChange: Dispatch<
    SetStateAction<{
      start: Date;
      end: Date;
    }>
  >;
};

export const DatePicker: FC<DatePickerProps> = (props) => {
  const { tracker, dateRange, unit, target, onChange, color } = props;
  const { styles } = useStyles(defaultStyles);
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

  const shiftRangeByDays = useCallback(
    (step: number) => () => {
      onChange((range) => ({
        start: addDays(range.start, step),
        end: addDays(range.end, step),
      }));
    },
    [onChange],
  );

  return (
    <>
      <View
        style={[
          styles.buttonContainer,
          { justifyContent: 'space-between', backgroundColor: color },
        ]}
      >
        <IconButton
          style={styles.iconButton}
          icon={TriangleBack}
          accessibilityLabel={t(
            'track-tile.go-to-previous-day',
            'Go to previous day',
          )}
          onPress={shiftRangeByDays(-1)}
        />
        <IconButton
          style={styles.iconButton}
          icon={
            isToday(dateRange.start) ? TriangleForwardDisabled : TriangleForward
          }
          disabled={isToday(dateRange.start)}
          accessibilityLabel={t('track-tile.go-to-next-day', 'Go to next day')}
          onPress={shiftRangeByDays(1)}
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.text} variant="titleMedium">
          {isToday(dateRange.start)
            ? t('track-tile.todays-units', {
                defaultValue: "Today's {{unit}}",
                unit: unitDisplay({
                  tracker,
                  unit,
                  value: target,
                  skipInterpolation: true,
                }),
              })
            : format(dateRange.start, 'iiii, MMMM d')}
        </Text>
      </View>
    </>
  );
};

const defaultStyles = createStyles('TrackTile.DatePicker', (theme) => ({
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: theme.spacing.medium,
    alignItems: 'center',
    borderRadius: 8,
    width: '90%',
  },
  textContainer: {
    position: 'absolute',
    marginVertical: theme.spacing.medium - 4,
    width: 270,
    borderRadius: 8,
    height: 48,
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
