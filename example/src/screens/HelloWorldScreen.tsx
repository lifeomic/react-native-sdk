import React from 'react';
import { StyleSheet, Text } from 'react-native';

const styles = StyleSheet.create({
  text: {
    paddingTop: '50%',
    paddingLeft: '40%',
  },
});

export const HelloWorldScreen = () => {
  return <Text style={styles.text}>Hello, world!</Text>;
};
