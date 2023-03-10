import React from 'react';
import { renderHook } from '@testing-library/react-native';
import { useStyles, StylesProvider } from './StylesProvider';
import { createStyles } from './createStyles';

const defaultStyles = createStyles('TestComponent', () => ({
  container: {
    width: '100%',
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

const renderHookInContext = async () => {
  return renderHook(() => useStyles(defaultStyles), {
    wrapper: ({ children }) => (
      <StylesProvider styles={{}}>{children}</StylesProvider>
    ),
  });
};

test('returns custom theme merged with base theme', async () => {
  const { result } = await renderHookInContext();

  expect(result.current.styles?.container?.width).toBe('100%');
});
