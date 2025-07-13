import { auth, db } from './firebase-config.js';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';

const messagesDiv = document.getElementById('messages');
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');

let currentUser = null;

// Check auth and redirect if needed
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = 'signin.html';
  } else {
    currentUser = user;
    loadMessages();
  }
});

// Load and listen to messages in real-time
function loadMessages() {
  const messagesQuery = query(
    collection(db, 'peerCirclesMessages'),
    orderBy('timestamp', 'asc')
  );

  onSnapshot(messagesQuery, (snapshot) => {
    messagesDiv.innerHTML = '';
    snapshot.forEach((doc) => {
      const data = doc.data();
      const msgDiv = document.createElement('div');
      msgDiv.classList.add('message');

      const name = data.userName || 'Anonymous';
      const text = data.text;
      const time = data.timestamp ? data.timestamp.toDate().toLocaleTimeString() : '';

      msgDiv.innerHTML = `<strong>${name}</strong> <em>${time}</em><br>${text}`;
      messagesDiv.appendChild(msgDiv);
    });
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  });
}

// Handle sending a message
chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (!text) return;

  try {
    await addDoc(collection(db, 'peerCirclesMessages'), {
      userId: currentUser.uid,
      userName: currentUser.displayName || 'Anonymous',
      text,
      timestamp: serverTimestamp(),
    });
    messageInput.value = '';
  } catch (err) {
    console.error('Error sending message:', err);
    alert('Failed to send message.');
  }
});
