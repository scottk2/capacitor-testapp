import React, { useEffect } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, IonSplitPane } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { SplashScreen } from '@capacitor/splash-screen';

import Menu from './components/Menu';
import Home from './pages/Home';
import routes from './routes';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

import './theme/variables.css';
import './theme/global.css';

import firebase from 'firebase/app';
import 'firebase/firebase-analytics';
import 'firebase/firebase-messaging';

var firebaseConfig = {
  apiKey: 'AIzaSyAu9sHdDuMUsZvR6R5RoIkb3YAn_vkKvdg',
  authDomain: 'quitline-c3784.firebaseapp.com',
  projectId: 'quitline-c3784',
  storageBucket: 'quitline-c3784.appspot.com',
  messagingSenderId: '289692394977',
  appId: '1:289692394977:web:362250420eb6c9ee8a1ea0',
  measurementId: 'G-J2JREPJ3ZT',
};

const tokenDivId = 'token_div';
const permissionDivId = 'permission_div';

const requestPermission = () => {
  console.log('Requesting permission...');
  Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      // TODO(developer): Retrieve a registration token for use with FCM.
      // In many cases once an app has been granted notification permission,
      // it should update its UI reflecting this.
      resetUI();
    } else {
      console.log('Unable to get permission to notify.');
    }
  });
};

firebase.initializeApp(firebaseConfig);

let messaging;

if (firebase.messaging.isSupported()) {
  messaging = firebase.messaging();
}

function resetUI() {
  clearMessages();
  showToken('loading...');
  // Get registration token. Initially this makes a network call, once retrieved
  // subsequent calls to getToken will return from cache.
  messaging
    .getToken({
      vapidKey:
        'BLKTCb43Hl3KL9ejh1OVDI6DlaMEvv09N-OJmDd-3VoYPr_tXD78s8tkx08Q7im38ojDdw35hz4YiiRarcryQkE',
    })
    .then(currentToken => {
      if (currentToken) {
        sendTokenToServer(currentToken);
        updateUIForPushEnabled(currentToken);
      } else {
        // Show permission request.
        console.log(
          'No registration token available. Request permission to generate one.',
        );
        // Show permission UI.
        updateUIForPushPermissionRequired();
        setTokenSentToServer(false);
      }
    })
    .catch(err => {
      console.log('An error occurred while retrieving token. ', err);
      showToken('Error retrieving registration token. ', err);
      setTokenSentToServer(false);
    });
}

function showToken(currentToken) {
  // Show token in console and UI.
  const tokenElement = document.querySelector('#token');
  tokenElement.textContent = currentToken;
}

// Send the registration token your application server, so that it can:
// - send messages back to this app
// - subscribe/unsubscribe the token from topics
function sendTokenToServer(currentToken) {
  if (!isTokenSentToServer()) {
    console.log('Sending token to server...');
    // TODO(developer): Send the current token to your server.
    setTokenSentToServer(true);
  } else {
    console.log(
      "Token already sent to server so won't send it again unless it changes",
    );
  }
}

function isTokenSentToServer() {
  return window.localStorage.getItem('sentToServer') === '1';
}

function setTokenSentToServer(sent) {
  window.localStorage.setItem('sentToServer', sent ? '1' : '0');
}

function showHideDiv(divId, show) {
  const div = document.querySelector('#' + divId);
  if (show) {
    div.style = 'display: visible';
  } else {
    div.style = 'display: none';
  }
}

function deleteToken() {
  // Delete registration token.
  messaging
    .getToken()
    .then(currentToken => {
      messaging
        .deleteToken(currentToken)
        .then(() => {
          console.log('Token deleted.');
          setTokenSentToServer(false);
          // Once token is deleted update UI.
          resetUI();
        })
        .catch(err => {
          console.log('Unable to delete token. ', err);
        });
    })
    .catch(err => {
      console.log('Error retrieving registration token. ', err);
      showToken('Error retrieving registration token. ', err);
    });
}

// Add a message to the messages element.
function appendMessage(payload) {
  const messagesElement = document.querySelector('#messages');
  const dataHeaderElement = document.createElement('h5');
  const dataElement = document.createElement('pre');
  dataElement.style = 'overflow-x:hidden;';
  dataHeaderElement.textContent = 'Received message:';
  dataElement.textContent = JSON.stringify(payload, null, 2);
  messagesElement.appendChild(dataHeaderElement);
  messagesElement.appendChild(dataElement);
}

// Clear the messages element of all children.
function clearMessages() {
  const messagesElement = document.querySelector('#messages');
  while (messagesElement.hasChildNodes()) {
    messagesElement.removeChild(messagesElement.lastChild);
  }
}

function updateUIForPushEnabled(currentToken) {
  showHideDiv(tokenDivId, true);
  showHideDiv(permissionDivId, false);
  showToken(currentToken);
}

function updateUIForPushPermissionRequired() {
  showHideDiv(tokenDivId, false);
  showHideDiv(permissionDivId, true);
}

const App = () => {
  useEffect(() => {
    SplashScreen.hide();
    // firebase.initializeApp(firebaseConfig);
    // firebase.analytics();

    if (firebase.messaging.isSupported()) {
      requestPermission();

      messaging.onMessage(payload => {
        console.log('App.js messaging.onMessage: Message received. ', payload);
        // Update the UI to include the received message.
        appendMessage(payload);
      });
    }

    // messaging
    //   .requestPermission()
    //   .then(() => {
    //     console.log('Have permission');
    //     return messaging.getToken();
    //   })
    //   .then(token => {
    //     console.log(token);
    //   })
    //   .catch(error => {
    //     console.log('No permissions', error);
    //   });
  }, []);

  return (
    <IonApp>
      <IonReactRouter>
        <IonSplitPane contentId="main">
          <div>
            <div id="token_div">
              <h4>Registration Token</h4>
              <p id="token"></p>
              <button onClick={deleteToken}>Delete Token</button>
            </div>
            <div id="permission_div">
              <h4>Needs Permission</h4>
              <p id="token"></p>
              <button onClick={requestPermission}>Request Permission</button>
            </div>
            <div id="messages"></div>
          </div>

          <Menu />
          <IonRouterOutlet id="main">
            <Route path="/home" component={Home} exact={true} />
            {routes.map((route, i) => (
              <Route
                key={i}
                path={route.url}
                component={route.component}
                exact={true}
              />
            ))}
            <Route exact path="/" render={() => <Redirect to="/home" />} />
          </IonRouterOutlet>
        </IonSplitPane>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
