import i18n from '@i18n';
import {
  getPreferredUnitType,
  getStoredUnitType,
  convertToPreferredUnit,
  convertToStoreUnit,
  convertToISONumber
} from './convert-value';

const exampleTracker = {
  resourceType: 'Procedure' as any,
  units: [
    {
      code: 'min',
      default: true,
      display: 'min',
      system: 'system',
      target: 60,
      unit: 'min'
    },
    {
      code: 'h',
      default: false,
      display: 'hrs',
      system: 'system',
      target: 1,
      unit: 'hour'
    }
  ],
  unit: 'min'
};

describe('Tracker Value Unit Conversions', () => {
  describe('getPreferredUnitType', () => {
    it('should return preferred unit type', async () => {
      const prefUnit = getPreferredUnitType(exampleTracker);
      expect(prefUnit.code).toEqual('min');
    });

    it('defaults to default unit', async () => {
      const prefUnit = getPreferredUnitType({
        ...exampleTracker,
        unit: 'unknown-unit'
      });
      expect(prefUnit.code).toEqual('min');
    });

    it('for edge case of unknown preferred unit and no default, uses first unit', async () => {
      const value = convertToPreferredUnit(60, {
        ...exampleTracker,
        units: [
          {
            code: 'min',
            default: false, // NOTE: no default!
            display: 'min',
            system: 'system',
            target: 60,
            unit: 'min'
          },
          {
            code: 'h',
            default: false,
            display: 'hrs',
            system: 'system',
            target: 1,
            unit: 'hour'
          }
        ],
        unit: 'unknown'
      });
      expect(value).toEqual(1); // min
    });

    it('leaves value alone for unknown conversion', async () => {
      const value = convertToPreferredUnit(1, {
        ...exampleTracker,
        resourceType: 'Observation',
        units: [
          {
            code: 'c1',
            default: true,
            display: 'c1',
            system: 'system',
            target: 60,
            unit: 'c1'
          },
          {
            code: 'c2',
            default: false,
            display: 'c2',
            system: 'system',
            target: 1,
            unit: 'c2'
          }
        ],
        unit: 'c1'
      });
      expect(value).toEqual(1);
    });
  });

  describe('getStoredUnitType', () => {
    it('is always seconds for Procedure', async () => {
      const storeUnit = getStoredUnitType(exampleTracker);
      expect(storeUnit.code).toEqual('s');
    });

    it('uses default for Observation', async () => {
      const storeUnit = getStoredUnitType({
        ...exampleTracker,
        resourceType: 'Observation'
      });
      expect(storeUnit.code).toEqual('min');
    });

    it('uses first unit for Observation, if no default set', async () => {
      const storeUnit = getStoredUnitType({
        ...exampleTracker,
        resourceType: 'Observation',
        units: [
          {
            code: 'kg',
            default: false,
            display: 'kg',
            system: 'system',
            target: 10,
            unit: 'kg'
          },
          {
            code: 'lb',
            default: false,
            display: 'lbs',
            system: 'system',
            target: 10,
            unit: 'lb'
          }
        ]
      });
      expect(storeUnit.code).toEqual('kg');
    });
  });

  describe('convertToPreferredUnit', () => {
    it('should convert s to min', async () => {
      const value = convertToPreferredUnit(60, exampleTracker);
      expect(value).toEqual(1);
    });

    it('should convert s to hr', async () => {
      const value = convertToPreferredUnit(60 * 60, {
        ...exampleTracker,
        unit: 'hour'
      });
      expect(value).toEqual(1);
    });

    it('for edge case of unknown preferred unit, should use default value', async () => {
      const value = convertToPreferredUnit(60, {
        ...exampleTracker,
        unit: 'unknown'
      });
      expect(value).toEqual(1); // min
    });
  });

  describe('convertToStoreUnit', () => {
    it('should convert min to s', async () => {
      const value = convertToStoreUnit(1, exampleTracker);
      expect(value).toEqual(60);
    });

    it('should convert h to s', async () => {
      const value = convertToStoreUnit(1, {
        ...exampleTracker,
        unit: 'hour'
      });
      expect(value).toEqual(60 * 60);
    });

    it('should leave seconds alone', async () => {
      const value = convertToStoreUnit(1, {
        ...exampleTracker,
        units: [
          {
            code: 's',
            default: true,
            display: 's',
            system: 'system',
            target: 60,
            unit: 'seconds'
          },
          {
            code: 'min',
            default: false,
            display: 'min',
            system: 'system',
            target: 1,
            unit: 'min'
          }
        ],
        unit: 'second'
      });
      expect(value).toEqual(1);
    });
  });

  describe('convertToISONumber', () => {
    const number = 1234560.789;
    test.each`
      language | formatNumber
      ${'en'}  | ${'1,234,560.789'}
      ${'ar'}  | ${'١٬٢٣٤٬٥٦٠٫٧٨٩'}
      ${'es'}  | ${'1.234.560,789'}
      ${'de'}  | ${'1.234.560,789'}
      ${'fr'}  | ${'1 234 560,789'}
      ${'pt'}  | ${'1.234.560,789'}
      ${'tr'}  | ${'1.234.560,789'}
    `('convert $language numbers', ({ language, formatNumber }) => {
      i18n.changeLanguage(language);
      const isoNumber = convertToISONumber(formatNumber);
      expect(isoNumber).toEqual(number.toString());
      expect(parseFloat(isoNumber)).toEqual(number);
      expect(Number(isoNumber)).toEqual(number);
    });
  });
});
