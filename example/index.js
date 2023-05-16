import {AppRegistry} from 'react-native';
import {name as appName} from './app.json';
import { useDemoApp } from './config';
import StorybookApp from './AppStorybook';
import DemoApp from './AppDemo';

let App = useDemoApp ? DemoApp : StorybookApp;

AppRegistry.registerComponent(appName, () => App);
