import {AppRegistry} from 'react-native';
import {name as appName} from './app.json';
import Config from 'react-native-config';
import StorybookApp from './AppStorybook';
import DemoApp from './AppDemo';

let App = Config.DEMO_APP === 'true' ? DemoApp : StorybookApp;

AppRegistry.registerComponent(appName, () => App);
