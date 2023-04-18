import React from 'react';
import { renderHook } from '@testing-library/react-native';
import { DeveloperConfigProvider } from './DeveloperConfigProvider';
import { useDeveloperConfig } from '../hooks/useDeveloperConfig';
import { DeveloperConfig } from '../common/DeveloperConfig';

// NOTE: This file purposefully tests both useDeveloperConfig and
// DeveloperConfigProvider.

const renderHookInContext = async (developerConfig: DeveloperConfig) => {
  return renderHook(() => useDeveloperConfig(), {
    wrapper: ({ children }) => (
      <DeveloperConfigProvider developerConfig={developerConfig}>
        {children}
      </DeveloperConfigProvider>
    ),
  });
};

test('default context allows provider to not be present in app', async () => {
  const { result } = renderHook(() => useDeveloperConfig());
  expect(result.current).toEqual({});
});

describe('with developerConfig injected into provider', () => {
  test('allows for appTileScreens to be configured', async () => {
    const appTileScreensConfig = {
      'http://unit-test/app-tile-1': () => <></>,
    };
    const { result } = await renderHookInContext({
      appTileScreens: appTileScreensConfig,
    });
    expect(result.current.appTileScreens).toEqual(appTileScreensConfig);
  });

  test('expands simpleTheme into theme prop', async () => {
    const simpleTheme = {
      primaryColor: '#000',
      accentColor: '#fff',
    };
    const { result } = await renderHookInContext({
      simpleTheme,
    });
    expect(result.current.theme).toEqual({
      colors: {
        primary: simpleTheme.primaryColor,
        primaryContainer: simpleTheme.accentColor,
      },
    });
  });

  test('allows for apiBaseURL to be configured', async () => {
    const apiBaseURL = 'https://foo-bar.com';
    const { result } = await renderHookInContext({
      apiBaseURL,
    });
    expect(result.current.apiBaseURL).toEqual(apiBaseURL);
  });
});
