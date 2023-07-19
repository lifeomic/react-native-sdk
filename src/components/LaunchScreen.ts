import { View, requireNativeComponent, UIManager } from 'react-native';

const NativeComponentName = 'RNTLaunchScreen';

let Screen = View;

if (UIManager.getViewManagerConfig(NativeComponentName)) {
  Screen = requireNativeComponent(NativeComponentName) as any;
}

export default Screen;
