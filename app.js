import { getDoc, getDocs, addDoc, getFirestore, collection, doc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { GoogleGenerativeAI } from '@google/generative-ai';
import DOMPurify from 'dompurify';

const firebaseConfig = {
    apiKey: "AIzaSyAb7EcZ98mRD-VuGzyQZACBrcGPvR89iS0",
    authDomain: "webassingment-12663.firebaseapp.com",
    projectId: "webassingment-12663",
    storageBucket: "webassingment-12663.firebasestorage.app",
    messagingSenderId: "253077413212",
    appId: "1:253077413212:web:ab490f8c61a7547083b599"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
console.log("Firebase initialized:", app);
console.log("Firestore initialized:", db);

// DOM Elements
const chatHistory = document.getElementById('chat-history');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');

// Function to sanitize user input
function sanitizeInput(input) {
    return DOMPurify.sanitize(input);
}

// Function to append messages to chat history
function appendMessage(text, isUser = false) {
    const message = document.createElement("div");
    message.classList.add("message", isUser ? "user-message" : "bot-message");
    message.textContent = (isUser ? "User: " : "Chatbot: ") + text;
    chatHistory.appendChild(message);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

// Handle Enter key press for accessibility
chatInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        sendBtn.click();
    }
});

// Send button event listener
sendBtn.addEventListener("click", async () => {
    let userInput = chatInput.value.trim();
    if (!userInput) {
        alert("Input cannot be empty.");
        return;
    }
    
    userInput = sanitizeInput(userInput);
    appendMessage(userInput, true);
    chatInput.value = "";
    
    const botResponse = await askChatBot(userInput);
    appendMessage(botResponse, false);
});

async function askChatBot(request) {
    try {
        const apiKey = 'AIzaSyBkppk3HT86e4zfzq-YYg1OBiy6r5ybNeo';
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(request);
        return result.response.text();
    } catch (error) {
        console.error("Error with Generative AI:", error);
        return "Sorry, there was an error. Please try again later.";
    }
}
