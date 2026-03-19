import { registerRootComponent } from 'expo';
import notifee, { EventType } from '@notifee/react-native';

import App from './App';

notifee.registerForegroundService((notification) => {
  return new Promise(() => {
    // Keep foreground service running infinitely until stopped manually
  });
});

notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.DISMISSED || type === EventType.ACTION_PRESS) {
    await notifee.stopForegroundService();
  }
});

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
