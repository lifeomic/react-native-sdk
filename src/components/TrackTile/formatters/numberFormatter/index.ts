import { t } from '@i18n';

const numberFormatters = {
  numberFormat: (value: number) => t('track-tile.intl-number', { val: value }),
};

export default numberFormatters;
