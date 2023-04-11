import React from 'react';
import { Dimensions, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useStyles } from '../../hooks/useStyles';
import { createStyles } from '../BrandConfigProvider';
import TileSelectIcon from './icons/tile-select-chevron.svg';
import { SvgProps } from 'react-native-svg';
import LinearGradient, {
  LinearGradientProps,
} from 'react-native-linear-gradient';
import { tID } from '../../common/testID';

interface TileProps {
  title: string;
  chevronGradient?: LinearGradientProps;
  children?: React.ReactNode;
  Icon?: React.FC<SvgProps>;
  id?: string;
  onPress?: () => void;
  testID?: string;
  tileGradient?: LinearGradientProps;
}

const defaultTileGradient: LinearGradientProps = {
  colors: ['transparent', 'transparent'],
  start: { x: 0.499, y: -0.2 },
  end: { x: 0.511, y: 1 },
  locations: [0, 1],
};

const defaultChevronGradient: LinearGradientProps = {
  colors: ['#509BC5', '#4DC4AF'],
  start: { x: -0.76, y: 0 },
  end: { x: 1, y: 0 },
  locations: [0, 1],
};

export const Tile = ({
  Icon,
  title,
  id,
  testID,
  tileGradient = defaultTileGradient,
  chevronGradient = defaultChevronGradient,
  children,
  onPress,
}: TileProps) => {
  const { styles } = useStyles(defaultStyles);
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      testID={tID(`tile-button-${id}`)}
    >
      <View style={styles.container} id={id} testID={testID}>
        <LinearGradient {...tileGradient} style={styles.gradient}>
          <View style={styles.contentsWrapper}>
            <View style={styles.contents}>
              <View style={styles.iconContainer}>
                {Icon && <Icon style={styles.icon} />}
              </View>
              <Text numberOfLines={2} style={styles.titleText}>
                {title}
              </Text>
              {onPress ? (
                <LinearGradient {...chevronGradient}>
                  <View
                    style={styles.arrowIconView}
                    testID={tID('tile-chevron-icon-container')}
                  >
                    <TileSelectIcon
                      height={styles.arrowImage?.height}
                      color={styles.arrowImage?.overlayColor}
                    />
                  </View>
                </LinearGradient>
              ) : (
                <View style={styles.arrowIconView} />
              )}
            </View>
          </View>
        </LinearGradient>
      </View>
      {children}
    </TouchableOpacity>
  );
};

export const spaceBetweenTiles = 16;
export const tileWidth =
  Math.floor(Dimensions.get('window').width - spaceBetweenTiles * 3) / 2;

const defaultStyles = createStyles('Tile', (theme) => ({
  contents: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: theme.spacing.large,
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
    marginHorizontal: theme.spacing.large,
    marginBottom: theme.spacing.extraSmall,
  },
  titleText: {
    ...theme.fonts.titleMedium,
    color: theme.colors.text,
    paddingLeft: theme.spacing.small,
    flex: 1,
  },
  iconContainer: {
    width: 38,
    paddingRight: theme.spacing.small,
  },
  icon: {
    resizeMode: 'cover',
    marginLeft: 0,
    marginRight: theme.spacing.small,
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
