import Reactotron from 'reactotron-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

Reactotron.configure({ name: 'LifeOmic RN Demo' });
Reactotron.setAsyncStorageHandler?.(AsyncStorage);

// All default React Native plugins (not a react hook)
// eslint-disable-next-line react-hooks/rules-of-hooks
Reactotron.useReactNative({
  networking: {
    ignoreUrls: /symbolicate|generate_204/,
  },
});

Reactotron.connect();

declare global {
  interface Console {
    tron: typeof Reactotron;
  }
}

console.tron = Reactotron;
const consoleLog = console.log;

console.log = (message: string, ...optionalParams: any[]) => {
  consoleLog(message, ...optionalParams);
  console.tron.log?.(message, ...optionalParams);
};
