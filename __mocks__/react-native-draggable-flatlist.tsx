import React from 'react';
import { View } from 'react-native';

const RNDraggableFlatList: React.FC<any> = ({
  data = [],
  renderItem = jest.fn(),
  keyExtractor,
  ...rest
}) => (
  <View {...rest}>
    {data.map((item: any, i: number) => (
      <React.Fragment key={keyExtractor?.(item) ?? i}>
        {renderItem({ item, drag: jest.fn() })}
      </React.Fragment>
    ))}
  </View>
);

export default RNDraggableFlatList;
