import React from 'react';
import { Text, View, ViewStyle, StyleSheet } from 'react-native';
import { storiesOf } from '@storybook/react-native';
import SwipeableRow from 'src/components/SwipeableRow';
import ProfileImage from 'src/components/ProfileImage';
const stockPhoto =
  'https://st2.depositphotos.com/1662991/8837/i/450/depositphotos_88370500-stock-photo-mechanic-wearing-overalls.jpg';

storiesOf('SwipeableRow', module).add('demo', () => {
  const user = {
    userId: 'testuser',
  };

  const viewStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  };

  const profileStyle: ViewStyle = {
    maxHeight: '100%',
    maxWidth: '100%',
  };

  const dividerStyle = {
    borderBottomColor: 'grey',
    borderBottomWidth: StyleSheet.hairlineWidth,
  };

  const child = (
    <View style={viewStyle}>
      <ProfileImage user={user} imageUri={stockPhoto} style={profileStyle} />
      <Text>User has sent you a new message.</Text>
    </View>
  );

  return (
    <View>
      <SwipeableRow onEdit={() => {}}>{child}</SwipeableRow>
      <View style={dividerStyle} />
      <SwipeableRow onDelete={() => true}>{child}</SwipeableRow>
    </View>
  );
});
