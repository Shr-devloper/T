let memory = {
  history: [],
  dominantEmotion: null,
  dominantIntent: null,
  moodTrend: [],
  currentStage: null
};

// !!! REMOVE THIS BLOCK from brain.js - it's duplicated/out of place
// async function sendMessage() {
//     // ... (previous code)
//     try {
//         const botReply = await window.generateReply(userInput);
//         // Display bot reply
//         const botMessageDiv = document.createElement('div');
//         botMessageDiv.textContent = `Bot: ${botReply}`;
//         chatMessages.appendChild(botMessageDiv);
//     } catch (error) {
//         console.error("Error generating reply:", error);
//         const errorMessageDiv = document.createElement('div');
//         errorMessageDiv.textContent = "Oops! Something went wrong. Please try again.";
//         errorMessageDiv.style.color = 'red';
//         chatMessages.appendChild(errorMessageDiv);
//     }
//     // ... (remaining code)
// }
// !!! END REMOVAL

// Emotion detection
function detectEmotion(text) {
  const emoMap = {
    sadness: ["sad", "alone", "cry", "numb", "empty"],
    anxiety: ["anxious", "panic", "scared", "worried"],
    anger: ["angry", "mad", "furious", "irritated"],
    guilt: ["guilty", "regret", "blame"],
    gratitude: ["thank", "grateful", "appreciate"],
    hopeless: ["pointless", "give up", "end it"]
  };
  text = text.toLowerCase();
  for (const [emo, words] of Object.entries(emoMap)) {
    if (words.some(w => text.includes(w))) return emo;
  }
  return "neutral";
}

// Intent detection
function detectIntent(text) {
  const intentMap = {
    venting: ["no one", "everyone", "never", "always"],
    spiraling: ["worthless", "useless", "what's the point"],
    healing: ["feel better", "thanks", "appreciate this"],
    crisis: ["end it", "kill myself"],
    reflection: ["i think", "maybe", "wonder"]
  };
  text = text.toLowerCase();
  for (const [intent, phrases] of Object.entries(intentMap)) {
    if (phrases.some(p => text.includes(p))) return intent;
  }
  return "unknown";
}

// Stage logic
function determineStage(emotion, intent) {
  if (intent === "crisis") return "crisis";
  if (intent === "spiraling") return "emotional_crisis";
  if (intent === "venting") return "emotional_release";
  if (intent === "reflection") return "processing";
  if (intent === "healing" || emotion === "gratitude") return "healing";
  if (["sadness", "anxiety"].includes(emotion)) return "exploration";
  return "neutral";
}

// Memory update
function updateMemory(input, emotion, intent, stage) {
  memory.history.push({ text: input, emotion, intent });
  memory.dominantEmotion = emotion;
  memory.dominantIntent = intent;
  memory.currentStage = stage;
  memory.moodTrend.push(emotion);
  if (memory.moodTrend.length > 5) memory.moodTrend.shift();
}

// 🔌 GPT API fallback (frontend-only demo)
async function fetchFromGPT(userInput) {
  const API_KEY = "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";

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are an emotionally intelligent support companion. You help people through sadness, anxiety, heartbreak, and confusion. Speak warmly and ask gentle questions." },
          { role: "user", content: userInput }
        ]
      })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: response.statusText || 'Unknown error parsing JSON' } }));
        console.error(`GPT API response not OK: Status ${response.status}`, errorData);
        // Throw an error that the calling function (generateReply) can catch
        throw new Error(`GPT API error: ${response.status} - ${errorData.error?.message || response.statusText || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error fetching from GPT API (inside fetchFromGPT catch):", error);
    // Re-throw the error so that the calling `generateReply` (and ultimately `cbt.js`)
    // can catch it and display its own fallback message.
    throw error; // Or throw a new more generic error like new Error("API communication failed");
  }
}

// 💬 Main reply generator
async function generateReply(userInput) {
  const emotion = detectEmotion(userInput);
  const intent = detectIntent(userInput);
  const stage = determineStage(emotion, intent);

  updateMemory(userInput, emotion, intent, stage);

  // Rule-based replies (customize further as needed)
  if (intent === "healing") return "That’s beautiful. I’m glad you’re feeling a little lighter.";
  if (intent === "venting") return "Let it out — I’m listening. What’s weighing on your chest the most?";
  if (intent === "spiraling") return "Those thoughts can be heavy. What would it feel like to just pause with me here for a second?";
  if (intent === "reflection") return "You’re thinking deeply. Want to unpack that more with me?";
  if (intent === "crisis") return "I hear you, and your life deeply matters. Please consider reaching out to a real support line or someone you trust. You’re not alone."

  // Fallback to GPT API if no strong rule-based match
  // The outer try/catch in cbt.js will now handle errors from fetchFromGPT
  return await fetchFromGPT(userInput);
}

// Export for chatbot.js or main app
window.generateReply = generateReply;
// Also export memory so cbt.js can access it
window.memory = memory;
