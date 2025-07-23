const firebaseConfig = {
    apiKey: "AIzaSyAfkARu79wTh-XGLZprTfxY4XDQ65F-gE8",
    authDomain: "bank-risma.firebaseapp.com",
    databaseURL: "https://bank-risma-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "bank-risma",
    storageBucket: "bank-risma.firebasestorage.app",
    messagingSenderId: "20349077579",
    appId: "1:20349077579:web:6b81da610dc0715289e5ce"
  };

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
