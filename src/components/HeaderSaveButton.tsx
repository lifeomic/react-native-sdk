import React from 'react';
import { HeaderButtons, Item } from 'react-navigation-header-buttons';
import { HeaderButtonComponent } from './HeaderButtonComponent';

interface Props {
  onPress: () => void;
}

export const HeaderSaveButton = ({ onPress }: Props) => {
  return (
    <HeaderButtons HeaderButtonComponent={HeaderButtonComponent}>
      <Item title="Save" onPress={onPress} />
    </HeaderButtons>
  );
};
