import React from 'react';

import { View, Image, ImageSourcePropType, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createStyles } from './BrandConfigProvider';
import { useStyles } from '../hooks/useStyles';

interface Props {
  imageSource: ImageSourcePropType;
}

export function LogoHeader({ imageSource }: Props) {
  const { styles } = useStyles(defaultStyles);
  const androidFix = Platform.OS === 'android' ? { marginTop: 12 } : {};

  return (
    <View style={styles.view}>
      <SafeAreaView
        edges={['left', 'right', 'top']}
        style={[androidFix, styles.safeAreaView]}
      >
        <Image source={imageSource} style={styles.image} />
      </SafeAreaView>
    </View>
  );
}

const defaultStyles = createStyles('LogoHeader', () => ({
  view: {},
  safeAreaView: { alignItems: 'center' },
  image: {},
}));

declare module '@styles' {
  interface ComponentStyles
    extends ComponentNamedStyles<typeof defaultStyles> {}
}

export type LogoHeaderStyles = NamedStylesProp<typeof defaultStyles>;
