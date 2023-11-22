import React, { useState } from 'react';
import { View, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createStyles } from './BrandConfigProvider';
import { useStyles } from '../hooks/useStyles';
import {
  LogoHeaderOptions,
  useHandleOptionEvents,
} from '../hooks/useLogoHeaderOptions';
import { useLogoHeaderDimensions } from '../hooks/useLogoHeaderDimensions';

export function LogoHeader(defaultOptions: LogoHeaderOptions) {
  const { styles } = useStyles(defaultStyles);
  const androidFix = Platform.OS === 'android' ? { marginTop: 12 } : {};
  const [options, setOptions] = useState<LogoHeaderOptions>(defaultOptions);
  const [_, setLogoHeaderDimensions] = useLogoHeaderDimensions();

  // Subscribe to events to receive option updates
  useHandleOptionEvents(setOptions, defaultOptions);

  if (!options || !options?.visible) {
    return null;
  }

  return (
    <View
      style={styles.view}
      onLayout={(event) => setLogoHeaderDimensions(event.nativeEvent.layout)}
    >
      <SafeAreaView
        edges={['left', 'right', 'top']}
        style={[androidFix, styles.safeAreaView]}
      >
        <View style={styles.contentView}>
          {options.imageSource && (
            <Image
              source={options.imageSource}
              style={[
                {
                  left: options.alignImage,
                },
                styles.image,
              ]}
            />
          )}
          <View style={[{ left: options.alignItem }, styles.itemView]}>
            {options.item}
          </View>
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
