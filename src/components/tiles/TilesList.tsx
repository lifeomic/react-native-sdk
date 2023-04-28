import React, { useCallback } from 'react';
import { Image, View } from 'react-native';
import { AppTile, useAppConfig } from '../../hooks/useAppConfig';
import { tID } from '../../common';
import { Tile, TileStyles } from './Tile';
import { TrackTile } from '../TrackTile';
import { useNavigation } from '@react-navigation/native';
import { HomeScreenNavigation } from '../../screens/HomeScreen';
import { useStyles, useDeveloperConfig } from '../../hooks';
import { getCustomAppTileComponent } from '../../common/DeveloperConfig';
import { createStyles } from '../BrandConfigProvider';
import { SvgUri } from 'react-native-svg';
import { PillarsTile } from '../TrackTile/PillarsTile/PillarsTile';

interface Props {
  styles?: TilesListStyles;
}

export function TilesList({ styles: instanceStyles }: Props) {
  const { styles } = useStyles(defaultStyles, instanceStyles);
  const { navigate } = useNavigation<HomeScreenNavigation>();
  const { appTileScreens } = useDeveloperConfig();
  const { data } = useAppConfig();

  const pillarsTileEnabled = data?.homeTab?.tiles?.includes?.('pillarsTile');
  const pillarSettings = data?.homeTab?.pillarSettings;
  const trackTileEnabled = data?.homeTab?.tiles?.includes?.('trackTile');
  const trackTileTitle = data?.homeTab?.trackTileSettings?.title;

  const onAppTilePress = useCallback(
    (appTile: AppTile) => () => {
      if (getCustomAppTileComponent(appTileScreens, appTile)) {
        navigate('Home/CustomAppTile', { appTile });
      } else {
        navigate('Home/AppTile', { appTile });
      }
    },
    [navigate, appTileScreens],
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
            navigate(screenName, {
              tracker,
              valuesContext,
            });
          }}
        />
      )}
      {trackTileEnabled && (
        <TrackTile
          onOpenSettings={(valuesContext) =>
            navigate('Home/TrackTileSettings', {
              valuesContext,
            })
          }
          onOpenTracker={(tracker, valuesContext) =>
            navigate('Home/TrackTile', {
              tracker,
              valuesContext,
            })
          }
          title={trackTileTitle}
        />
      )}
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

const defaultStyles = createStyles('TilesList', () => ({
  view: {},
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type TilesListStyles = NamedStylesProp<typeof defaultStyles> &
  TileStyles;
