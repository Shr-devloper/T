// quest.js
import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// DOM Elements
const heading = document.getElementById("mood-heading");
const affirmation = document.getElementById("affirmation");
const prompt = document.getElementById("prompt");
const task = document.getElementById("task");
const journal = document.getElementById("journal");
const success = document.getElementById("success-message");
const historySidebar = document.getElementById("history-sidebar");

// Mood Data
const moodData = {
  sadness: {
    affirmation: "It's okay to feel this way. You're allowed to feel, and healing takes time.",
    prompt: "What has been weighing your heart the most lately?",
    task: "Play a calming song and sit with your feelings for 5 minutes."
  },
  anxiety: {
    affirmation: "You are safe in this moment. You’ve survived every hard day so far.",
    prompt: "What’s one thing you're anxious about? What would you say to a friend feeling that way?",
    task: "Take 5 deep belly breaths. Inhale slowly. Exhale fully."
  },
  anger: {
    affirmation: "Your anger is valid — it shows you care. Let's find its root.",
    prompt: "What boundary might have been crossed recently?",
    task: "Write down what made you angry — then safely tear it up or delete it."
  },
  numb: {
    affirmation: "Feeling numb is a feeling too. It's your mind asking for a pause.",
    prompt: "What do you wish you could feel right now, if anything?",
    task: "Stretch your arms wide, feel your body — you're here."
  },
  overthinking: {
    affirmation: "Your mind is trying to protect you. Let's slow it down.",
    prompt: "What’s one thought loop you’ve been stuck in lately?",
    task: "Close your eyes and name 5 things you can hear around you."
  }
};

// Get mood from URL
const urlParams = new URLSearchParams(window.location.search);
const mood = urlParams.get("mood");

// Function to render the mood quest
function renderQuest(mood) {
  if (moodData[mood]) {
    heading.innerText = `🌈 ${mood.charAt(0).toUpperCase() + mood.slice(1)} Quest`;
    affirmation.innerText = `✨ ${moodData[mood].affirmation}`;
    prompt.innerText = `🧠 Prompt: ${moodData[mood].prompt}`;
    task.innerText = `✅ Task: ${moodData[mood].task}`;
  } else {
    heading.innerText = "Mood not found 😕";
  }
}

// Function to load user's past mood quests
async function loadHistory(userId) {
  if (!historySidebar) return;

  try {
    const q = query(
      collection(db, "moodQuestEntries"),
      where("userId", "==", userId),
      orderBy("timestamp", "desc")
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      historySidebar.innerHTML = "<p>No past mood quests yet.</p>";
      return;
    }

    let html = "";
    snapshot.forEach(doc => {
      const data = doc.data();
      const date = data.timestamp?.toDate().toLocaleString() || "Unknown time";

      html += `
        <div class="entry">
          <h4>🧠 ${data.mood}</h4>
          <p><strong>Date:</strong> ${date}</p>
          <p>${data.response.slice(0, 80)}...</p>
        </div>
      `;
    });

    historySidebar.innerHTML = html;

  } catch (err) {
    console.error("Error loading history:", err);
    historySidebar.innerHTML = "<p>Failed to load history.</p>";
  }
}

// Wait for user authentication
onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("Please log in to access quests.");
    window.location.href = "signin.html";
    return;
  }

  // Render the current quest and load history
  renderQuest(mood);
  loadHistory(user.uid);

  // Attach the submit handler to the global scope
  window.submitEntry = async function () {
    const response = journal.value.trim();
    if (!response) {
      alert("✏️ Please write something before submitting.");
      return;
    }
success.innerText = "✅ Entry submitted and saved!";
console.log("Mood quest saved successfully!");
    const entry = {
      userId: user.uid,
      mood: mood || "unknown",
      response: response,
      timestamp: serverTimestamp()
    };

    try {
      await addDoc(collection(db, "moodQuestEntries"), entry);
      success.innerText = "✅ Entry submitted and saved!";
      journal.value = "";
      loadHistory(user.uid); // Refresh sidebar
    } catch (error) {
      console.error("❌ Error saving entry:", error);
      alert("There was an error saving your entry. Try again.");
    }
  };
});
