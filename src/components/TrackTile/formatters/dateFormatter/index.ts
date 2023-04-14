import { t } from 'i18next';
import {
  shortMonthNumericDay,
  shortWeekday,
  longDate,
  shortMonthNumericDayWithYear,
} from './dateFormatters';

const format = (date: Date, dateOptions?: Intl.DateTimeFormatOptions) => {
  return t('track-tile.intl-date-time', '{{val, datetime}}', {
    val: date,
    formatParams: {
      val: dateOptions,
    },
  });
};

const dateFormatters = {
  dateFormat: (date: Date) => format(date),
  shortWeekday: (date: Date) => format(date, shortWeekday),
  shortMonthNumericDay: (date: Date) => format(date, shortMonthNumericDay),
  shortMonthNumericDayWithYear: (date: Date) =>
    format(date, shortMonthNumericDayWithYear),
  longDate: (date: Date) => format(date, longDate),
};

export default dateFormatters;
