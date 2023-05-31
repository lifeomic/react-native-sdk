import { t } from '../../../../../lib/i18n';

const numberFormatters = {
  numberFormat: (value: number) =>
    t('track-tile.intl-number', '{{ val, number }}', { val: value }),
  numberFormatCompact: (value: number) =>
    t('track-tile.intl-number', '{{ val, number }}', {
      val: value,
      notation: 'compact',
    }),
};

export default numberFormatters;
