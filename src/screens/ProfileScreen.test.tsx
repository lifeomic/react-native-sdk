import React from 'react';
import { render } from '@testing-library/react-native';
import ProfileScreen from './ProfileScreen';
import { useUserProfile, UserProfile } from '../hooks/useUserProfile';

jest.mock('../hooks/useUserProfile', () => ({
  useUserProfile: jest.fn(),
}));

const useUserProfileMock = useUserProfile as jest.Mock;

const mockUserProfile = (profile: UserProfile) => {
  useUserProfileMock.mockReturnValue({
    loading: false,
    data: profile,
  });
};

const exampleProfile: UserProfile = {
  userId: 'userId',
  profile: {
    displayName: 'first last',
    givenName: 'firstName',
    familyName: 'lastName',
    email: 'unit@test.com',
  },
  patientId: 'patientId',
};

test('renders loading indicator initially', async () => {
  useUserProfileMock.mockReturnValue({
    isLoading: true,
    data: undefined,
  });

  const { getByTestId, rerender } = render(<ProfileScreen />);

  useUserProfileMock.mockReturnValue({
    isLoading: false,
    data: undefined, // Still waiting for data
  });

  rerender(<ProfileScreen />);
  expect(getByTestId('activity-indicator-view')).toBeDefined();
});

test('renders profile label/values given user profile', () => {
  mockUserProfile(exampleProfile);

  const { getByText, getByTestId } = render(<ProfileScreen />);
  expect(getByTestId('Username')).toBeDefined();
  expect(getByTestId('First Name')).toBeDefined();
  expect(getByTestId('Last Name')).toBeDefined();
  expect(getByTestId('Email')).toBeDefined();

  expect(getByText(new RegExp(exampleProfile.userId))).toBeDefined();
  expect(getByText(new RegExp(exampleProfile.profile.email))).toBeDefined();
  expect(
    getByText(new RegExp(exampleProfile.profile.familyName!)),
  ).toBeDefined();
  expect(
    getByText(new RegExp(exampleProfile.profile.givenName!)),
  ).toBeDefined();
});

test('does not render fields which are not populated', () => {
  mockUserProfile({
    userId: 'userId',
    profile: {
      email: 'unit@test.com',
    },
    patientId: 'patientId',
  });

  const { queryByTestId } = render(<ProfileScreen />);
  expect(queryByTestId('First Name')).toBeNull();
  expect(queryByTestId('Last Name')).toBeNull();
  expect(queryByTestId('Username')).not.toBeNull();
  expect(queryByTestId('Email')).not.toBeNull();
});
