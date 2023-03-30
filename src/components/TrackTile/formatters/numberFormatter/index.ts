import i18n from '@i18n';

const numberFormatters = {
  numberFormat: (value: number) =>
    i18n.t('track-tile.intl-number', { val: value, ns: 'track-tile-ui' }),
};

export default numberFormatters;
