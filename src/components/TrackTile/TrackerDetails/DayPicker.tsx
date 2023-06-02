import React, { Dispatch, FC, SetStateAction, useCallback } from 'react';
import { t } from '../../../../lib/i18n';
import { Tracker, UnitType } from '../services/TrackTileService';
import { addDays, format, isToday } from 'date-fns';
import { unitDisplay } from './unit-display';
import { createStyles } from '../../BrandConfigProvider';
import { DatePicker, DatePickerStyles } from './DatePicker';
import { useStyles } from '../../../hooks';

export type DayPickerProps = {
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
  style?: DayPickerStyles;
};

export const DayPicker: FC<DayPickerProps> = (props) => {
  const { tracker, dateRange, unit, target, onChange, color, style } = props;
  const { styles } = useStyles(defaultStyles, style);

  const shiftRangeByDays = useCallback(
    (step: number) => {
      onChange((range) => ({
        start: addDays(range.start, step),
        end: addDays(range.end, step),
      }));
    },
    [onChange],
  );

  return (
    <DatePicker
      backAccessibilityLabel={t(
        'track-tile.go-to-previous-day',
        'Go to previous day',
      )}
      forwardAccessibilityLabel={t(
        'track-tile.go-to-next-day',
        'Go to next day',
      )}
      backValue={-1}
      forwardValue={1}
      dateText={
        isToday(dateRange.start)
          ? t('track-tile.todays-units', {
              defaultValue: "Today's {{unit}}",
              unit: unitDisplay({
                tracker,
                unit,
                value: target,
                skipInterpolation: true,
              }),
            })
          : format(dateRange.start, 'iiii, MMMM d')
      }
      color={color}
      onChange={shiftRangeByDays}
      iconDisabledCondition={isToday(dateRange.start)}
      styles={styles.datePicker}
    />
  );
};

const datePickerStyles: DatePickerStyles | undefined = {};

const defaultStyles = createStyles('TrackTile.DayPicker', () => ({
  datePicker: datePickerStyles,
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type DayPickerStyles = NamedStylesProp<typeof defaultStyles>;
