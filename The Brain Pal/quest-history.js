// quest-history.js
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
import { collection, query, where, orderBy, getDocs } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js';

const historyContainer = document.getElementById("history-container");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Please log in to view your history.");
    window.location.href = "signin.html";
    return;
  }

  try {
    const q = query(
      collection(db, "moodQuestEntries"),
      where("userId", "==", user.uid),
      orderBy("timestamp", "desc")
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      historyContainer.innerHTML = "<p>😐 No mood quests found. Start your first one today!</p>";
      return;
    }

    let html = "";
    querySnapshot.forEach(doc => {
      const data = doc.data();
      const date = data.timestamp?.toDate().toLocaleString() || "Unknown time";

      html += `
        <div class="quest-entry">
          <h3>🧠 Mood: ${data.mood}</h3>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Your thoughts:</strong> ${data.response}</p>
          <hr/>
        </div>
      `;
    });

    historyContainer.innerHTML = html;

  } catch (err) {
    console.error("Error fetching mood quests:", err);
    historyContainer.innerHTML = "<p>⚠️ Failed to load history. Try again later.</p>";
  }
});
