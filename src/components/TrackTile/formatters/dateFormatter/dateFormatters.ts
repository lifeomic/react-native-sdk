type DateTimeFormatOptions = Intl.DateTimeFormatOptions;

export const shortWeekday: DateTimeFormatOptions = { weekday: 'short' };

export const shortMonthNumericDay: DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
};

export const longDate: DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
};

export const shortMonthNumericDayWithYear: DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};
