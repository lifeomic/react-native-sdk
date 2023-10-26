import React from 'react';
import { renderHook } from '@testing-library/react-native';
import {
  AnalyticsContextProvider,
  useAnalytics,
  AnalyticsEvent,
} from './useAnalytics';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

const mockConsumer = {
  onEvent: jest.fn(),
};

const renderHookInContext = async () => {
  return renderHook(() => useAnalytics(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={new QueryClient()}>
        <AnalyticsContextProvider consumers={[mockConsumer]}>
          {children}
        </AnalyticsContextProvider>
      </QueryClientProvider>
    ),
  });
};

test('without provider, methods fail', async () => {
  const { result } = renderHook(() => useAnalytics());
  await expect(result.current.emit({} as any)).rejects.toBeUndefined();
});

test('emitting an event', async () => {
  const testEvent: AnalyticsEvent = {
    type: 'TEST_TAP',
    user: 'abc123',
  };
  const { result } = await renderHookInContext();
  result.current.emit(testEvent);
  expect(mockConsumer.onEvent).toBeCalledTimes(1);
  expect(mockConsumer.onEvent).toHaveBeenLastCalledWith(testEvent);
});
