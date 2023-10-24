import { renderHook, render } from '@testing-library/react-native';
import { useAppConfig } from './useAppConfig';
import { useDeveloperConfig } from './useDeveloperConfig';
import { useTabsConfig } from './useTabsConfig';
import { NavigationTab } from '../common';
import * as Stacks from '../navigators';
import React from 'react';
import { IconProvider } from '../components';

jest.mock('./useAppConfig', () => ({
  useAppConfig: jest.fn(),
}));
jest.mock('./useDeveloperConfig', () => ({
  useDeveloperConfig: jest.fn(),
}));

const useAppConfigMock = useAppConfig as jest.Mock<
  Partial<ReturnType<typeof useAppConfig>>
>;
const useDeveloperConfigMock = useDeveloperConfig as jest.Mock<
  ReturnType<typeof useDeveloperConfig>
>;

beforeEach(() => {
  useAppConfigMock.mockReturnValue({ data: {} });
  useDeveloperConfigMock.mockReturnValue({});
});

test('returns default tabs when there are no other configs', () => {
  // Note app config and developer config are both empty so default
  // tabs should be used
  const defaultTabs: any[] = ['default-tab'];
  const { result } = renderHook(() => useTabsConfig(defaultTabs));

  expect(result.current).toStrictEqual(defaultTabs);
});

test('returns tabs in TabBar.tabs config', () => {
  const tabs: NavigationTab[] = [
    {
      component: jest.fn(),
      icon: jest.fn(),
      name: 'Test Tab',
    },
  ];
  useDeveloperConfigMock.mockReturnValue({
    componentProps: {
      TabBar: {
        tabs,
      },
    },
  });

  const { result } = renderHook(useTabsConfig);

  expect(result.current).toStrictEqual(tabs);
});

test('returns tabs in app config', () => {
  const theme = {} as any;
  const PlanetIconMock = jest.fn();
  useAppConfigMock.mockReturnValue({
    data: {
      tabs: [
        {
          icon: 'Planet',
          name: 'Test Tab',
          type: 'home',
          svgProps: { color: 'red' },
          svgPropsActive: { color: 'yellow' },
          svgPropsInactive: { color: 'blue' },
        },
      ],
    },
  });

  const { result } = renderHook(useTabsConfig);

  expect(result.current).toEqual([
    {
      component: Stacks.HomeStack,
      icon: expect.any(Function),
      name: 'Test Tab',
      svgProps: expect.any(Function),
      svgPropsActive: expect.any(Function),
      svgPropsInactive: expect.any(Function),
      type: 'home',
    },
  ]);

  const Icon = result.current[0].icon;
  render(<Icon />, {
    wrapper: ({ children }) => (
      <IconProvider icons={{ Planet: PlanetIconMock }}>{children}</IconProvider>
    ),
  });

  expect(PlanetIconMock).toHaveBeenCalled();
  expect(result.current[0].svgProps?.(theme)).toEqual({ color: 'red' });
  expect(result.current[0].svgPropsActive?.(theme)).toEqual({
    color: 'yellow',
  });
  expect(result.current[0].svgPropsInactive?.(theme)).toEqual({
    color: 'blue',
  });
});

test.each([
  ['appTile', 'AppTileStack'],
  ['authedAppTile', 'AuthedAppTileStack'],
  ['home', 'HomeStack'],
  ['notifications', 'NotificationsStack'],
  ['settings', 'SettingsStack'],
])('for tab.type %p uses %p for the stack', (type, stackName) => {
  useAppConfigMock.mockReturnValue({
    data: {
      tabs: [
        {
          name: 'Test Tab',
          type: type as any,
        },
      ],
    },
  });

  const { result } = renderHook(useTabsConfig);

  expect(result.current).toEqual([
    expect.objectContaining({
      component: (Stacks as any)[stackName],
      type,
    }),
  ]);
});

test('can specify a customTab stack', () => {
  const CustomStack = () => <></>;
  useDeveloperConfigMock.mockReturnValue({
    CustomStacks: {
      CustomStack,
    },
  });
  useAppConfigMock.mockReturnValue({
    data: {
      tabs: [
        {
          name: 'Test Tab',
          type: 'customTab',
          initialParams: {
            name: 'CustomStack',
          },
        },
      ],
    },
  });

  const { result } = renderHook(useTabsConfig);

  expect(result.current).toEqual([
    expect.objectContaining({
      component: CustomStack,
      type: 'customTab',
    }),
  ]);
});

test('handles missing customTab stack', () => {
  useAppConfigMock.mockReturnValue({
    data: {
      tabs: [
        {
          name: 'Test Tab',
          type: 'customTab',
          initialParams: {
            name: 'MissingStack', // This stack does not exist in Dev config
          },
        },
      ],
    },
  });

  const { result } = renderHook(useTabsConfig);

  expect(result.current).toEqual([
    expect.objectContaining({
      type: 'customTab',
    }),
  ]);
  expect(result.current[0].component()).toBeNull();
});

test('handles unknown tab type', () => {
  useAppConfigMock.mockReturnValue({
    data: {
      tabs: [
        {
          name: 'Test Tab',
          type: 'unknownTabType' as any,
        },
      ],
    },
  });

  const { result } = renderHook(useTabsConfig);

  expect(result.current).toEqual([
    expect.objectContaining({
      type: 'unknownTabType',
    }),
  ]);
  expect(result.current[0].component()).toBeNull();
});

test('defaults to Menu icon for unknown/missing icon', () => {
  const MenuItemMock = jest.fn();
  useAppConfigMock.mockReturnValue({
    data: {
      tabs: [
        {
          name: 'Test Tab',
          type: 'home',
          icon: 'unknownIcon',
        },
        {
          name: 'Test Tab 2',
          type: 'home',
          icon: undefined,
        },
      ],
    },
  });

  const { result } = renderHook(useTabsConfig);

  const Icon = result.current[0].icon;
  const Icon2 = result.current[1].icon;
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <IconProvider icons={{ Menu: MenuItemMock }}>{children}</IconProvider>
  );

  render(<Icon />, { wrapper });
  render(<Icon2 />, { wrapper });

  expect(MenuItemMock).toHaveBeenCalledTimes(2);
});
