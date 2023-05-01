import React, { useCallback } from 'react';
import { Image, View } from 'react-native';
import { AppTile, useAppConfig } from '../../hooks/useAppConfig';
import { tID } from '../../common';
import { Tile, TileStyles } from './Tile';
import { TrackTile } from '../TrackTile';
import { useStyles, useDeveloperConfig } from '../../hooks';
import { getCustomAppTileComponent } from '../../common/DeveloperConfig';
import { createStyles } from '../BrandConfigProvider';
import { SvgUri } from 'react-native-svg';
import { PillarsTile } from '../TrackTile/PillarsTile/PillarsTile';
import { HomeStackScreenProps } from '../../navigators/types';

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
  const trackTileTitle = data?.homeTab?.trackTileSettings?.title;

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
            navigation.navigate(screenName, {
              tracker,
              valuesContext,
            });
          }}
        />
      )}
      {trackTileEnabled && (
        <TrackTile
          onOpenSettings={(valuesContext) =>
            navigation.navigate('Home/TrackTileSettings', {
              valuesContext,
            })
          }
          onOpenTracker={(tracker, valuesContext) =>
            navigation.navigate('Home/TrackTile', {
              tracker,
              valuesContext,
            })
          }
          title={trackTileTitle}
        />
      )}
      <View style={styles.tiles}>
        {data?.homeTab?.appTiles?.map((appTile: AppTile) => (
          <Tile
            id={appTile.id}
            key={appTile.id}
            title={appTile.title}
            onPress={onAppTilePress(appTile)}
            Icon={appTileIcon(appTile.icon)}
          />
        ))}
      </View>
    </View>
  );
}

const appTileIcon = (uri?: string) =>
  function AppTileIcon() {
    if (uri) {
      if (uri.endsWith('svg')) {
        return <SvgUri uri={uri} />;
      } else {
        return <Image source={{ uri }} />;
      }
    }
    return null;
  };

const defaultStyles = createStyles('TilesList', (theme) => ({
  view: {},
  tiles: {
    marginHorizontal: theme.spacing.large,
    marginBottom: theme.spacing.large,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type TilesListStyles = NamedStylesProp<typeof defaultStyles> &
  TileStyles;
