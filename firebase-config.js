// ========================================
// MONÉA - FIREBASE CONFIGURATION
// ========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


// ========================================
// FIREBASE CONFIGURATION
// ========================================

const firebaseConfig = {
    apiKey: "AIzaSyDr9n72wkVoHXDHv5TiAQondYOYrobYHXU",
    authDomain: "monea-expense-tracker.firebaseapp.com",
    projectId: "monea-expense-tracker",
    storageBucket: "monea-expense-tracker.firebasestorage.app",
    messagingSenderId: "299546959358",
    appId: "1:299546959358:web:f1c0595c0178dd014474af",
    measurementId: "G-CR5CPKFRQR"
};


// ========================================
// INITIALIZE FIREBASE
// ========================================

const app = initializeApp(firebaseConfig);


// ========================================
// INITIALIZE AUTHENTICATION
// ========================================

const auth = getAuth(app);


// ========================================
// INITIALIZE FIRESTORE
// ========================================

const db = getFirestore(app);


// ========================================
// EXPORT SERVICES
// ========================================

export {
    app,
    auth,
    db
};