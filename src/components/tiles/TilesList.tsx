import React, { useCallback } from 'react';
import { Image, ImageStyle, View } from 'react-native';
import { AppTile, CircleTile, useAppConfig } from '../../hooks/useAppConfig';
import { tID } from '../../common';
import { Tile, TileStyles } from './Tile';
import { TrackTile } from '../TrackTile';
import { useStyles, useDeveloperConfig } from '../../hooks';
import { getCustomAppTileComponent } from '../../common/DeveloperConfig';
import { ChromiconName, createStyles, useIcons } from '../BrandConfigProvider';
import { SvgUri } from 'react-native-svg';
import { PillarsTile } from '../TrackTile/PillarsTile/PillarsTile';
import { HomeStackScreenProps } from '../../navigators/types';
import { t } from '../../../lib/i18n';

interface Props extends HomeStackScreenProps<'Home'> {
  styles?: TilesListStyles;
}

export function TilesList({ navigation, styles: instanceStyles }: Props) {
  const { styles } = useStyles(defaultStyles, instanceStyles);
  const { appTileScreens } = useDeveloperConfig();
  const { data } = useAppConfig();

  const pillarsTileEnabled = data?.homeTab?.tiles?.includes?.('pillarsTile');
  const pillarSettings = data?.homeTab?.pillarSettings;
  const trackTileEnabled = data?.homeTab?.tiles?.includes?.('trackTile');
  const trackerSettings = data?.homeTab?.trackTileSettings;
  const trackTileTitle = trackerSettings?.title;
  const todayTileEnabled = data?.homeTab?.tiles?.includes?.('todayTile');
  const myDataTileEnabled = data?.homeTab?.tiles?.includes?.('myDataTile');
  const todayTile = data?.homeTab?.todayTile;

  const onCircleTilePress = useCallback(
    (circleTile: CircleTile) => () => {
      navigation.navigate('Home/Circle/Discussion', { circleTile });
    },
    [navigation],
  );

  const onAppTilePress = useCallback(
    (appTile: AppTile) => () => {
      if (getCustomAppTileComponent(appTileScreens, appTile)) {
        navigation.navigate('Home/CustomAppTile', { appTile });
      } else if (appTile.clientId) {
        navigation.navigate('Home/AuthedAppTile', { appTile });
      } else {
        navigation.navigate('Home/AppTile', { appTile });
      }
    },
    [navigation, appTileScreens],
  );

  const onTodayTilePress = useCallback(() => {
    if (!todayTile) {
      return;
    }
    navigation.navigate('Home/AuthedAppTile', { appTile: todayTile });
  }, [navigation, todayTile]);

  return (
    <View testID={tID('tiles-list')} style={styles.view}>
      {pillarsTileEnabled && (
        <PillarsTile
          shouldUseOntology={!!pillarSettings?.advancedScreenTrackers?.length}
          onOpenDetails={(tracker, valuesContext) => {
            const screenName = pillarSettings?.advancedScreenTrackers?.includes(
              tracker.metricId || tracker.id,
            )
              ? 'Home/AdvancedTrackerDetails'
              : 'Home/TrackTile';
            navigation.navigate(screenName, {
              tracker,
              valuesContext,
            });
          }}
        />
      )}
      {trackTileEnabled && (
        <TrackTile
          shouldUseOntology={!!trackerSettings?.advancedScreenTrackers?.length}
          onOpenSettings={(valuesContext) =>
            navigation.navigate('Home/TrackTileSettings', {
              valuesContext,
            })
          }
          onOpenTracker={(tracker, valuesContext) => {
            const screenName =
              trackerSettings?.advancedScreenTrackers?.includes(
                tracker.metricId || tracker.id,
              )
                ? 'Home/AdvancedTrackerDetails'
                : 'Home/TrackTile';
            navigation.navigate(screenName, {
              tracker,
              valuesContext,
            });
          }}
          title={trackTileTitle}
        />
      )}
      <View style={styles.tilesView}>
        {todayTileEnabled && todayTile && (
          <Tile
            id={todayTile.id}
            key={todayTile.id}
            title={todayTile.title}
            Icon={tileIcon('HeartCheck', 'today')}
            onPress={onTodayTilePress}
          />
        )}
        {myDataTileEnabled && (
          <Tile
            id={'my-data-tile'}
            key={'my-data-tile'}
            title={t('My Data')}
            Icon={tileIcon('Scatter', 'my-data-tile-icon')}
            onPress={() => navigation.navigate('Home/MyData')}
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
            Icon={tileIcon('HeartCircle', circleTile.circleId)}
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

const tileIcon = (defaultIconName: ChromiconName, customIdentifier: string) =>
  function TileIcon() {
    const { [defaultIconName]: DefaultIcon, [customIdentifier]: CustomIcon } =
      useIcons();
    const { styles } = useStyles(defaultStyles);

    if (CustomIcon) {
      return <CustomIcon />;
    }

    return <DefaultIcon stroke={styles.tileIconImage?.overlayColor} />;
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
  tileIconImage: {
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
