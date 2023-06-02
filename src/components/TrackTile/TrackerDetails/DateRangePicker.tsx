import React, { FC } from 'react';
import { t } from '../../../../lib/i18n';
import { isToday } from 'date-fns';
import { createStyles } from '../../BrandConfigProvider';
import { DatePicker, DatePickerStyles } from './DatePicker';
import { dateFormatters } from '../formatters';
import { View } from 'react-native';
import { useStyles } from '../../../hooks';

export type DateRangePicker = {
  color: string;
  range: {
    start: Date;
    end: Date;
  };
  onChangeRange: (shiftByDays: number) => void;
};

const { shortMonthNumericDay } = dateFormatters;

export const DateRangePicker: FC<DateRangePicker> = (props) => {
  const { range, color, onChangeRange } = props;
  const { styles } = useStyles(defaultStyles);
  return (
    <View style={styles.container}>
      <DatePicker
        backAccessibilityLabel={t(
          'track-tile.previous-weeks-data',
          "Previous week's data",
        )}
        forwardAccessibilityLabel={t(
          'track-tile.next-weeks-data',
          "Next week's data",
        )}
        backValue={-7}
        forwardValue={7}
        dateText={t('track-tile.date-range', {
          defaultValue: '{{start}}-{{end}}',
          start: shortMonthNumericDay(range.start),
          end: shortMonthNumericDay(range.end),
          formatParams: {
            start: shortMonthNumericDay,
            end: shortMonthNumericDay,
          },
        })}
        color={color}
        onChange={onChangeRange}
        iconDisabledCondition={isToday(range.end)}
        styles={styles.datePicker}
      />
    </View>
  );
};

const datePickerStyles: DatePickerStyles | undefined = {};

const defaultStyles = createStyles('TrackTile.DateRangePicker', () => ({
  container: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'column',
    width: '100%',
  },
  datePicker: datePickerStyles,
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}
