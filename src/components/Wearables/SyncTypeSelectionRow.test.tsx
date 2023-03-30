import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import {
  SyncTypeSelectionRow,
  SyncTypeSelectionRowProps
} from '../src/SyncTypeSelectionRow';

const onUpdate = jest.fn();
const baseProps: SyncTypeSelectionRowProps = {
  onUpdate,
  selectedEHRId: 'ehr1',
  syncTypeTitle: 'Sync Type',
  syncTypeOptions: [
    {
      ehrId: 'ehr1',
      ehrType: 'ehr1',
      name: 'Wearable 1',
      enabled: true
    },
    {
      ehrId: 'ehr2',
      ehrType: 'ehr2',
      name: 'Wearable 2',
      enabled: true
    }
  ],
  testID: 'unit-test'
};

describe('SyncTypeSelectionRow', () => {
  it('renders title and currently selected wearable', () => {
    const { getByText } = render(<SyncTypeSelectionRow {...baseProps} />);
    expect(getByText('Sync Type')).toBeDefined();
    expect(getByText('Wearable 1')).toBeDefined();
  });

  it('renders ally labels and currently selected wearable', () => {
    const { getByA11yLabel } = render(<SyncTypeSelectionRow {...baseProps} />);
    expect(getByA11yLabel('Sync Type')).toBeDefined();
    expect(getByA11yLabel('Wearable 1 - Sync Type')).toBeDefined();
  });

  it('allows selecting new wearable for sync type', () => {
    const { getByText } = render(<SyncTypeSelectionRow {...baseProps} />);
    fireEvent.press(getByText('Sync Type'));

    // NOTE: selections are now visible
    expect(getByText('Wearable 2')).toBeDefined();

    fireEvent.press(getByText('Wearable 2'));

    expect(onUpdate).toHaveBeenCalledWith('ehr2');
  });

  it('does not explode if given invalid selectedEHRId', () => {
    const { getByText } = render(
      <SyncTypeSelectionRow {...baseProps} selectedEHRId="ehr3" />
    );
    expect(getByText('Sync Type')).toBeDefined();
  });
});
