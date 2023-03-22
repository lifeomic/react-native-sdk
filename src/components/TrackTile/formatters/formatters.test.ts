import i18n from '@i18n';
import { dateFormatters, numberFormatters } from '.';

describe('dateFormatters', () => {
  const date = new Date(2020, 11, 1, 0);
  beforeEach(() => {
    i18n.changeLanguage('en');
  });
  test.each`
    format                                 | result
    ${dateFormatters.dateFormat}           | ${'12/1/2020'}
    ${dateFormatters.shortMonthNumericDay} | ${'Dec 1'}
    ${dateFormatters.shortWeekday}         | ${'Tue'}
    ${dateFormatters.longDate}             | ${'December 1, 2020'}
  `(
    'convert date $format',
    ({
      format,
      result,
    }: {
      format: (date: Date) => string;
      result: string;
    }) => {
      expect(format(date)).toEqual(result);
    },
  );
});

describe('numberFormatters', () => {
  const number = 1234560.789;
  beforeEach(() => {
    i18n.changeLanguage('en');
  });

  test.each`
    format                           | result
    ${numberFormatters.numberFormat} | ${'1,234,560.789'}
  `(
    'convert number $format',
    ({
      format,
      result,
    }: {
      format: (number: number) => string;
      result: string;
    }) => {
      expect(format(number)).toEqual(result);
    },
  );
});
