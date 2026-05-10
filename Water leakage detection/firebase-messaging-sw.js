
//permission and token

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');


firebase.initializeApp({

  apiKey: "AIzaSyDtJaA_cVdV6QtsNmDmbKZT8aGNnqiHiag",
  authDomain: "water-leakage-detection-4777e.firebaseapp.com",
  databaseURL: "https://water-leakage-detection-4777e-default-rtdb.firebaseio.com",
  projectId: "water-leakage-detection-4777e",
  storageBucket: "water-leakage-detection-4777e.firebasestorage.app",
  messagingSenderId: "535259921999",
  appId: "1:535259921999:web:b7f602fbbd5ab3d091743a"
});

 firebase.messaging();