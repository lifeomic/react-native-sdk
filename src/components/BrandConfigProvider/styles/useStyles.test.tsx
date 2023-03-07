import React from 'react';
import { renderHook } from '@testing-library/react-native';
import { useStyles, StylesProvider } from './StylesProvider';

const defaultStyles = {
  container: {
    width: '100%',
  },
};

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<'TestComponent', typeof defaultStyles> {}
}

const renderHookInContext = async () => {
  return renderHook(() => useStyles('TestComponent', defaultStyles), {
    wrapper: ({ children }) => (
      <StylesProvider styles={{}}>{children}</StylesProvider>
    ),
  });
};

test('returns custom theme merged with base theme', async () => {
  const { result } = await renderHookInContext();

  expect(result.current.styles.container.width).toBe('100%');
});
