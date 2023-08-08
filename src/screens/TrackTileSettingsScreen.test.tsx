import React from 'react';
import { View } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import SettingsScreen from './TrackTileSettingsScreen';
import { useTrackers } from '../components/TrackTile/hooks/useTrackers';
import { TrackTileServiceProvider } from '../components/TrackTile/main';

jest.mock('../components/HeaderButton', () => ({
  HeaderButton: jest.requireActual('react-native').Button,
}));
jest.mock('../components/TrackTile/hooks/useTrackers', () => ({
  useTrackers: jest.fn(() => ({})),
}));
jest.mock('i18next', () => ({
  t: (_: any, text: string) => text,
}));

const mockUseTrackers = useTrackers as any as jest.Mock;

const renderInContext = () => {
  let left: any;
  let right: any;
  let rerender: (component: React.ReactElement<any>) => void;
  let pendingRenders: any[] = [];

  const setOptions = ({ headerLeft, headerRight }: any) => {
    left = headerLeft?.();
    right = headerRight?.();

    const content = <SettingsScreen navigation={navigation} route={route} />;
    if (rerender) {
      rerender(content);
    } else {
      pendingRenders.push(content);
    }
  };

  const navigation: any = { setOptions, navigate: jest.fn() };
  const route: any = { params: {} };

  const result = render(
    <SettingsScreen navigation={navigation as any} route={route} />,
    {
      wrapper: ({ children }) => (
        <TrackTileServiceProvider value={{} as any}>
          <View>
            {children}
            {left}
            {right}
          </View>
        </TrackTileServiceProvider>
      ),
    },
  );

  rerender = result.rerender;

  pendingRenders.forEach((v) => rerender(v));

  return { ...result, navigation };
};

describe('TrackTileSettingsScreen', () => {
  beforeEach(() => {
    mockUseTrackers.mockReturnValue({
      trackers: [
        {
          name: 'Tracker',
        },
      ],
    });
  });

  it('should render', async () => {
    const { findByText } = renderInContext();
    expect(await findByText('Tracker')).toBeDefined();
  });

  it('Can click the edit button', async () => {
    const { findByText } = renderInContext();

    fireEvent.press(await findByText('Edit'));

    expect(await findByText('Done')).toBeDefined();
    expect(await findByText('Cancel')).toBeDefined();

    fireEvent.press(await findByText('Cancel'));

    expect(await findByText('Edit')).toBeDefined();
  });

  it('Can click a tracker to open it', async () => {
    const { findByText, navigation } = renderInContext();

    fireEvent.press(await findByText('Tracker'));

    expect(navigation.navigate).toHaveBeenCalledWith(
      'Home/TrackTile',
      expect.anything(),
    );
  });
});
