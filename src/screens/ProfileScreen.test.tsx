import React from 'react';
import { render } from '@testing-library/react-native';
import { FhirProfileView, ProfileScreen } from './ProfileScreen';
import { useUser } from '../hooks/useUser';
import { useMe } from '../hooks/useMe';
import { User } from '../types';
import { Patient } from 'fhir/r3';

jest.mock('../hooks/useUser', () => ({
  useUser: jest.fn(),
}));

jest.mock('../hooks/useMe', () => ({
  useMe: jest.fn(),
}));

const useUserMock = useUser as jest.Mock;
const useMeMock = jest.mocked(useMe);

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
  expect(getByTestId('activity-indicator-view')).toBeDefined();

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

describe('FhirProfileView', () => {
  test('renders correct data', () => {
    const subject: Patient = {
      resourceType: 'Patient',
      name: [{ family: 'Smith', given: ['John'] }],
      gender: 'female',
      address: [
        { line: ['123 Main St'], city: 'Indianapolis', postalCode: '12345' },
      ],
      telecom: [
        { system: 'phone', value: '0987654321' },
        { system: 'email', value: 'john.smith@lifeomic.com' },
      ],
    };
    useMeMock.mockReturnValue({
      data: [
        {
          name: undefined,
          projectId: 'test-project',
          subjectId: 'test-subject',
          subject,
        },
      ],
    } as any);

    const { queryByText } = render(<FhirProfileView />);

    expect(queryByText('John')).not.toBeNull();
    expect(queryByText('Smith')).not.toBeNull();
    expect(queryByText('123 Main St')).not.toBeNull();
    expect(queryByText('Indianapolis')).not.toBeNull();
    expect(queryByText('12345')).not.toBeNull();
    expect(queryByText('female')).not.toBeNull();
    expect(queryByText('0987654321')).not.toBeNull();
    expect(queryByText('john.smith@lifeomic.com')).not.toBeNull();
  });
});
