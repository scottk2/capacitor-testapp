
/* global importScripts, firebase */
importScripts('https://www.gstatic.com/firebasejs/8.2.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.2.1/firebase-messaging.js');

console.log('===========================================');
console.log('FIREBASE SERVICE WORKER CARREGADO'); // debug info
console.log('===========================================');

var firebaseConfig = {
  apiKey: 'AIzaSyAu9sHdDuMUsZvR6R5RoIkb3YAn_vkKvdg',
  authDomain: 'quitline-c3784.firebaseapp.com',
  projectId: 'quitline-c3784',
  storageBucket: 'quitline-c3784.appspot.com',
  messagingSenderId: '289692394977',
  appId: '1:289692394977:web:362250420eb6c9ee8a1ea0',
  measurementId: 'G-J2JREPJ3ZT',
};

class CustomPushEvent extends Event {
  constructor(data) {
    super('push');

    Object.assign(this, data);
    this.custom = true;
  }
}

/*
 * Overrides push notification data, to avoid having 'notification' key and firebase blocking
 * the message handler from being called
 */
self.addEventListener('push', e => {
  // Skip if event is our own custom event
  if (e.custom) return;

  // Kep old event data to override
  const oldData = e.data;

  // Create a new event to dispatch, pull values from notification key and put it in data key,
  // and then remove notification key
  const newEvent = new CustomPushEvent({
    data: {
      ehheh: oldData.json(),
      json() {
        const newData = oldData.json();
        newData.data = {
          ...newData.data,
          ...newData.notification,
        };
        delete newData.notification;
        return newData;
      },
    },
    waitUntil: e.waitUntil.bind(e),
  });

  // Stop event propagation
  e.stopImmediatePropagation();

  // Dispatch the new wrapped event
  dispatchEvent(newEvent);
});

if (firebase.messaging.isSupported()) {
  firebase.initializeApp(firebaseConfig);
}

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  console.log(
    '[firebase-messaging-sw.js] Received background message ',
    payload,
  ); // debug info
  const { title, body, icon, itemId, ...restPayload } = payload.data;

  // When you send a web push notification you can add any number of action buttons. Each action button has the following fields:
  // Title: the label displayed to the user for the action button.
  // Link (optional): the page that opens up when the user clicks the button. If you leave it blank, the main link of the notification will be used.
  // Icon (optional): the URL of a small icon for the action button. An alternative to icons is to include emoticons or other symbols inside the title.
  // Action (optional): an ID for the action that can be used to trigger a Javascript callback. If a Javascript action with that ID is defined, it will be executed. Otherwise the action ID will be ignored and the link will be used instead.

  const notificationOptions = {
    body,
    icon: icon || '/icons/firebase-logo.png', // path to your "fallback" firebase notification logo
    itemId: itemId,
    data: restPayload,
    actions: [
      { action: 'like', title: 'Like' },
      { action: 'reply', title: 'Reply' },
    ],
  };
    
  return self.registration.showNotification(title, notificationOptions);
});

self.addEventListener('notificationclick', event => {
  console.log('[firebase-messaging-sw.js] notificationclick ', event); // debug info

  var itemId = event.notification.data["gcm.notification.itemId"];
  
  if (event.action === 'like') {
    //silentlyLikeItem();
    console.log('silentlyLikeItem');
  } else if (event.action === 'reply') {
    self.clients.openWindow('/messages?reply=' + itemId);
  } else {
    self.clients.openWindow('/messages?reply=' + itemId);
  }

  // click_action described at https://github.com/BrunoS3D/firebase-messaging-sw.js#click-action
  // if (event.notification.data && event.notification.data.click_action) {
  //   self.clients.openWindow(event.notification.data.click_action);
  // } else {
  //self.clients.openWindow(event.currentTarget.origin);
  // }

  // close notification after click
  event.notification.close();
});
