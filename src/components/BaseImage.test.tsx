import React from 'react';
import { render } from '@testing-library/react-native';
import BaseImage from './BaseImage';

test('renders', () => {
  const screen = render(
    <BaseImage options={{ uri: undefined }} testID="base-image" />,
  );
  expect(screen.getByTestId('base-image')).toBeDefined();
});
