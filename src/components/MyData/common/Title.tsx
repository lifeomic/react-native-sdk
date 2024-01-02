import React from 'react';
import { IconButton, Text } from 'react-native-paper';
import { View } from 'react-native';
import { createStyles, useIcons } from '../../BrandConfigProvider';
import { useStyles } from '../../../hooks';
import { SvgProps } from 'react-native-svg';
import { tID } from '../../../common';

type Props = {
  title: string;
  onShare?: () => void;
};

export const Title = (props: Props) => {
  const { title, onShare } = props;
  const { styles } = useStyles(defaultStyles);

  return (
    <View style={styles.container}>
      <View style={styles.titleRowContainer}>
        <Text style={styles.titleText} variant="titleLarge">
          {title}
        </Text>
        <IconButton
          testID={tID('share-button')}
          icon={ShareIcon}
          style={styles.shareButton}
          onPress={onShare}
        />
      </View>
    </View>
  );
};

const ShareIcon = () => {
  const { Share2, ['chart-title-share']: CustomIcon } = useIcons();
  const { styles } = useStyles(defaultStyles);

  const Icon = CustomIcon ?? Share2;

  return <Icon {...styles.shareIcon} />;
};

const defaultStyles = createStyles('LineChartTitle', (theme) => ({
  container: {
    alignItems: 'flex-start',
  },
  titleRowContainer: {
    flexDirection: 'row',
  },
  titleText: {
    fontWeight: '700',
    paddingBottom: 5,
    flex: 1,
  },
  shareButton: {
    borderColor: theme.colors.onBackground,
    borderWidth: 1.5,
    borderRadius: 100,
  },
  shareIcon: {
    stroke: theme.colors.onBackground,
    strokeWidth: 1,
  } as SvgProps,
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}
