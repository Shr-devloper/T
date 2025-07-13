// firebase-config.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

const firebaseConfig = {
   apiKey: "AIzaSyD3X73IBMbcOAQcLi6PphuVr9Ss93HM6c4",
    authDomain: "the-brain-pal.firebaseapp.com",
    projectId: "the-brain-pal",
    storageBucket: "the-brain-pal.firebasestorage.app",
    messagingSenderId: "630356757334",
    appId: "1:630356757334:web:2b1dfa7af09fd2c455e4f7",
    measurementId: "G-FGRRJ7E2D3"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
