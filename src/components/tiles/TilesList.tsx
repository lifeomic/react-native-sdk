import React, { useCallback } from 'react';
import { Image, ImageStyle, View } from 'react-native';
import { AppTile, CircleTile, useAppConfig } from '../../hooks/useAppConfig';
import { tID } from '../../common';
import { Tile, TileStyles } from './Tile';
import { TrackTile } from '../TrackTile';
import { useStyles, useDeveloperConfig } from '../../hooks';
import { getCustomAppTileComponent } from '../../common/DeveloperConfig';
import { createStyles, useIcons } from '../BrandConfigProvider';
import { SvgUri } from 'react-native-svg';
import { PillarsTile } from '../TrackTile/PillarsTile/PillarsTile';
import {
  HomeTabScreenProps,
  LoggedInRootParamList,
} from '../../navigators/types';
import { StackNavigationProp } from '@react-navigation/stack';

interface Props extends HomeTabScreenProps<'HomeTabScreen'> {
  styles?: TilesListStyles;
}

export function TilesList({ navigation, styles: instanceStyles }: Props) {
  const { styles } = useStyles(defaultStyles, instanceStyles);
  const { appTileScreens } = useDeveloperConfig();
  const { data } = useAppConfig();
  const parentNavigation =
    navigation.getParent<StackNavigationProp<LoggedInRootParamList>>();

  const pillarsTileEnabled = data?.homeTab?.tiles?.includes?.('pillarsTile');
  const pillarSettings = data?.homeTab?.pillarSettings;
  const trackTileEnabled = data?.homeTab?.tiles?.includes?.('trackTile');
  const trackTileTitle = data?.homeTab?.trackTileSettings?.title;
  const todayTileEnabled = data?.homeTab?.tiles?.includes?.('todayTile');
  const todayTile = data?.homeTab?.todayTile;

  const onCircleTilePress = useCallback(
    (circleTile: CircleTile) => () => {
      parentNavigation.navigate('HomeScreens', {
        screen: 'Home/Circle/Discussion',
        params: { circleTile },
      });
    },
    [parentNavigation],
  );

  const onAppTilePress = useCallback(
    (appTile: AppTile) => () => {
      if (getCustomAppTileComponent(appTileScreens, appTile)) {
        parentNavigation.navigate('HomeScreens', {
          screen: 'Home/CustomAppTile',
          params: { appTile },
        });
      } else if (appTile.clientId) {
        parentNavigation.navigate('HomeScreens', {
          screen: 'Home/AuthedAppTile',
          params: { appTile },
        });
      } else {
        parentNavigation.navigate('HomeScreens', {
          screen: 'Home/AppTile',
          params: { appTile },
        });
      }
    },
    [parentNavigation, appTileScreens],
  );

  const onTodayTilePress = useCallback(() => {
    if (!todayTile) {
      return;
    }
    parentNavigation.navigate('HomeScreens', {
      screen: 'Home/AuthedAppTile',
      params: { appTile: todayTile },
    });
  }, [parentNavigation, todayTile]);

  return (
    <View testID={tID('tiles-list')} style={styles.view}>
      {pillarsTileEnabled && (
        <PillarsTile
          onOpenDetails={(tracker, valuesContext) => {
            const screenName = pillarSettings?.advancedScreenTrackers?.includes(
              tracker.metricId || tracker.id,
            )
              ? 'Home/AdvancedTrackerDetails'
              : 'Home/TrackTile';
            parentNavigation.navigate('HomeScreens', {
              screen: screenName,
              params: { tracker, valuesContext },
            });
          }}
        />
      )}
      {trackTileEnabled && (
        <TrackTile
          onOpenSettings={(valuesContext) =>
            parentNavigation.navigate('HomeScreens', {
              screen: 'Home/TrackTileSettings',
              params: { valuesContext },
            })
          }
          onOpenTracker={(tracker, valuesContext) =>
            parentNavigation.navigate('HomeScreens', {
              screen: 'Home/TrackTile',
              params: {
                tracker,
                valuesContext,
              },
            })
          }
          title={trackTileTitle}
        />
      )}
      <View style={styles.tilesView}>
        {todayTileEnabled && todayTile && (
          <Tile
            id={todayTile.id}
            key={todayTile.id}
            title={todayTile.title}
            Icon={TodayIcon}
            onPress={onTodayTilePress}
          />
        )}
        {data?.homeTab?.appTiles?.map((appTile: AppTile) => (
          <Tile
            id={appTile.id}
            key={appTile.id}
            title={appTile.title}
            onPress={onAppTilePress(appTile)}
            Icon={appTileIcon(appTile.id, appTile.icon, styles.iconImage)}
          />
        ))}
        {data?.homeTab?.circleTiles?.map((circleTile: CircleTile) => (
          <Tile
            id={circleTile.circleId}
            key={circleTile.circleId}
            title={circleTile.buttonText ?? circleTile.circleName}
            onPress={onCircleTilePress(circleTile)}
            Icon={circleIcon(circleTile.circleId)}
          />
        ))}
      </View>
    </View>
  );
}

const appTileIcon = (id: string, uri?: string, styles?: ImageStyle) =>
  function AppTileIcon() {
    const { [id]: CustomCircleIcon } = useIcons();

    if (CustomCircleIcon) {
      return <CustomCircleIcon />;
    } else if (uri) {
      if (uri.endsWith('svg')) {
        return <SvgUri uri={uri} />;
      } else {
        return <Image source={{ uri }} style={styles} />;
      }
    }
    return null;
  };

const circleIcon = (circleId: string) =>
  function CircleIcon() {
    const { HeartCircle, [circleId]: CustomCircleIcon } = useIcons();
    const { styles } = useStyles(defaultStyles);

    if (CustomCircleIcon) {
      return <CustomCircleIcon />;
    }

    return <HeartCircle stroke={styles.circleIconImage?.overlayColor} />;
  };

const TodayIcon = () => {
  const { HeartCheck, today: CustomTodayIcon } = useIcons();
  const { styles } = useStyles(defaultStyles);

  if (CustomTodayIcon) {
    return <CustomTodayIcon />;
  }

  return <HeartCheck stroke={styles.todayIconImage?.overlayColor} />;
};

const defaultStyles = createStyles('TilesList', (theme) => ({
  view: {},
  tilesView: {
    marginHorizontal: theme.spacing.large,
    marginBottom: theme.spacing.large,
  },
  iconImage: {
    width: 30,
    height: 30,
    marginRight: theme.spacing.small,
  },
  circleIconImage: {
    overlayColor: theme.colors.primarySource,
  },
  todayIconImage: {
    overlayColor: theme.colors.primarySource,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type TilesListStyles = NamedStylesProp<typeof defaultStyles> &
  TileStyles;
