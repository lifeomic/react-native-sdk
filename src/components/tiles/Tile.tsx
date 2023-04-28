import React from 'react';
import { TouchableOpacity, View, ViewStyle } from 'react-native';
import { Text, shadow } from 'react-native-paper';
import { useStyles } from '../../hooks/useStyles';
import { createStyles } from '../BrandConfigProvider';
import TileSelectIcon from './icons/tile-select-chevron.svg';
import { SvgProps } from 'react-native-svg';
import { tID } from '../../common/testID';

interface TileProps {
  title: string;
  children?: React.ReactNode;
  Icon?: React.FC<SvgProps>;
  id?: string;
  onPress?: () => void;
  testID?: string;
}

export const Tile = ({
  Icon,
  title,
  id,
  testID,
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
        <View style={styles.contentsWrapper}>
          <View style={styles.contents}>
            <View style={styles.iconContainer}>
              {Icon && <Icon style={styles.icon} />}
            </View>
            <Text numberOfLines={2} style={styles.titleText}>
              {title}
            </Text>
            {onPress ? (
              <View
                style={styles.arrowIconView}
                testID={tID('tile-chevron-icon-container')}
              >
                <TileSelectIcon
                  height={styles.arrowImage?.height}
                  color={styles.arrowImage?.overlayColor}
                />
              </View>
            ) : (
              <View style={styles.arrowIconView} />
            )}
          </View>
        </View>
      </View>
      {children}
    </TouchableOpacity>
  );
};

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
    marginBottom: theme.spacing.large,
    ...shadow(3),
  } as ViewStyle,
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
    backgroundColor: theme.colors.primary,
  },
  arrowImage: {
    height: '60%',
    overlayColor: theme.colors.onPrimary,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type TileStyles = NamedStylesProp<typeof defaultStyles>;
