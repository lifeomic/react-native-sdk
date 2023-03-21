import React from 'react';
import { View, ViewProps, Text } from 'react-native';

/**
 * @description Safely wraps text components in a view that allows for
 * styling individual text elements with a fallback for unwrapped text.
 */
export const TransTextParent: React.FC<ViewProps> = (props) => {
  const { children, ...viewProps } = props;
  return (
    <View {...viewProps}>
      {React.Children.map(children, (item) => {
        if (typeof item === 'string') return <Text>{item}</Text>;

        return item;
      })}
    </View>
  );
};
