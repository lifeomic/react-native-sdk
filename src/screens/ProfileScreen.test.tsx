import React from 'react';
import { render } from '@testing-library/react-native';
import { ProfileScreen } from './ProfileScreen';
import { mockUseSession, mockUser } from '../common/testHelpers/mockSession';

test('renders profile label/values given user profile', () => {
  const { getByText, getByTestId } = render(<ProfileScreen />);
  expect(getByTestId('Username')).toBeDefined();
  expect(getByTestId('First Name')).toBeDefined();
  expect(getByTestId('Last Name')).toBeDefined();
  expect(getByTestId('Email')).toBeDefined();

  expect(getByText(new RegExp(mockUser.id))).toBeDefined();
  expect(getByText(new RegExp(mockUser.profile.email))).toBeDefined();
  expect(getByText(new RegExp(mockUser.profile.familyName!))).toBeDefined();
  expect(getByText(new RegExp(mockUser.profile.givenName!))).toBeDefined();
});

test('does not render fields which are not populated', () => {
  mockUseSession({
    user: {
      id: 'userId',
      profile: {
        email: 'unit@test.com',
      },
    },
  });

  const { queryByTestId } = render(<ProfileScreen />);
  expect(queryByTestId('First Name')).toBeNull();
  expect(queryByTestId('Last Name')).toBeNull();
  expect(queryByTestId('Username')).not.toBeNull();
  expect(queryByTestId('Email')).not.toBeNull();
});
