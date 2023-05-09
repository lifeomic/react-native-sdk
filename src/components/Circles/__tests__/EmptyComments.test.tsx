import React from 'react';
import { render } from '@testing-library/react-native';
import { EmptyComments } from '../EmptyComments';

describe('EmptyComments', () => {
  test('renders the component', () => {
    const { getByText } = render(<EmptyComments />);

    expect(getByText('No comments yet.')).toBeDefined();
    expect(getByText('Be the first!')).toBeDefined();
  });
});
