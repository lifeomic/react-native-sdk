import React from 'react';
import {
  HeaderButton,
  HeaderButtonProps,
} from 'react-navigation-header-buttons';
import { useTheme } from '../hooks/useTheme';

export const HeaderButtonComponent = (props: HeaderButtonProps) => {
  const { colors } = useTheme();

  return <HeaderButton {...props} color={colors.primary} />;
};
