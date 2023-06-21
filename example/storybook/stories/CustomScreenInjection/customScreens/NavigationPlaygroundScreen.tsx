import React from 'react';
import { Button, Text, View } from 'react-native';
import { CustomHomeStackParamsList } from './types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<CustomHomeStackParamsList>;

export const NavigationPlaygroundScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={{ alignItems: 'center' }}>
      <Text>Navigation Playground Screen</Text>
      <Button
        title="Users Screen"
        onPress={() => navigation.navigate('CustomHomeScreen/Users')}
      />
      <Button
        title="User Details Screen: Joe"
        onPress={() =>
          navigation.navigate('CustomHomeScreen/UserDetails', {
            userId: 'Joe',
            name: 'Joe',
          })
        }
      />
    </View>
  );
};
