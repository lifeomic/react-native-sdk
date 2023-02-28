import React from 'react';
import { renderHook } from '@testing-library/react-native';
import { BrandConfigProvider } from '../components/BrandConfigProvider/BrandConfigProvider';
import { Theme } from '../components/BrandConfigProvider/theme/Theme';
import * as baseTheme from '../components/BrandConfigProvider/theme/base';
import { useTheme } from './useTheme';

const renderHookInContext = async (theme?: Theme) => {
  return renderHook(() => useTheme(), {
    wrapper: ({ children }) => (
      <BrandConfigProvider theme={theme}>{children}</BrandConfigProvider>
    ),
  });
};

test('returns theme', async () => {
  const { result } = await renderHookInContext();

  expect(result.current.theme).toBeInstanceOf(Theme);
  expect(result.current.theme).toEqual(baseTheme);
});

test('returns custom theme merged with base theme', async () => {
  const customTheme = new Theme({ colors: { text: 'pink' } });
  const {
    result: {
      current: { theme },
    },
  } = await renderHookInContext(customTheme);

  expect(theme.colors.text).toBe('pink');
  expect(theme.colors.background).toBe(baseTheme.colors.background);
});
