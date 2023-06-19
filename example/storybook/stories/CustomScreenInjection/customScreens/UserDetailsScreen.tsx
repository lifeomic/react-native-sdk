import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import { CustomHomeStackParamsList } from './types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';

type UserDetailsNavigationProp = NativeStackNavigationProp<
  CustomHomeStackParamsList,
  'CustomHomeScreen/UserDetails'
>;

type UserDetailsRouteProp = RouteProp<
  CustomHomeStackParamsList,
  'CustomHomeScreen/UserDetails'
>;

export const UserDetailsScreen = () => {
  const navigation = useNavigation<UserDetailsNavigationProp>();
  const route = useRoute<UserDetailsRouteProp>();

  useEffect(() => {
    navigation.setOptions({
      title: route.params.name,
    });
  }, [navigation, route.params.name]);

  return (
    <View style={{ alignItems: 'center' }}>
      <Text>{`User ID: ${route.params.userId}`}</Text>
    </View>
  );
};
