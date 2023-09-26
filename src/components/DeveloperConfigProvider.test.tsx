import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { renderHook } from '@testing-library/react-native';
import { DeveloperConfigProvider } from './DeveloperConfigProvider';
import { useDeveloperConfig } from '../hooks/useDeveloperConfig';
import { DeveloperConfig } from '../common/DeveloperConfig';
import { NavigationContainer } from '@react-navigation/native';
// NOTE: This file purposefully tests both useDeveloperConfig and
// DeveloperConfigProvider.

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

const renderHookInContext = async (developerConfig: DeveloperConfig) => {
  return renderHook(() => useDeveloperConfig(), {
    wrapper: ({ children }) => (
      <NavigationContainer>
        <DeveloperConfigProvider developerConfig={developerConfig}>
          {children}
        </DeveloperConfigProvider>
      </NavigationContainer>
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

  test('allows for apiBaseURL to be configured', async () => {
    const apiBaseURL = 'https://foo-bar.com';
    const { result } = await renderHookInContext({
      apiBaseURL,
    });
    expect(result.current.apiBaseURL).toEqual(apiBaseURL);
  });

  test('allows for additionalHomeScreens to be configured', async () => {
    const NativeStack = createNativeStackNavigator();

    const additionalScreens = [
      <NativeStack.Screen
        name="CustomHomeScreen/HelloWorld"
        component={() => <></>}
      />,
    ];

    const getAdditionalHomeScreens = () => additionalScreens;
    const { result } = await renderHookInContext({
      getAdditionalHomeScreens,
    });
    expect(result.current.getAdditionalHomeScreens?.(NativeStack)).toEqual(
      additionalScreens,
    );
  });

  test('allows for onAppSessionStart to be configured', async () => {
    const onAppSessionStart = jest.fn();
    const { result } = await renderHookInContext({
      onAppSessionStart,
    });
    expect(result.current.onAppSessionStart).toEqual(onAppSessionStart);
  });

  test('allows CustomHomeScreen to be configured', async () => {
    const CustomHomeScreen = () => <></>;
    const { result } = await renderHookInContext({
      CustomHomeScreen,
    });
    expect(result.current.CustomHomeScreen).toStrictEqual(CustomHomeScreen);
  });
});
