/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { setBackgroundMessageHandler } from './src/notifications';

// Register background message handler
// This must be called before the app component is registered
setBackgroundMessageHandler();

AppRegistry.registerComponent(appName, () => App);
