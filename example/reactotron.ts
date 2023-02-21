import Reactotron from 'reactotron-react-native';

Reactotron.configure({ name: 'LifeOmic RN Demo' });

// All default React Native plugins (not a react hook)
// eslint-disable-next-line react-hooks/rules-of-hooks
Reactotron.useReactNative();

Reactotron.connect();
