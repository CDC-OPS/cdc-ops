// CDC Operations Center - Firebase Cloud Messaging Service Worker
// Handles background push notifications when the app is closed or in the background.
// Foreground messages are handled by the app itself (onMessage in HTML).
//
// IMPORTANT: This file must be served from the SAME ORIGIN as the app.
// For GitHub Pages: place it at the repo root alongside index.html.
// Path becomes: https://cdc-ops.github.io/cdc-ops/firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Match the firebase config from the main app
firebase.initializeApp({
  apiKey: 'AIzaSyDOMrEPYpUEKVjC9j_2dHN-V_M0EGyAHzc',
  authDomain: 'fleet-tickets.firebaseapp.com',
  databaseURL: 'https://fleet-tickets-default-rtdb.firebaseio.com',
  projectId: 'fleet-tickets',
  storageBucket: 'fleet-tickets.firebasestorage.app',
  messagingSenderId: '680701889287',
  appId: '1:680701889287:web:de60f5e29c5e9e6e3a6c8a'
});

const messaging = firebase.messaging();

// Background message handler: fired when a push arrives and the app is closed/in background.
// We display a system notification with the payload's title and body.
messaging.onBackgroundMessage(function(payload) {
  const data = payload.data || {};
  const notification = payload.notification || {};
  const title = notification.title || data.title || 'CDC Operations';
  const body = notification.body || data.body || '';
  const options = {
    body: body,
    icon: '/cdc-ops/icon-192.png',
    badge: '/cdc-ops/icon-192.png',
    tag: data.tag || ('cdc-' + Date.now()),
    data: data,
    requireInteraction: data.urgent === '1',
    vibrate: [200, 100, 200]
  };
  return self.registration.showNotification(title, options);
});

// Click handler: when user taps the notification, open or focus the app and pass any deep-link.
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const data = event.notification.data || {};
  const targetUrl = data.url || '/cdc-ops/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // Focus existing app window if one is open
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.indexOf('/cdc-ops/') !== -1 && 'focus' in client) {
          client.postMessage({ type: 'notification-click', data: data });
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
