import { View, TouchableOpacity } from 'react-native';
import { Text } from '../styles';
import React, { Dispatch, FC, SetStateAction, useCallback } from 'react';
import { t } from '../../../../lib/i18n';
import { Tracker, UnitType } from '../services/TrackTileService';
import { addDays, format, isToday } from 'date-fns';
import { unitDisplay } from './unit-display';
import { createStyles, useIcons } from '../../BrandConfigProvider';
import { useStyles } from '../../../hooks';

export type DatePickerProps = {
  dateRange: {
    start: Date;
    end: Date;
  };
  tracker: Tracker;
  color: string;
  unit: UnitType;
  target: number;
  onChange: Dispatch<
    SetStateAction<{
      start: Date;
      end: Date;
    }>
  >;
};

export const DatePicker: FC<DatePickerProps> = (props) => {
  const { tracker, dateRange, unit, target, color, onChange } = props;
  const { ChevronLeft, ChevronRight } = useIcons();
  const { styles } = useStyles(defaultStyles);

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
    <View
      style={[
        styles.container,
        { justifyContent: 'space-between', paddingHorizontal: 35 },
      ]}
    >
      <TouchableOpacity
        accessibilityLabel={t(
          'track-tile.go-to-previous-day',
          'Go to previous day',
        )}
        onPress={shiftRangeByDays(-1)}
      >
        <ChevronLeft color={color} />
      </TouchableOpacity>
      <Text>
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
      <TouchableOpacity
        accessibilityLabel={t('track-tile.go-to-next-day', 'Go to next day')}
        disabled={isToday(dateRange.start)}
        onPress={shiftRangeByDays(1)}
      >
        <ChevronRight color={isToday(dateRange.start) ? '#959AB4' : color} />
      </TouchableOpacity>
    </View>
  );
};

const defaultStyles = createStyles('TrackTile.DatePicker', () => ({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
    alignItems: 'center',
    width: '100%',
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}
