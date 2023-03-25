import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { UnitPicker, UnitPickerProps } from './UnitPicker';
import { Platform } from 'react-native';

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  const mockComponent = jest.requireActual('react-native/jest/mockComponent');
  delete RN.Picker;
  RN.Picker = mockComponent('@react-native-community/picker/js/Picker');
  RN.Picker.Item = mockComponent(
    '@react-native-community/picker/js/PickerItem',
  );
  return RN;
});
jest.mock('@react-native-community/picker', () => {
  const mockComponent = jest.requireActual('react-native/jest/mockComponent');
  const PickerIOS = mockComponent('@react-native-community/picker/js/Picker');
  PickerIOS.Item = mockComponent(
    '@react-native-community/picker/js/PickerItem',
  );

  return { PickerIOS };
});

const units: UnitPickerProps['units'] = [
  {
    code: 'c1',
    display: 'Unit 1',
    system: 's1',
    target: 1,
    unit: 'u1',
    default: true,
  },
  {
    code: 'c2',
    display: 'Unit 2',
    system: 's2',
    target: 2,
    unit: 'u2',
    default: false,
  },
];

describe('Unit Picker', () => {
  describe('[platform]: default', () => {
    beforeEach(() => {
      Platform.OS = 'android';
    });

    it('should display the current value', async () => {
      const { findByText } = render(
        <UnitPicker value="u1" units={units} onChange={jest.fn()} />,
      );

      expect(await findByText('Unit 1')).toBeDefined();
    });

    it('should allow changing to another value', async () => {
      const onChange = jest.fn();
      const { findByRole } = render(
        <UnitPicker value="u1" units={units} onChange={onChange} />,
      );

      // Simulate Picker Change
      fireEvent(await findByRole('combobox'), 'valueChange', 'u2');

      expect(onChange).toHaveBeenCalledWith('u2');
    });
  });

  describe('[platform]: ios', () => {
    beforeEach(() => {
      Platform.OS = 'ios';
    });

    it('should display the current value', async () => {
      const { findByText } = render(
        <UnitPicker value="u1" units={units} onChange={jest.fn()} />,
      );

      expect(await findByText('Unit 1')).toBeDefined();
    });

    it('should allow changing to another value', async () => {
      const onChange = jest.fn();
      const { findByText, findByRole } = render(
        <UnitPicker value="u1" units={units} onChange={onChange} />,
      );

      fireEvent.press(await findByText('Unit 1'));
      // Simulate Picker Change
      fireEvent(await findByRole('combobox'), 'valueChange', 'u2');
      fireEvent.press(await findByText('Done'));

      expect(onChange).toHaveBeenCalledWith('u2');
    });
  });
});
