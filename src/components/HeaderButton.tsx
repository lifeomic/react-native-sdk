import React from 'react';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import { HeaderButtonComponent } from './HeaderButtonComponent';

interface Props {
  onPress: () => void;
  title: string;
}

export const HeaderButton = ({ onPress, title }: Props) => {
  return (
    <HeaderButtons HeaderButtonComponent={HeaderButtonComponent}>
      <Item title={title} onPress={onPress} />
    </HeaderButtons>
  );
};
