import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { NavigationContainerRef } from '@react-navigation/native';

export async function requestPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  return enabled;
}

export async function getFcmToken() {
  try {
    const token = await messaging().getToken();
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    throw error;
  }
}

/**
 * Display notification using Notifee
 */
async function displayNotification(
  title: string,
  body: string,
  data?: { [key: string]: string | object },
) {
  try {
    // Request notification permission for Notifee
    await notifee.requestPermission();

    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
    });

    // Convert data to string format for Notifee
    const notificationData: { [key: string]: string } = {};
    if (data) {
      Object.keys(data).forEach(key => {
        notificationData[key] = typeof data[key] === 'string' 
          ? data[key] as string 
          : JSON.stringify(data[key]);
      });
    }

    // Display notification
    await notifee.displayNotification({
      title,
      body,
      data: notificationData,
      android: {
        channelId,
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default',
        },
      },
    });
  } catch (error) {
    console.error('Error displaying notification:', error);
  }
}

/**
 * Handle foreground messages
 * This is called when the app is in the foreground and a notification is received
 */
export function setupForegroundMessageHandler(
  _navigationRef: React.RefObject<NavigationContainerRef<any>>,
) {
  try {
    messaging();
  } catch (error) {
    console.error('Messaging not available:', error);
    return () => {};
  }

  const unsubscribe = messaging().onMessage(
    async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      if (remoteMessage.notification) {
        const { title, body } = remoteMessage.notification;
        
        // Display notification using Notifee
        await displayNotification(
          title || 'Notification',
          body || '',
          remoteMessage.data as { [key: string]: string | object } | undefined,
        );
      }
    },
  );

  return unsubscribe;
}

/**
 * Handle notification when app is opened from background/quit state
 */
export function setupNotificationOpenedHandler(
  navigationRef: React.RefObject<NavigationContainerRef<any>>,
) {
  const unsubscribe = messaging().onNotificationOpenedApp(
    (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      if (remoteMessage.data) {
        // Convert data to string format
        const data: { [key: string]: string } = {};
        Object.keys(remoteMessage.data).forEach(key => {
          data[key] = typeof remoteMessage.data![key] === 'string' 
            ? remoteMessage.data![key] as string 
            : String(remoteMessage.data![key]);
        });

        if (navigationRef.current) {
          handleNotificationNavigation(data, navigationRef.current);
        } else {
          // Retry navigation after a delay if ref not ready
          setTimeout(() => {
            if (navigationRef.current) {
              handleNotificationNavigation(data, navigationRef.current);
            }
          }, 1000);
        }
      }
    },
  );

  // Also handle Notifee notification press events
  notifee.onForegroundEvent(({ type, detail }: { type: number; detail: any }) => {
    if (type === 1 && detail.notification?.data && navigationRef.current) {
      // Press action (user tapped notification)
      const data = detail.notification.data as { [key: string]: string };
      handleNotificationNavigation(data, navigationRef.current);
    }
  });

  notifee.onBackgroundEvent(async ({ type, detail }: { type: number; detail: any }) => {
    if (type === 1 && detail.notification?.data && navigationRef.current) {
      // Press action (user tapped notification)
      const data = detail.notification.data as { [key: string]: string };
      handleNotificationNavigation(data, navigationRef.current);
    }
  });

  return unsubscribe;
}

/**
 * Check if app was opened from a notification (when app was quit)
 */
export async function checkInitialNotification(
  navigationRef: React.RefObject<NavigationContainerRef<any>>,
) {
  const remoteMessage = await messaging().getInitialNotification();

  if (remoteMessage?.data) {
    // Convert data to string format
    const data: { [key: string]: string } = {};
    Object.keys(remoteMessage.data).forEach(key => {
      data[key] = typeof remoteMessage.data![key] === 'string' 
        ? remoteMessage.data![key] as string 
        : String(remoteMessage.data![key]);
    });

    if (navigationRef.current) {
      setTimeout(() => {
        handleNotificationNavigation(data, navigationRef.current);
      }, 1000);
    } else {
      setTimeout(() => {
        if (navigationRef.current) {
          handleNotificationNavigation(data, navigationRef.current);
        }
      }, 2000);
    }
  }
}

/**
 * Handle navigation based on notification data
 */
async function handleNotificationNavigation(
  data: { [key: string]: string },
  navigation: NavigationContainerRef<any>,
) {
  const { eventId } = data;

  if (!eventId) {
    return;
  }

  try {
    const { eventService } = await import('../services');
    const response = await eventService.getEventById(eventId);

    if (response.success && response.data) {
      navigation.navigate('EventDetails', { event: response.data });
    }
  } catch (error) {
    console.error('Error navigating to event:', error);
  }
}

/**
 * Set background message handler
 * This must be called at the top level of your app (outside React components)
 */
export function setBackgroundMessageHandler() {
  messaging().setBackgroundMessageHandler(
    async (_remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      // Background messages are handled automatically by the system
      // Notifee will display them if needed
    },
  );
}
