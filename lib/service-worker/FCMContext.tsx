import { createContext, useContext, useEffect, useState } from 'react';
import firebase from 'firebase/app';
import 'firebase/messaging';
import { RequestHelper } from '../request-helper';
import { firebaseConfig } from '../firebase-client';

interface FCMContextState {
  fcmSw: ServiceWorkerRegistration;
  messageToken: string;
}

const FCMContext = createContext<FCMContextState | undefined>(undefined);

function useFCMContext(): FCMContextState {
  const context = useContext(FCMContext);
  if (!context) throw new Error('useSWContext must be used in a provider');
  return context;
}

function FCMProvider({ children }: React.PropsWithChildren<Record<string, any>>): JSX.Element {
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration>();
  const [messageToken, setMessageToken] = useState<string>();

  useEffect(() => {
    if (!('serviceWorker' in window.navigator)) return;

    const hasRequiredMessagingConfig = Boolean(
      firebaseConfig.apiKey &&
        firebaseConfig.projectId &&
        firebaseConfig.messagingSenderId &&
        firebaseConfig.appId,
    );

    if (!hasRequiredMessagingConfig) {
      console.warn(
        'Firebase Messaging is unavailable because required Firebase configuration is missing; notifications are disabled.',
      );
      return;
    }

    window.navigator.serviceWorker
      .register(`/firebase-messaging-sw.js`)
      .then(listenForNotifications)
      .catch((error) => {
        console.warn(
          'Firebase Messaging service worker registration failed; notifications are disabled.',
          error,
        );
      });
  }, []);

  /**
   * Initializes the firebase messaging API
   * to listen for and recieve announcements
   */
  const listenForNotifications = async (registration: ServiceWorkerRegistration) => {
    try {
      // Initialize firebase app and get messaging before requesting notification permission.
      if (firebase.apps.length <= 0) firebase.initializeApp(firebaseConfig);
      const messaging = firebase.messaging();

      // Set service worker registration object to state variable
      setSwRegistration(registration);
      console.log('Service Worker registered successfully');

      // Ask user to enable notifications
      // If not granted, exit
      if (Notification.permission === 'default') await Notification.requestPermission();
      if (Notification.permission !== 'granted') return;

      // Get token and save in database
      const token = await messaging.getToken({
        vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY,
      });
      await RequestHelper.post<{ token: string }, void>(
        '/api/tokens',
        { headers: { 'Content-Type': 'application/json' } },
        { token },
      );
      setMessageToken(token);

      // Listen for messages
      messaging.onMessage((payload) => {
        const { announcement, iconUrl } = payload.data;
        const options = {
          body: announcement,
          icon: iconUrl,
          tag: new Date().toUTCString(),
        };
        registration.showNotification('HackPortal Announcement', options);
      });
    } catch (error) {
      console.warn('Firebase Messaging is unavailable; notifications are disabled.', error);
    }
  };

  const swContextValue: FCMContextState = {
    fcmSw: swRegistration,
    messageToken,
  };

  return <FCMContext.Provider value={swContextValue}>{children}</FCMContext.Provider>;
}

export { FCMContext, FCMProvider, useFCMContext };
