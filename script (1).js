let currentLanguage = "en";
const GEMINI_API_KEY = "AIzaSyCVWOKesnFFeMky6He30nRk65bVnJQ4XPA";

// Base URL for API calls (adjust if needed)
const API_BASE_URL = '';

async function callGeminiAPI(prompt) {
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) throw new Error("API request failed");
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return currentLanguage === "en"
      ? "Sorry, I couldn't process your request. Please try again later."
      : "क्षमा करें, मैं आपका अनुरोध संसाधित नहीं कर पाया। कृपया बाद में पुनः प्रयास करें।";
  }
}

async function getBotResponse(userMessage) {
  const prompt = `
You are a professional veterinary assistant.

A dog owner reports these symptoms:
"${userMessage}"

Give:
1. Possible cause
2. Recommended action
3. Advice for the owner

At the end add:
Severity: low / medium / high
`;

  const geminiResponse = await callGeminiAPI(prompt);
  return parseGeminiResponse(geminiResponse);
}

function parseGeminiResponse(response) {
  let severity = "low"; // Default
  if (response.includes("Severity: high")) severity = "high";
  else if (response.includes("Severity: medium")) severity = "medium";

  const cleanedResponse = response
    .replace(/Severity: (low|medium|high)/g, "")
    .trim();

  return {
    response: cleanedResponse,
    severity: severity,
  };
}

// API Functions for Backend Integration
async function submitFeedback(feedbackData) {
  try {
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedbackData),
    });
    
    if (!response.ok) throw new Error('Failed to submit feedback');
    return await response.json();
  } catch (error) {
    console.error('Error submitting feedback:', error);
    // Fallback to localStorage if backend fails
    let feedbacks = JSON.parse(localStorage.getItem("feedbacks") || "[]");
    feedbackData.id = Date.now();
    feedbackData.timestamp = new Date().toISOString();
    feedbacks.push(feedbackData);
    localStorage.setItem("feedbacks", JSON.stringify(feedbacks));
    return { message: 'Feedback saved locally!' };
  }
}

async function saveAdviceToBackend(advice) {
  try {
    const response = await fetch('/api/advice/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ advice }),
    });
    
    if (!response.ok) throw new Error('Failed to save advice');
    return await response.json();
  } catch (error) {
    console.error('Error saving advice to backend:', error);
    // Fallback to localStorage
    let savedAdvice = JSON.parse(localStorage.getItem("savedDogAdvice") || "[]");
    if (!savedAdvice.includes(advice)) {
      savedAdvice.push(advice);
      localStorage.setItem("savedDogAdvice", JSON.stringify(savedAdvice));
    }
    return { savedAdvice };
  }
}

async function loadSavedAdviceFromBackend() {
  try {
    const response = await fetch('/api/advice/saved');
    if (!response.ok) throw new Error('Failed to load saved advice');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading saved advice from backend:', error);
    // Fallback to localStorage
    return JSON.parse(localStorage.getItem("savedDogAdvice") || "[]");
  }
}

