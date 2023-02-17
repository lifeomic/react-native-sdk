import React from 'react';
import { render } from '@testing-library/react-native';
import { ProfileScreen } from './ProfileScreen';
import { useUser, User } from '../hooks/useUser';

jest.mock('../hooks/useUser', () => ({
  useUser: jest.fn(),
}));

const useUserMock = useUser as jest.Mock;

const mockUser = (user: User) => {
  useUserMock.mockReturnValue({
    loading: false,
    data: user,
  });
};

const exampleProfile: User = {
  id: 'userId',
  profile: {
    displayName: 'first last',
    givenName: 'firstName',
    familyName: 'lastName',
    email: 'unit@test.com',
  },
};

test('renders loading indicator initially', async () => {
  useUserMock.mockReturnValue({
    isLoading: true,
    data: undefined,
  });

  const { getByTestId, rerender } = render(<ProfileScreen />);

  useUserMock.mockReturnValue({
    isLoading: false,
    data: undefined, // Still waiting for data
  });

  rerender(<ProfileScreen />);
  expect(getByTestId('activity-indicator-view')).toBeDefined();
});

test('renders profile label/values given user profile', () => {
  mockUser(exampleProfile);

  const { getByText, getByTestId } = render(<ProfileScreen />);
  expect(getByTestId('Username')).toBeDefined();
  expect(getByTestId('First Name')).toBeDefined();
  expect(getByTestId('Last Name')).toBeDefined();
  expect(getByTestId('Email')).toBeDefined();

  expect(getByText(new RegExp(exampleProfile.id))).toBeDefined();
  expect(getByText(new RegExp(exampleProfile.profile.email))).toBeDefined();
  expect(
    getByText(new RegExp(exampleProfile.profile.familyName!)),
  ).toBeDefined();
  expect(
    getByText(new RegExp(exampleProfile.profile.givenName!)),
  ).toBeDefined();
});

test('does not render fields which are not populated', () => {
  mockUser({
    id: 'userId',
    profile: {
      email: 'unit@test.com',
    },
  });

  const { queryByTestId } = render(<ProfileScreen />);
  expect(queryByTestId('First Name')).toBeNull();
  expect(queryByTestId('Last Name')).toBeNull();
  expect(queryByTestId('Username')).not.toBeNull();
  expect(queryByTestId('Email')).not.toBeNull();
});
