import React, { FC } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    fontSize: 18,
    marginBottom: 18,
  },
  content: {
    fontSize: 12,
    marginBottom: 10,
    lineHeight: 18,
  },
});

export const Welcome: FC = () => {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.header}>Welcome to React Native Storybook</Text>
      <Text style={styles.content}>
        This is a UI Component development environment for LifeOmic Platform
        mobile components. Here you can display and interact with UI components
        as stories. A story is a single state of one or more UI components. You
        can have as many stories as you want. In other words a story is like a
        visual test case.
      </Text>
    </View>
  );
};
