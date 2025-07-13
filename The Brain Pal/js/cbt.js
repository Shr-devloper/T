// cbt.js

const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");

function addMessage(sender, text) {
  const msg = document.createElement("div");
  msg.className = `message ${sender}`;
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// 🎉 Initial message
window.onload = () => {
  addMessage("bot", "Hi, I’m BrainPal 💬. I’m here to talk with you about anything you're carrying.");
};

// 💬 On submit
form.addEventListener("submit", async (e) => { // <<< Make this function async!
  e.preventDefault();
  const userInput = input.value.trim();
  if (!userInput) return;

  addMessage("user", userInput);
  input.value = "";

  // Add a "typing" indicator for better UX while waiting for reply
  const typingIndicator = document.createElement("div");
  typingIndicator.className = "message bot typing-indicator";
  typingIndicator.textContent = "BrainPal is typing...";
  chatBox.appendChild(typingIndicator);
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    const reply = await generateReply(userInput); // <<< AWAIT the reply here!

    // Remove typing indicator before adding the actual message
    chatBox.removeChild(typingIndicator);

    setTimeout(() => {
      addMessage("bot", reply);
    }, 600);

    // This part should be inside the async event listener,
    // but its condition needs to be checked *after* memory is updated
    // and `generateReply` (which updates memory) has finished.
    // Ensure `memory` is globally accessible or passed.
    // Assuming `memory` is globally accessible from brain.js due to `window.generateReply`.
    if (window.memory && window.memory.currentStage === "emotional_crisis") {
        setTimeout(() => {
            addMessage("bot", "✍️ Here’s a journaling prompt: *What is the voice in your head saying right now? What would you say back if you could be kind to yourself?*");
        }, 2000);
    }

  } catch (error) {
    console.error("Error getting bot reply:", error);
    // Remove typing indicator if there was an error
    chatBox.removeChild(typingIndicator);
    addMessage("bot", "Oops! I'm having a little trouble responding right now. Please try again.");
  }
});

// IMPORTANT: The `if (memory.currentStage === "emotional_crisis")` block
// was outside the event listener, meaning it would only run once on script load.
// It needs to be inside the submit handler to react to changes in memory.
// Make sure `memory` from brain.js is accessible (e.g., via `window.memory`).