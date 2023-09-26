import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { TilesList } from './TilesList';
import { useNavigation } from '@react-navigation/native';
import { useIcons } from '../BrandConfigProvider';
import { mockActiveConfig } from '../../common/testHelpers/mockSession';

jest.unmock('i18next');
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: jest.fn(),
}));
jest.mock('../TrackTile', () => ({
  TrackTile: ({ title }: { title: string }) => <Text>{title}</Text>,
}));

jest.mock('../BrandConfigProvider/icons/IconProvider', () => ({
  useIcons: jest.fn(() => ({
    HeartCheck: () => <></>,
    HeartCircle: () => <></>,
    ChevronRight: () => <></>,
  })),
}));

jest.mock('../../components/TodayBadge', () => null);

beforeEach(() => {
  mockActiveConfig({
    appConfig: {
      homeTab: {
        tiles: ['trackTile', 'todayTile', 'circleTiles'],
        trackTileSettings: {
          title: 'TrackTile Title',
        },
        appTiles: [
          {
            id: 'tile-id-1',
            title: 'My First Tile',
            source: { url: 'https://tile.com' },
          },
          {
            id: 'tile-id-2',
            title: 'My Second Tile',
            source: { url: 'https://tile.com' },
          },
        ],
        todayTile: {
          id: 'today-tile',
          title: 'Today',
          source: { url: 'https://today-tile.com' },
        },
        circleTiles: [
          {
            circleId: 'circle-id-1',
            isMember: true,
            circleName: 'My Circle',
          },
        ],
      },
    } as any,
  });
});

test('renders multiple tiles', () => {
  const tileList = render(
    <TilesList navigation={useNavigation()} route={{} as any} />,
  );

  expect(tileList.getByText('TrackTile Title')).toBeDefined();

  expect(tileList.getByText('My First Tile')).toBeDefined();
  expect(tileList.getByTestId('tile-button-tile-id-1')).toBeDefined();

  expect(tileList.getByText('My Second Tile')).toBeDefined();
  expect(tileList.getByTestId('tile-button-tile-id-2')).toBeDefined();

  expect(tileList.getByText('Today')).toBeDefined();
  expect(tileList.getByTestId('tile-button-today-tile')).toBeDefined();
});

test('does not render the today tile if not enabled', () => {
  mockActiveConfig({
    appConfig: {
      data: {
        homeTab: {
          tiles: ['trackTile'],
          trackTileSettings: {
            title: 'TrackTile Title',
          },
          appTiles: [
            {
              id: 'tile-id-1',
              title: 'My First Tile',
              source: { url: 'https://tile.com' },
            },
            {
              id: 'tile-id-2',
              title: 'My Second Tile',
              source: { url: 'https://tile.com' },
            },
          ],
        },
      },
    } as any,
  });

  const tileList = render(
    <TilesList navigation={useNavigation()} route={{} as any} />,
  );

  expect(tileList.queryByText('Today')).toBe(null);
  expect(tileList.queryByTestId('tile-button-today-tile')).toBe(null);
});

test('renders custom today icon', () => {
  (useIcons as jest.Mock).mockReturnValue({
    HeartCheck: () => <></>,
    HeartCircle: () => <></>,
    ChevronRight: () => <></>,
    today: () => <Text>Custom Today Icon</Text>,
  });

  const tileList = render(
    <TilesList navigation={useNavigation()} route={{} as any} />,
  );

  expect(tileList.getByText('Custom Today Icon')).toBeDefined();
});

test('renders custom circle icon', () => {
  (useIcons as jest.Mock).mockReturnValue({
    HeartCheck: () => <></>,
    HeartCircle: () => <></>,
    ChevronRight: () => <></>,
    'circle-id-1': () => <Text>Custom Circle Icon</Text>,
  });

  const tileList = render(
    <TilesList navigation={useNavigation()} route={{} as any} />,
  );

  expect(tileList.getByText('Custom Circle Icon')).toBeDefined();
});

test('renders custom app tile icon', () => {
  (useIcons as jest.Mock).mockReturnValue({
    HeartCheck: () => <></>,
    HeartCircle: () => <></>,
    ChevronRight: () => <></>,
    'tile-id-1': () => <Text>Custom App Tile Icon</Text>,
  });

  const tileList = render(
    <TilesList navigation={useNavigation()} route={{} as any} />,
  );

  expect(tileList.getByText('Custom App Tile Icon')).toBeDefined();
});
