import React from 'react';
import { View, Image, ImageSourcePropType, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createStyles } from './BrandConfigProvider';
import { useStyles } from '../hooks/useStyles';

type Percentage = `${number}%`;

interface Props {
  imageSource: ImageSourcePropType;
  item?: JSX.Element;
  alignImage?: Percentage;
  alignItem?: Percentage;
}

export function LogoHeader({
  imageSource,
  item,
  alignImage,
  alignItem,
}: Props) {
  const { styles } = useStyles(defaultStyles);
  const androidFix = Platform.OS === 'android' ? { marginTop: 12 } : {};

  return (
    <View style={styles.view}>
      <SafeAreaView
        edges={['left', 'right', 'top']}
        style={[androidFix, styles.safeAreaView]}
      >
        <View style={styles.contentView}>
          <Image
            source={imageSource}
            style={[
              {
                left: alignImage,
              },
              styles.image,
            ]}
          />
          <View style={[{ left: alignItem }, styles.itemView]}>{item}</View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const defaultStyles = createStyles('LogoHeader', () => ({
  view: {},
  safeAreaView: {},
  image: { position: 'absolute' },
  itemView: { position: 'absolute' },
  contentView: { alignItems: 'center', minHeight: '20%', overflow: 'visible' },
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type LogoHeaderStyles = NamedStylesProp<typeof defaultStyles>;
