import React, { useCallback } from 'react';
import { ScrollView } from 'react-native';
import { AppTile } from '../../hooks/useAppConfig';
import { tID } from '../../common';
import { Tile, TileStyles } from './Tile';
import { useNavigation } from '@react-navigation/native';
import { HomeScreenNavigation } from '../../screens/HomeScreen';
import { useStyles, useDeveloperConfig } from '../../hooks';
import { getCustomAppTileComponent } from '../../common/DeveloperConfig';
import { spacing } from '../BrandConfigProvider/theme/base';
import { createStyles } from '../BrandConfigProvider';
import { SvgUri } from 'react-native-svg';

export interface TilesListProps {
  tiles?: AppTile[];
  children?: React.ReactNode;
  styles?: TilesListStyles;
  tileStyles?: TileStyles;
  onAppTilePress?: () => void;
}
const appTileIcon = (uri?: string) =>
  function AppTileIcon() {
    const { styles } = useStyles(defaultStyles);
    if (uri) {
      return <SvgUri uri={uri} style={styles.iconImage} />;
    }
    return null;
  };

export const TilesList = ({
  tiles,
  children,
  styles: instanceStyles,
  onAppTilePress,
}: TilesListProps) => {
  const { styles } = useStyles(defaultStyles, instanceStyles);
  const { navigate } = useNavigation<HomeScreenNavigation>();
  const { appTileScreens } = useDeveloperConfig();

  const onAppTilePressDefault = useCallback(
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
      {tiles?.map((appTile) => (
        <Tile
          key={appTile.id}
          title={appTile.title}
          onPress={
            onAppTilePress ? onAppTilePress : onAppTilePressDefault(appTile)
          }
          Icon={appTileIcon(appTile.icon)}
        />
      ))}
      {children}
    </ScrollView>
  );
};

const defaultStyles = createStyles('TilesList', () => ({
  scrollView: {
    flexDirection: 'column',
    marginBottom: spacing.extraLarge,
  },
  iconImage: {
    width: 30,
    height: 30,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type TilesListStyles = NamedStylesProp<typeof defaultStyles> &
  TileStyles;
