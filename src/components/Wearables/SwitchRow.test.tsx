import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { SwitchRow } from './SwitchRow';

const onValueChange = jest.fn();
const baseProps = {
  title: 'Switch Title',
  value: true,
  onValueChange,
  testID: 'unit-test',
};

describe('SwitchRow', () => {
  it('renders title', () => {
    const { getByText } = render(<SwitchRow {...baseProps} />);
    expect(getByText('Switch Title')).toBeDefined();
  });

  it('renders default ally label', () => {
    const { getAllByA11yLabel } = render(<SwitchRow {...baseProps} />);
    expect(getAllByA11yLabel('Switch Title app switch')).toBeDefined();
  });

  it('renders custom ally label', () => {
    const { getAllByA11yLabel } = render(
      <SwitchRow {...baseProps} accessibilityLabel="custom-label" />,
    );
    expect(getAllByA11yLabel('custom-label')).toBeDefined();
  });

  it('allows value=true', () => {
    const { getByTestId } = render(<SwitchRow {...baseProps} />);
    expect(getByTestId('unit-test-switch').props.value).toEqual(true);
  });

  it('allows value=false', () => {
    const { getByTestId } = render(<SwitchRow {...baseProps} value={false} />);
    expect(getByTestId('unit-test-switch').props.value).toEqual(false);
  });

  it('calls onValueChange when tapped', () => {
    const { getByTestId } = render(<SwitchRow {...baseProps} />);
    fireEvent(getByTestId('unit-test-switch'), 'onValueChange', false);
    expect(onValueChange).toHaveBeenCalled();
  });

  it('does not call onValueChange when tapped if disabled', () => {
    const { getByTestId } = render(
      <SwitchRow {...baseProps} disabled={true} />,
    );
    fireEvent(getByTestId('unit-test-switch'), 'onValueChange', false);
    expect(onValueChange).toHaveBeenCalled();
  });
});
