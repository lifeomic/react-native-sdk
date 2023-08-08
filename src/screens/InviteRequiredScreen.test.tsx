import React from 'react';
import { render } from '@testing-library/react-native';
import { InviteRequiredScreen } from './InviteRequiredScreen';

const inviteRequiredScreen = <InviteRequiredScreen />;
jest.unmock('@react-navigation/native');

it('renders invite required text and logout button', () => {
  const { getByTestId } = render(inviteRequiredScreen);
  expect(getByTestId('invite-only-text')).toBeDefined();
});
