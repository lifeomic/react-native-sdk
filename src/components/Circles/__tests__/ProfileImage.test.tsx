import React from 'react';
import { ProfileImage } from '../ProfileImage';
import { fireEvent, render } from '@testing-library/react-native';

describe('ProfileImage', () => {
  it('renders picture first', () => {
    const pictureMock = jest.fn();
    const displayNameMock = jest.fn();
    const fallbackIconMock = jest.fn();

    const post = {
      author: {
        profile: {
          get picture() {
            pictureMock();
            return 'someUrl';
          },
          get displayName() {
            displayNameMock();
            return 'someName';
          },
        },
      },
    };

    render(
      <ProfileImage
        post={post as any}
        size={24}
        fallbackIcon={fallbackIconMock}
      />,
    );

    expect(pictureMock).toHaveBeenCalled();
    expect(displayNameMock).not.toHaveBeenCalled();
    expect(fallbackIconMock).not.toHaveBeenCalled();
  });
  it('renders initials on picture load error', async () => {
    const displayNameMock = jest.fn();
    const post = {
      author: {
        profile: {
          picture: 'some.invalid.url',
          get displayName() {
            displayNameMock();
            return 'John Doe';
          },
        },
      },
    };

    const { findByTestId } = render(
      <ProfileImage post={post as any} size={24} fallbackIcon={jest.fn()} />,
    );
    const image = await findByTestId('profile-image');
    fireEvent(image, 'error');
    expect(displayNameMock).toHaveBeenCalled();
  });
  it('renders name (initials) if picture is not present', () => {
    const displayNameMock = jest.fn();
    const fallbackIconMock = jest.fn();

    const post = {
      author: {
        profile: {
          get displayName() {
            displayNameMock();
            return 'someName';
          },
        },
      },
    };

    render(
      <ProfileImage
        post={post as any}
        size={24}
        fallbackIcon={fallbackIconMock}
      />,
    );

    expect(displayNameMock).toHaveBeenCalled();
    expect(fallbackIconMock).not.toHaveBeenCalled();
  });
  it('renders fallback icon if picture and displayName is missing', () => {
    const fallbackIconMock = jest.fn();

    const post = {
      author: {
        profile: {},
      },
    };

    render(
      <ProfileImage
        post={post as any}
        size={24}
        fallbackIcon={fallbackIconMock}
      />,
    );

    expect(fallbackIconMock).toHaveBeenCalled();
  });
});