async function deleteAdviceFromBackend(adviceToRemove) {
  try {
    const response = await fetch('/api/advice/saved', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ advice: adviceToRemove }),
    });
    
    if (!response.ok) throw new Error('Failed to delete advice');
    return await response.json();
  } catch (error) {
    console.error('Error deleting advice from backend:', error);
    // Fallback to localStorage
    let savedAdvice = JSON.parse(localStorage.getItem("savedDogAdvice") || "[]");
    savedAdvice = savedAdvice.filter(a => a !== adviceToRemove);
    localStorage.setItem("savedDogAdvice", JSON.stringify(savedAdvice));
    return { savedAdvice };
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const sections = document.querySelectorAll(".section");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.1 }
  );

  sections.forEach((section) => observer.observe(section));

  const translateBtn = document.getElementById("translateBtn");
  const languageModal = document.getElementById("languageModal");
  const langOptions = document.querySelectorAll(".lang-option");

  translateBtn.addEventListener("click", () =>
    languageModal.classList.add("active")
  );
  langOptions.forEach((option) => {
    option.addEventListener("click", () => {
      const lang = option.getAttribute("data-lang");
      changeLanguage(lang);
    });
  });
  languageModal.addEventListener("click", (e) => {
    if (e.target === languageModal) languageModal.classList.remove("active");
  });

  const chatMessages = document.getElementById("chatMessages");
  const userInput = document.getElementById("userInput");
  const sendBtn = document.getElementById("sendBtn");

  function addMessage(text, isUser = false) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add(
      "message",
      isUser ? "user-message" : "bot-message"
    );
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  async function sendMessage() {
    const message = userInput.value.trim();
    if (message) {
      addMessage(message, true);
      userInput.value = "";

      const typingIndicator = document.createElement("div");
      typingIndicator.classList.add("message", "bot-message");
      typingIndicator.textContent =
        currentLanguage === "en" ? "Typing..." : "टाइप कर रहा है...";
      chatMessages.appendChild(typingIndicator);
      chatMessages.scrollTop = chatMessages.scrollHeight;

      const botResponse = await getBotResponse(message);

      chatMessages.removeChild(typingIndicator);

      const responseDiv = document.createElement("div");
      responseDiv.classList.add("message", "bot-message");

      const responseText = document.createElement("div");
      responseText.textContent = botResponse.response;

      const severitySpan = document.createElement("span");
      severitySpan.classList.add("severity-indicator");

      if (botResponse.severity === "high") {
        severitySpan.classList.add("severity-high");
        severitySpan.textContent =
          currentLanguage === "en"
            ? "URGENT: See vet immediately"
            : "अत्यावश्यक: तुरंत पशु चिकित्सक को दिखाएँ";
      } else if (botResponse.severity === "medium") {
        severitySpan.classList.add("severity-medium");
        severitySpan.textContent =
          currentLanguage === "en"
            ? "CONCERNING: See vet soon"
            : "चिंताजनक: जल्द ही पशु चिकित्सक को दिखाएँ";
      } else {
        severitySpan.classList.add("severity-low");
        severitySpan.textContent =
          currentLanguage === "en"
            ? "MONITOR: Watch at home"
            : "निगरानी: घर पर देखें";
      }

      responseDiv.appendChild(responseText);
      responseDiv.appendChild(severitySpan);
      chatMessages.appendChild(responseDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }

  sendBtn.addEventListener("click", sendMessage);
  userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  // Updated Feedback Form Handler
  const feedbackForm = document.getElementById("feedbackForm");
  if (feedbackForm) {
    feedbackForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const feedbackData = {
        name: document.getElementById("name").value,
        phone: document.getElementById("phone").value,
        rating: document.querySelector('input[name="rating"]:checked')?.value || "0",
        comments: document.getElementById("comments").value,
      };

      const result = await submitFeedback(feedbackData);
      feedbackForm.reset();
      
      alert(
        currentLanguage === "en"
          ? "Thank you for your feedback!"
          : "आपकी प्रतिक्रिया के लिए धन्यवाद!"
      );
    });
  }

  // Initialize expert advice page if we're on expert.html
  initializeExpertAdvicePage();
});

