import React from 'react';
import { render } from '@testing-library/react-native';
import ProfileImage from './ProfileImage';

test('renders with specified imageUri', () => {
  const user = {
    userId: 'testuser',
    profile: {
      displayName: 'Joe Shmo',
      picture: 'http://some-profile-pic',
    },
  };

  const imageUri = 'http://some-image-uri';

  const screen = render(<ProfileImage imageUri={imageUri} user={user} />);
  const image = screen.getByTestId('profile-image');
  expect(image.props.source).toEqual({ uri: imageUri });
});

test('renders with user.profile.picture when imageUri is undefined', () => {
  const profilePicUri = 'http://some-profile-pic';
  const user = {
    userId: 'testuser',
    profile: {
      displayName: 'Joe Shmo',
      picture: profilePicUri,
    },
  };

  const imageUri = undefined;

  const screen = render(<ProfileImage imageUri={imageUri} user={user} />);
  const image = screen.getByTestId('profile-image');
  expect(image.props.source).toEqual({ uri: profilePicUri });
});

test('initials displayed when images not provided', () => {
  const user = {
    userId: 'testuser',
    profile: {
      displayName: 'Xavier Xanders',
      picture: undefined,
    },
  };
  const imageUri = undefined;

  const screen = render(<ProfileImage imageUri={imageUri} user={user} />);
  expect(screen.queryAllByTestId('profile-image').length).toEqual(0);
  expect(screen.queryByText('XX')).toBeDefined();
});
