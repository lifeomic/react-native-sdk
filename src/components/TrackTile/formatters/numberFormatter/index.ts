import { t } from 'i18next';

const numberFormatters = {
  numberFormat: (value: number) =>
    t('track-tile.intl-number', '{{ val, number }}', { val: value }),
};

export default numberFormatters;
