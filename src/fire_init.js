var firebase = require('firebase');

// Initialize Firebase
// TODO: Replace with your project's customized code snippet
var config = {
  apiKey: 'AIzaSyDmBanyZSoIbD-bBSy93pWd7NTf63wOTYc',
  authDomain: 'attendance-b3e2c.firebaseapp.com',
  databaseURL: 'https://attendance-b3e2c.firebaseio.com',
  projectId: 'attendance-b3e2c',
  storageBucket: 'attendance-b3e2c.appspot.com',
  messagingSenderId: '784617260551'
};
export default (!firebase.apps.length ? firebase.initializeApp(config) : firebase.app());
// Initialize Cloud Firestore through Firebase

if (firebase.apps.length && !firebase.apps[0].services_.firestore) {
  // Disable deprecated features
  firebase.firestore().settings({
    timestampsInSnapshots: true
  });
  firebase
    .firestore()
    .enablePersistence()
    .then(
      function() {
        console.log('we got persistance');
      },
      function(err) {
        if (err.code === 'failed-precondition') {
          // Multiple tabs open, persistence can only be enabled
          // in one tab at a a time.
          // ...
          console.log('Fale');
        } else if (err.code === 'unimplemented') {
          // The current browser does not support all of the
          // features required to enable persistence
          // ...
          console.log('Fale');
        }
      }
    );
}
export const db = firebase.firestore();
