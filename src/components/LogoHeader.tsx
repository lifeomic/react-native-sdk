import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  View,
  Image,
  Platform,
  ImageSourcePropType,
  NativeEventEmitter,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createStyles } from './BrandConfigProvider';
import { useStyles } from '../hooks/useStyles';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

type Percentage = `${number}%`;
type LogoHeaderOptions = {
  visible?: boolean;
  imageSource?: ImageSourcePropType;
  item?: JSX.Element;
  alignImage?: Percentage;
  alignItem?: Percentage;
};

const eventEmitter = new NativeEventEmitter({
  addListener: () => {},
  removeListeners: () => {},
});

const updateLogoOptionsEvent = 'updateLogoOptions';
const restoreLogoOptionsEvent = 'restoreLogoOptions';

export const emitOptionsChanged = (options: LogoHeaderOptions) =>
  eventEmitter.emit(updateLogoOptionsEvent, options);

/**
 * @param newOptions
 * @returns void
 * When the current screen comes into focus emit new header options
 * and restores defaults when a blurScreen event is emitted
 */
export const useEmitLogoHeaderOptions = (newOptions: LogoHeaderOptions) => {
  const navigation = useNavigation();
  useFocusEffect(() => {
    emitOptionsChanged(newOptions);
  });
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      eventEmitter.emit(restoreLogoOptionsEvent);
    });

    return unsubscribe;
  }, [navigation]);
};

export function LogoHeader(defaultOptions: LogoHeaderOptions) {
  const { styles } = useStyles(defaultStyles);
  const androidFix = Platform.OS === 'android' ? { marginTop: 12 } : {};
  const [options, setOptions] = useState<LogoHeaderOptions>(defaultOptions);

  useLayoutEffect(() => {
    const subscription = eventEmitter.addListener(
      updateLogoOptionsEvent,
      (newOptions) => setOptions({ ...defaultOptions, ...newOptions }),
    );

    return () => {
      subscription.remove();
    };
  }, [defaultOptions]);

  useLayoutEffect(() => {
    const subscription = eventEmitter.addListener(restoreLogoOptionsEvent, () =>
      setOptions(defaultOptions),
    );

    return () => {
      subscription.remove();
    };
  }, [defaultOptions]);

  if (!options || !options?.visible) {
    return null;
  }

  return (
    <View style={styles.view}>
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
