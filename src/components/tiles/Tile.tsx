import React from 'react';
import { TouchableOpacity, View, ViewStyle } from 'react-native';
import { Badge, Text, shadow } from 'react-native-paper';
import { useStyles } from '../../hooks/useStyles';
import { createStyles, useIcons } from '../BrandConfigProvider';
import { NumberProp, SvgProps } from 'react-native-svg';
import { tID } from '../../common/testID';

interface TileProps {
  title: string;
  children?: React.ReactNode;
  Icon?: React.FC<SvgProps>;
  id?: string;
  onPress?: () => void;
  testID?: string;
  showBadge?: boolean;
  badge?: () => React.JSX.Element | null;
  style?: TileStyles;
}

export const Tile = ({
  Icon,
  title,
  id,
  testID,
  children,
  onPress,
  showBadge,
  badge,
  style: instanceStyles,
}: TileProps) => {
  const { ChevronRight } = useIcons();
  const { styles } = useStyles(defaultStyles, instanceStyles);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      testID={tID(`tile-button-${id}`)}
    >
      <View style={styles.container} id={id} testID={testID}>
        <View style={styles.contentsWrapper}>
          <View style={styles.contentsView}>
            <View style={styles.iconContainer}>
              {Icon && <Icon style={styles.icon} />}
            </View>
            <Text numberOfLines={2} style={styles.titleText}>
              {title}
            </Text>
            <View style={{ paddingRight: 24 }}>
              {showBadge && <Badge size={12} testID={tID('tile-badge')} />}
              {badge?.()}
            </View>
            {onPress ? (
              <View
                style={styles.arrowIconView}
                testID={tID('tile-chevron-icon-container')}
              >
                <ChevronRight
                  height={styles.arrow?.height}
                  stroke={styles.arrow?.overlayColor}
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
  contentsView: {
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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primarySource,
  },
  arrow: {
    height: '100%' as NumberProp | undefined,
    overlayColor: theme.colors.onPrimary,
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type TileStyles = NamedStylesProp<typeof defaultStyles>;
