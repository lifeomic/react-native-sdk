import { useEffect, useLayoutEffect } from 'react';
import { ImageSourcePropType, NativeEventEmitter } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import get from 'lodash/get';
import { Route } from '../navigators/types';
import { LogoHeaderConfig } from '../common/DeveloperConfig';

const eventEmitter = new NativeEventEmitter({
  addListener: () => {},
  removeListeners: () => {},
});

const updateLogoOptionsEvent = 'updateLogoOptions';
const restoreLogoOptionsEvent = 'restoreLogoOptions';

export const emitOptionsChanged = (options: LogoHeaderOptions) =>
  eventEmitter.emit(updateLogoOptionsEvent, options);

export const emitRestoreDefaults = () =>
  eventEmitter.emit(restoreLogoOptionsEvent);

export const useHandleOptionEvents = (
  setOptions: (args: LogoHeaderOptions) => void,
  defaultOptions: LogoHeaderOptions,
) => {
  useLayoutEffect(() => {
    const subscription = eventEmitter.addListener(
      updateLogoOptionsEvent,
      (newOptions) => setOptions({ ...defaultOptions, ...newOptions }),
    );

    return () => {
      subscription.remove();
    };
  }, [defaultOptions, setOptions]);

  useLayoutEffect(() => {
    const subscription = eventEmitter.addListener(restoreLogoOptionsEvent, () =>
      setOptions(defaultOptions),
    );

    return () => {
      subscription.remove();
    };
  }, [defaultOptions, setOptions]);
};

/**
 * Listens to react-navigation events and in turn emits LogoHeader events
 * to set the header options per screen at the developerConfig level.
 *
 * Pass into screenListeners prop for a <Stack.Navigator/>
 */

export const navigationScreenListeners = (
  headerOptions?: LogoHeaderConfig,
) => ({
  focus: (e: any) => {
    // Coerce unique route event target to route name
    const routeName = e.target?.split('-')?.[0] as Route | undefined;
    console.log('Found routeName', routeName);
    if (typeof routeName === 'undefined') {
      return;
    }
    const options = get(headerOptions, routeName);
    if (options) {
      emitOptionsChanged(options);
    }
  },
  blur: () => {
    // Make this a no-op if per screen
    // settings have not been specified
    if (headerOptions) {
      emitRestoreDefaults();
    }
  },
});

/**
 * Setup LogoHeader emitters on a single screen to pass in custom options.
 * Most the time a combination of navigationScreenListeners and developConfig
 * should be sufficient but this is probably useful in advanced cases where the
 * developerConfig does not have enough context.
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

export type LogoHeaderOptions = {
  visible?: boolean;
  imageSource?: ImageSourcePropType;
  item?: JSX.Element;
  alignImage?: `${number}%`;
  alignItem?: `${number}%`;
};
