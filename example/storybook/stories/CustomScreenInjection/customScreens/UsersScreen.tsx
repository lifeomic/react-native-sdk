import React from 'react';
import { Button, View } from 'react-native';
import { CustomHomeStackParamsList } from './types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

type UsersScreenNavigationProp = NativeStackNavigationProp<
  CustomHomeStackParamsList,
  'CustomHomeScreen/Users'
>;

export const UsersScreen = () => {
  const navigation = useNavigation<UsersScreenNavigationProp>();

  return (
    <View style={{ alignItems: 'center' }}>
      <Button
        title="Joe's user screen"
        onPress={() =>
          navigation.navigate('CustomHomeScreen/UserDetails', {
            userId: 'joe',
            name: 'Joe',
          })
        }
      />
      <Button
        title="Amy's user screen"
        onPress={() =>
          navigation.navigate('CustomHomeScreen/UserDetails', {
            userId: 'amy',
            name: 'Amy',
          })
        }
      />
    </View>
  );
};
