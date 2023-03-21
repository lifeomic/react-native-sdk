export * from './main';
import * as ReactNative from 'react-native';

/**
 * Re-export all react-native (react-native-web) content for the sake
 * of consumption within the bundle.  This allows web bundle consumers
 * to use ReactNative.StyleSheet.create and other style related functionality.
 */
export const NativeWeb = ReactNative;
