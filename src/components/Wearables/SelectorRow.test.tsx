import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { SelectorRow } from './SelectorRow';

const onSelected = jest.fn();
const baseProps = {
  id: 'id',
  title: 'Row Title',
  onSelected,
  testID: 'unit-test',
};

describe('SelectorRow', () => {
  it('renders title', () => {
    const { getByText } = render(<SelectorRow {...baseProps} />);
    expect(getByText('Row Title')).toBeDefined();
  });

  it('has accessibility label with title', () => {
    const { getByA11yLabel } = render(<SelectorRow {...baseProps} />);
    expect(getByA11yLabel('Row Title')).toBeDefined();
  });

  it('allows for selected prop', () => {
    expect(() =>
      render(<SelectorRow {...baseProps} selected={true} />),
    ).not.toThrow();
  });

  it('calls onSelected when tapped', () => {
    const { getByText } = render(<SelectorRow {...baseProps} />);

    fireEvent.press(getByText('Row Title'));

    expect(onSelected).toHaveBeenCalledWith('id');
  });

  it('does not call onSelected when tapped if disabled', () => {
    const { getByText } = render(
      <SelectorRow {...baseProps} disabled={true} />,
    );

    fireEvent.press(getByText('Row Title'));

    expect(onSelected).not.toHaveBeenCalled();
  });
});
