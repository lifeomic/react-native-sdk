import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppNavHeader } from '../components/AppNavHeader';
import { OptionalScreen } from 'example/src/screens/OptionalScreen';
import { OptionalStackParamList } from './types';

const Stack = createNativeStackNavigator<OptionalStackParamList>();

export function OptionalStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        header: AppNavHeader,
      }}
    >
      <Stack.Screen name="Optional" component={OptionalScreen} />
    </Stack.Navigator>
  );
}
