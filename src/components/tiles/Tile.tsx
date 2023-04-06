import React from 'react';
import { Dimensions, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useStyles } from '../../hooks/useStyles';
import { createStyles } from '../BrandConfigProvider';
import TileSelectIcon from './icons/tile-select-chevron.svg';
import { SvgProps } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';

interface TileProps {
  Icon?: React.FC<SvgProps>;
  onPress?: () => void;
  title: string;
  children?: React.ReactNode;
}

type ViewTileProps = Pick<TileProps, 'Icon' | 'title'>;

const ViewTile = ({ Icon, title }: ViewTileProps) => {
  const { styles } = useStyles(defaultStyles);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['transparent', 'transparent']}
        start={{ x: 0.499, y: -0.2 }}
        end={{ x: 0.511, y: 1 }}
        locations={[0, 1]}
        style={styles.gradient}
      >
        <View style={styles.contentsWrapper}>
          <View style={styles.contents}>
            {Icon && <Icon style={styles.icon} />}
            <Text numberOfLines={2} style={styles.titleText}>
              {title}
            </Text>
            <LinearGradient
              colors={['#509BC5', '#4DC4AF']}
              start={{ x: -0.76, y: 0 }}
              end={{ x: 1, y: 0 }}
              locations={[0, 1]}
            >
              <View style={styles.arrowIconView}>
                <TileSelectIcon
                  height={styles.arrowImage?.height}
                  color={styles.arrowImage?.overlayColor}
                />
              </View>
            </LinearGradient>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

export const Tile = ({ Icon, onPress, title, children }: TileProps) => {
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress}>
        <ViewTile title={title} Icon={Icon} />
        {children}
      </TouchableOpacity>
    );
  }

  return <ViewTile Icon={Icon} title={title} />;
};

export const spaceBetweenTiles = 16;
export const tileWidth =
  Math.floor(Dimensions.get('window').width - spaceBetweenTiles * 3) / 2;

const defaultStyles = createStyles('Tile', (theme) => ({
  contents: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
  },
  contentsWrapper: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  container: {
    height: 55,
    borderRadius: 10,
    backgroundColor: theme.colors.surface,
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.1,
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowRadius: 8,
    marginHorizontal: 20,
    marginBottom: 8,
  },
  titleText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
    paddingLeft: 10,
    flex: 1,
  },
  icon: {
    resizeMode: 'cover',
    marginLeft: 0,
    marginRight: 11,
  },
  arrowIconView: {
    height: '100%',
    aspectRatio: 1,
    justifyContent: 'center',
  },
  arrowImage: {
    height: '60%',
    overlayColor: theme.colors.surface,
  },
  gradient: {
    flex: 1,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type TileStyles = NamedStylesProp<typeof defaultStyles>;
