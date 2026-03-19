import { registerRootComponent } from 'expo';

let notifee = null;
let EventType = null;
try {
  const notifeeModule = require('@notifee/react-native');
  notifee = notifeeModule.default;
  EventType = notifeeModule.EventType;
} catch (err) {
  console.warn('Notifee native module not found. Chạy App trên máy ảo sẽ bỏ qua tính năng Timer.');
}

import App from './App';

if (notifee && EventType) {
  try {
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
  } catch (err) {
    console.warn('Notifee service registration failed. This is expected in Expo Go.');
  }
}


// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
