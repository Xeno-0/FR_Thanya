let currentLanguage = "en";
const GEMINI_PROXY_ENDPOINT = "/api/gemini";

function decodeMojibake(text) {
  if (!text) return text;
  try {
    return decodeURIComponent(escape(text));
  } catch {
    return text;
  }
}

const HINDI_TEXT = {
  "Quick Diagnosis": "त्वरित निदान",
  "Expert Advice": "विशेषज्ञ सलाह",
  "Health Tips": "स्वास्थ्य सुझाव",
  "Feedback": "प्रतिक्रिया",
  "Translate": "अनुवाद करें",
  "The Paw-fect advice, instantly.": "सही सलाह, तुरंत।",
  "Furst Response provides immediate healthcare guidance for your furry friends. Get quick diagnoses, expert health tips, and peace of mind.": "Furst Response आपके प्यारे साथी के लिए तुरंत स्वास्थ्य मार्गदर्शन देता है। त्वरित निदान, विशेषज्ञ सुझाव और मन की शांति पाएं।",
  "Check Symptoms Now": "अभी लक्षण जांचें",
  "Quick Symptom Diagnosis": "त्वरित लक्षण निदान",
  "Describe your dog's symptoms and get immediate insights on possible conditions and recommended actions": "अपने कुत्ते के लक्षण लिखें और संभावित स्थितियों व सुझाए गए कदमों पर तुरंत जानकारी पाएं।",
  "Canine Health Assistant": "कैनाइन स्वास्थ्य सहायक",
  "Hello! I'm the Furst Response Health Assistant. How can I help your dog today? Please describe any symptoms you've noticed.": "नमस्ते! मैं Furst Response स्वास्थ्य सहायक हूँ। आज मैं आपके कुत्ते की कैसे मदद कर सकता हूँ? कृपया देखे गए लक्षण बताएं।",
  "Trust no one, but the best": "भरोसा करें, सिर्फ सर्वश्रेष्ठ पर।",
  "Get Vet-Approved advice for your dog's health, on the click of a button.": "एक क्लिक पर अपने कुत्ते के लिए पशु-चिकित्सक द्वारा अनुमोदित सलाह पाएं।",
  "View Expert Advice": "विशेषज्ञ सलाह देखें",
  "Pet Health Tips": "पालतू स्वास्थ्य सुझाव",
  "Essential advice to keep your dog healthy and happy": "अपने कुत्ते को स्वस्थ और खुश रखने के लिए जरूरी सुझाव",
  "Nutrition Essentials": "पोषण आवश्यकताएं",
  "Feed your dog high-quality protein sources and ensure they have access to fresh water at all times. Avoid foods toxic to dogs like chocolate, grapes, and onions.": "अपने कुत्ते को उच्च गुणवत्ता वाला प्रोटीन दें और हमेशा ताजा पानी उपलब्ध रखें। चॉकलेट, अंगूर और प्याज जैसे विषैले खाद्य पदार्थों से बचें।",
  "Exercise Requirements": "व्यायाम आवश्यकताएं",
  "Most dogs need at least 30-60 minutes of exercise daily. Adjust based on breed, age, and health. Regular walks prevent obesity and promote cardiovascular health.": "अधिकांश कुत्तों को रोज 30-60 मिनट व्यायाम चाहिए। नस्ल, उम्र और स्वास्थ्य के अनुसार इसे समायोजित करें। नियमित सैर मोटापे को रोकती है और हृदय स्वास्थ्य बेहतर करती है।",
  "Vaccination Schedule": "टीकाकरण कार्यक्रम",
  "Keep vaccinations up to date. Core vaccines include rabies, distemper, parvovirus, and adenovirus. Consult your vet for a personalized schedule.": "टीकाकरण समय पर कराएं। मुख्य टीकों में रेबीज, डिस्टेंपर, पार्वोवायरस और एडेनोवायरस शामिल हैं। व्यक्तिगत शेड्यूल के लिए अपने पशु चिकित्सक से सलाह लें।",
  "Show More Tips": "और सुझाव दिखाएं",
  "Your Feedback Matters": "आपकी प्रतिक्रिया महत्वपूर्ण है",
  "Help us improve our service by sharing your experience": "अपना अनुभव साझा करके हमारी सेवा बेहतर बनाने में मदद करें",
  "Name": "नाम",
  "Phone Number": "फोन नंबर",
  "Rate Your Experience": "अपने अनुभव को रेट करें",
  "Comments": "टिप्पणियां",
  "Submit Feedback": "प्रतिक्रिया सबमिट करें",
  "Providing immediate healthcare guidance for your doggos :)": "आपके डॉगी के लिए तुरंत स्वास्थ्य मार्गदर्शन :)",
  "All rights reserved.": "सर्वाधिकार सुरक्षित।",
  "Made with &#10084;&#65039; and lots of coffee.": "&#10084;&#65039; और ढेर सारी कॉफी के साथ बनाया गया।",
  "Made with ❤️ and lots of coffee.": "❤️ और ढेर सारी कॉफी के साथ बनाया गया।",
  "Select Language": "भाषा चुनें",
  "English": "अंग्रेज़ी",
  "Hindi": "हिंदी",
};

const HINDI_PLACEHOLDERS = {
  "Describe your dog's symptoms...": "अपने कुत्ते के लक्षण लिखें...",
};

async function callGeminiAPI(prompt) {
  try {
    const response = await fetch(GEMINI_PROXY_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) throw new Error("API request failed");
    const data = await response.json();
    return data.text;
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

  if (translateBtn && languageModal && langOptions.length) {
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

    const savedLanguage = localStorage.getItem("furst-response-lang");
    if (savedLanguage === "hi" || savedLanguage === "en") {
      changeLanguage(savedLanguage);
    }
  }

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

  if (sendBtn && userInput) {
    sendBtn.addEventListener("click", sendMessage);
    userInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") sendMessage();
    });
  }

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
  localStorage.setItem("furst-response-lang", lang);
  document.documentElement.lang = lang === "hi" ? "hi" : "en";

  document.querySelectorAll("[data-en], [data-hi]").forEach((element) => {
    if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
      const placeholderKey = `data-${lang}-placeholder`;
      if (lang === "en" && element.hasAttribute("data-en-placeholder")) {
        element.placeholder = element.getAttribute("data-en-placeholder");
      } else if (lang === "hi") {
        const enPlaceholder = element.getAttribute("data-en-placeholder");
        const rawHiPlaceholder = element.getAttribute("data-hi-placeholder") || "";
        element.placeholder =
          HINDI_PLACEHOLDERS[enPlaceholder] ||
          decodeMojibake(rawHiPlaceholder) ||
          enPlaceholder ||
          element.placeholder;
      } else if (element.hasAttribute(placeholderKey)) {
        element.placeholder = element.getAttribute(placeholderKey);
      }
    } else if (lang === "en" && element.hasAttribute("data-en")) {
      element.textContent = element.getAttribute("data-en");
    } else if (lang === "hi") {
      const enText = element.getAttribute("data-en") || "";
      const rawHiText = element.getAttribute("data-hi") || "";
      element.textContent =
        HINDI_TEXT[enText] ||
        decodeMojibake(rawHiText) ||
        enText ||
        element.textContent;
    } else if (element.hasAttribute(`data-${lang}`)) {
      element.textContent = element.getAttribute(`data-${lang}`);
    }
  });
  const languageModal = document.getElementById("languageModal");
  if (languageModal) {
    languageModal.classList.remove("active");
  }
}