// Expert Advice Page Functions
function initializeExpertAdvicePage() {
  const currentAdvice = document.getElementById("current-advice");
  const newAdviceBtn = document.getElementById("new-advice");
  const saveFavoriteBtn = document.getElementById("save-favorite");
  const savedList = document.getElementById("saved-list");
  const categoryButtons = document.querySelectorAll(".category-buttons button");

  if (!currentAdvice) return; // Not on expert advice page

  let currentCategory = "all";
  let savedAdvice = [];

  const expertAdvice = {
    all: [
      "Regular exercise is crucial for your dog's physical and mental health - aim for at least 30 minutes daily",
      "Mental stimulation through puzzle toys can prevent boredom and destructive behaviors",
      "Consistent training using positive reinforcement builds trust and good behavior",
      "Quality sleep is as important for dogs as it is for humans - ensure a comfortable sleeping area",
      "Regular veterinary check-ups can catch potential health issues early",
    ],
    physical: [
      "Brush your dog's teeth regularly to prevent dental disease",
      "Keep nails trimmed to avoid discomfort and mobility issues",
      "Regular grooming prevents matting and helps spot skin problems early",
      "Monitor your dog's weight - obesity leads to many health problems",
      "Provide fresh water at all times to maintain proper hydration",
    ],
    mental: [
      "Rotate toys weekly to keep your dog mentally engaged",
      "Teach new tricks to stimulate your dog's brain",
      "Provide safe chewing outlets to relieve stress and anxiety",
      "Maintain consistent routines to reduce canine anxiety",
      "Socialization with other dogs should be ongoing throughout their life",
    ],
    training: [
      "Use treats and praise immediately to reinforce good behavior",
      "Keep training sessions short (5-15 minutes) for best results",
      "Never punish after the fact - dogs live in the moment",
      "Teach 'leave it' and 'drop it' for safety and control",
      "Practice commands in different locations for better generalization",
    ],
    nutrition: [
      "Choose high-quality protein as the first ingredient in dog food",
      "Avoid foods toxic to dogs: chocolate, grapes, onions, and xylitol",
      "Measure meals to prevent overfeeding",
      "Introduce new foods gradually to avoid digestive upset",
      "Consult your vet before making significant diet changes",
    ],
  };

  // Load saved advice on page load
  loadSavedAdvice();

  newAdviceBtn.addEventListener("click", getRandomAdvice);
  saveFavoriteBtn.addEventListener("click", saveCurrentAdvice);

  categoryButtons.forEach((button) => {
    button.addEventListener("click", function () {
      categoryButtons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");
      currentCategory = this.dataset.category;
      getRandomAdvice();
    });
  });

  function getRandomAdvice() {
    const categoryAdvice = expertAdvice[currentCategory];
    const randomIndex = Math.floor(Math.random() * categoryAdvice.length);
    currentAdvice.textContent = categoryAdvice[randomIndex];
  }

  async function saveCurrentAdvice() {
    const advice = currentAdvice.textContent;
    if (advice && !advice.includes("Click")) {
      const result = await saveAdviceToBackend(advice);
      savedAdvice = result.savedAdvice || savedAdvice;
      renderSavedAdvice();

      saveFavoriteBtn.innerHTML = '<i class="fas fa-heart"></i> Saved!';
      setTimeout(() => {
        saveFavoriteBtn.innerHTML = '<i class="far fa-heart"></i> Save';
      }, 2000);
    }
  }

  async function loadSavedAdvice() {
    savedAdvice = await loadSavedAdviceFromBackend();
    renderSavedAdvice();
  }

  function renderSavedAdvice() {
    if (!savedList) return;
    
    savedList.innerHTML = savedAdvice
      .map(
        (advice) => `
          <div class="saved-item">
              <p>${advice}</p>
              <button class="delete-btn" data-advice="${advice}">
                  <i class="fas fa-trash"></i>
              </button>
          </div>
      `
      )
      .join("");

    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", async function () {
        const adviceToRemove = this.dataset.advice;
        const result = await deleteAdviceFromBackend(adviceToRemove);
        savedAdvice = result.savedAdvice || savedAdvice.filter(a => a !== adviceToRemove);
        renderSavedAdvice();
      });
    });
  }
}

function changeLanguage(lang) {
  currentLanguage = lang;
  document.querySelectorAll("[data-en], [data-hi]").forEach((element) => {
    if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
      const placeholderKey = `data-${lang}-placeholder`;
      if (element.hasAttribute(placeholderKey)) {
        element.placeholder = element.getAttribute(placeholderKey);
      }
    } else if (element.hasAttribute(`data-${lang}`)) {
      element.textContent = element.getAttribute(`data-${lang}`);
    }
  });
  document.getElementById("languageModal").classList.remove("active");
}