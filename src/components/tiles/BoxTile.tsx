import React from 'react';
import { Dimensions, Text, View } from 'react-native';
import { useStyles } from '../../hooks/useStyles';
import { createStyles } from '../BrandConfigProvider';
import { tID } from '../../common/testID';
import { Card } from 'react-native-paper';
import { BoxTileProps } from './Tile';

export function BoxTile({
  onPress,
  id,
  title,
  tileMode = 'halfLength',
  style: instanceStyles,
  Icon,
  showBadge,
  badge,
}: BoxTileProps) {
  const { styles } = useStyles(defaultStyles, instanceStyles);
  const backgroundColor =
    showBadge || !!badge
      ? styles.tileNotificationView?.backgroundColor
      : styles.tileSpacingView?.backgroundColor;

  return (
    <Card
      testID={tID(`tile-button-${id}`)}
      onPress={onPress}
      disabled={!onPress}
      style={[
        styles.tileSpacingView,
        tileMode === 'fullLength'
          ? { width: tileWidth * 2 + spaceBetweenTiles }
          : { width: tileWidth },
        { backgroundColor: backgroundColor },
      ]}
    >
      <Card.Content
        style={styles.tileContentView}
        testID={tID(`tile-view-${id}`)}
      >
        <View style={styles.iconView}>{Icon && <Icon />}</View>
        <Text numberOfLines={2} style={styles.titleText}>
          {title}
        </Text>
      </Card.Content>
    </Card>
  );
}

export const spaceBetweenTiles = 16;
export const tileWidth =
  Math.floor(Dimensions.get('window').width - spaceBetweenTiles * 3) / 2;

const defaultStyles = createStyles('BoxTile', (theme) => ({
  tileColor: {
    backgroundColor: theme.colors.surface,
  },
  tileSpacingView: {
    marginHorizontal: theme.spacing.small,
    marginBottom: theme.spacing.medium,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileNotificationView: {
    backgroundColor: theme.colors.surfaceVariant,
  },
  tileContentView: {
    height: 130,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  titleText: {
    position: 'absolute',
    paddingTop: 100,
    textAlign: 'center',
    ...theme.fonts.bodySmall,
    fontWeight: 'bold',
  },
  iconView: {
    alignItems: 'center',
    alignContent: 'center',
    alignSelf: 'center',
  },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type BoxTileStyles = NamedStylesProp<typeof defaultStyles>;
