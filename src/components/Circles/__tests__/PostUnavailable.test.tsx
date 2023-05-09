import React from 'react';
import { render } from '@testing-library/react-native';
import { PostUnavailable } from '../PostUnavailable';

describe('PostUnavailable', () => {
  test('renders the component', () => {
    const { getByText } = render(<PostUnavailable />);

    expect(getByText('Oh No!')).toBeDefined();
    expect(getByText('Something went wrong loading this post.')).toBeDefined();
    expect(getByText('Please try again later.')).toBeDefined();
  });
});
