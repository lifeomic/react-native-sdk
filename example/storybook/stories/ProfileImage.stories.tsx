import React from 'react';
import { TextStyle, ViewStyle } from 'react-native';
import { storiesOf } from '@storybook/react-native';
import { text, object } from '@storybook/addon-knobs';
import ProfileImage from '../../../src/components/ProfileImage';

const stockPhoto =
  'https://st2.depositphotos.com/1662991/8837/i/450/depositphotos_88370500-stock-photo-mechanic-wearing-overalls.jpg';
const stockPhoto2 =
  'https://w7.pngwing.com/pngs/419/675/png-transparent-happy-person-hand-photography-people.png';
storiesOf('ProfileImage', module).add('demo', () => {
  // Knobs:
  const imageUri = text(
    'Image URI (Uses Profile Picture as fallback)',
    stockPhoto,
  );
  const profilePicture = text(
    'Profile Picture (Initials are used as fallback)',
    stockPhoto2,
  );
  const displayName = text('Display name', 'John Doe');

  const viewStyle = object('viewStyle', {
    height: '100%',
    width: '100%',
  } as ViewStyle);
  const textStyle = object('textStyle', {
    fontSize: 24,
  } as TextStyle);

  const user = {
    userId: 'testuser',
    profile: {
      displayName: displayName,
      picture: profilePicture,
    },
  };

  return (
    <ProfileImage
      user={user}
      imageUri={imageUri}
      style={viewStyle}
      textStyle={textStyle}
    />
  );
});
