import React from 'react';
import { render } from '@testing-library/react-native';
import { ActivityIndicatorView } from './ActivityIndicatorView';

describe('ActivityIndicatorView', () => {
  test('renders with default test id', () => {
    const screen = render(<ActivityIndicatorView message="Still waiting" />);

    expect(screen.getByTestId('activity-indicator-view')).toBeDefined();
  });

  test('renders with message', async () => {
    const screen = render(
      <ActivityIndicatorView message="Still waiting" timeOutMilliseconds={1} />,
    );

    expect(await screen.findByText('Still waiting')).toBeDefined();
  });
});
