import React from 'react';
import { renderHook } from '@testing-library/react-native';
import {
  BrandConfigProvider,
  ThemeProp,
} from '../components/BrandConfigProvider';
import * as baseTheme from '../components/BrandConfigProvider/theme/base';
import { useTheme } from './useTheme';
import { ThemedNavigationContainer } from '../common/ThemedNavigationContainer';

jest.unmock('@react-navigation/native');
jest.unmock('react-native-paper');

const renderHookInContext = async (theme?: ThemeProp) => {
  return renderHook(() => useTheme(), {
    wrapper: ({ children }) => (
      <BrandConfigProvider theme={theme}>
        <ThemedNavigationContainer>{children}</ThemedNavigationContainer>
      </BrandConfigProvider>
    ),
  });
};

test('returns theme', async () => {
  const {
    result: { current: theme },
  } = await renderHookInContext();

  expect(theme.colors.onBackground).toBe(baseTheme.colors.onBackground);
  expect(theme.colors.background).toBe(baseTheme.colors.background);
});

test('returns custom theme merged with base theme', async () => {
  const customTheme = { colors: { onBackground: 'pink' } };
  const {
    result: { current: theme },
  } = await renderHookInContext(customTheme);

  expect(theme.colors.onBackground).toBe('pink');
  expect(theme.colors.background).toBe(baseTheme.colors.background);
});
