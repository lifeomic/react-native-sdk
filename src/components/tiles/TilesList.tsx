import React, { useCallback } from 'react';
import { ScrollView, Image } from 'react-native';
import { AppTile, useAppConfig } from '../../hooks/useAppConfig';
import { tID } from '../../common';
import { Tile, TileStyles } from './Tile';
import { TrackTile } from '../TrackTile';
import { useNavigation } from '@react-navigation/native';
import { HomeScreenNavigation } from '../../screens/HomeScreen';
import { useStyles, useDeveloperConfig } from '../../hooks';
import { getCustomAppTileComponent } from '../../common/DeveloperConfig';
import { spacing } from '../BrandConfigProvider/theme/base';
import { createStyles } from '../BrandConfigProvider';
import { SvgUri } from 'react-native-svg';

interface Props {
  styles?: TilesListStyles;
}

export function TilesList({ styles: instanceStyles }: Props) {
  const { styles } = useStyles(defaultStyles, instanceStyles);
  const { navigate } = useNavigation<HomeScreenNavigation>();
  const { appTileScreens } = useDeveloperConfig();
  const { data } = useAppConfig();

  const trackTileEnabled = data?.homeTab?.tiles?.includes?.('trackTile');
  const trackTileTitle = data?.homeTab?.trackTileSettings?.title;

  const onAppTilePress = useCallback(
    (appTile: AppTile) => () => {
      if (getCustomAppTileComponent(appTileScreens, appTile)) {
        navigate('tiles/CustomAppTile', { appTile });
      } else {
        navigate('tiles/AppTile', { appTile });
      }
    },
    [navigate, appTileScreens],
  );

  return (
    <ScrollView testID={tID('tiles-list')} style={styles.scrollView}>
      {trackTileEnabled && (
        <TrackTile
          onOpenTracker={(tracker, valuesContext) =>
            navigate('tiles/TrackTile', {
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
    </ScrollView>
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
  scrollView: {
    flexDirection: 'column',
    marginBottom: spacing.extraLarge,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type TilesListStyles = NamedStylesProp<typeof defaultStyles> &
  TileStyles;
