import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { NativeEventEmitter } from 'react-native';

export const useEnvironmentToggle = () => {
  const [usePrimaryEnv, setUsePrimaryEnv] = useState(true);

  useEffect(() => {
    const eventEmitter = new NativeEventEmitter({
      addListener: () => {},
      removeListeners: () => {},
    });

    const subscription = eventEmitter.addListener('environmentToggle', () => {
      setUsePrimaryEnv((val) => !val);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    (async () => {
      const storedEnv =
        (await AsyncStorage.getItem('environment-toggle')) ?? 'primary';
      setUsePrimaryEnv(storedEnv === 'primary');
    })();
  }, []);

  return usePrimaryEnv;
};
