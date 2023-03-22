import i18n from '@i18n';
import {
  shortMonthNumericDay,
  shortWeekday,
  longDate,
  shortMonthNumericDayWithYear,
} from './dateFormatters';

const format = (date: Date, dateOptions?: Intl.DateTimeFormatOptions) => {
  return i18n.t('intlDateTime', {
    val: date,
    ns: 'track-tile-ui',
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
