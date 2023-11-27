import React from 'react';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import { HeaderButtonComponent } from './HeaderButtonComponent';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

interface Props {
  onPress: () => void;
  title: string;
}

export const HeaderButton = ({ onPress, title }: Props) => {
  return (
    <GestureHandlerRootView>
      <HeaderButtons HeaderButtonComponent={HeaderButtonComponent}>
        <Item title={title} onPress={onPress} />
      </HeaderButtons>
    </GestureHandlerRootView>
  );
};
