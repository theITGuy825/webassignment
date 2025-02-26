import { getFirestore, collection, getDocs, addDoc, query, where } from "firebase/firestore";
import { app, db } from "./firebaseconfig";
import { GoogleGenerativeAI } from '@google/generative-ai';
import DOMPurify from 'dompurify';

// DOM Elements
const chatHistory = document.getElementById('chat-history');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const incomeInput = document.getElementById('incomeInput');
const addIncomeBtn = document.getElementById('addIncomeBtn');
const expenseAmountInput = document.getElementById('expenseAmountInput');
const expenseCategoryInput = document.getElementById('expenseCategoryInput');
const addExpenseBtn = document.getElementById('addExpenseBtn');
const totalIncomeElem = document.getElementById('totalIncome');
const totalExpensesElem = document.getElementById('totalExpenses');
const balanceElem = document.getElementById('balance');

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

// Load incomes and expenses on window load
window.addEventListener('load', async () => {
    const userId = firebase.auth().currentUser.uid;  // Get the current user ID
    await renderIncome(userId);
    await renderExpenses(userId);
    updateSummary();
});

// Fetch and render incomes for a specific user
async function renderIncome(userId) {
    const incomesQuery = query(collection(db, "incomes"), where("userId", "==", userId));
    const incomesSnapshot = await getDocs(incomesQuery);
    let totalIncome = 0;
    incomesSnapshot.forEach(doc => {
        totalIncome += doc.data().amount;
    });
    totalIncomeElem.textContent = totalIncome.toFixed(2);
}

// Fetch and render expenses for a specific user
async function renderExpenses(userId) {
    const expensesQuery = query(collection(db, "expenses"), where("userId", "==", userId));
    const expensesSnapshot = await getDocs(expensesQuery);
    let totalExpenses = 0;
    expensesSnapshot.forEach(doc => {
        totalExpenses += doc.data().amount;
    });
    totalExpensesElem.textContent = totalExpenses.toFixed(2);
}

// Update Summary
function updateSummary() {
    const totalIncome = parseFloat(totalIncomeElem.textContent) || 0;
    const totalExpenses = parseFloat(totalExpensesElem.textContent) || 0;
    balanceElem.textContent = (totalIncome - totalExpenses).toFixed(2);
}

// Add Income
addIncomeBtn.addEventListener('click', async () => {
    const userId = firebase.auth().currentUser.uid;  // Get the current user ID
    const incomeAmount = parseFloat(sanitizeInput(incomeInput.value.trim()));
    if (!isNaN(incomeAmount) && incomeAmount > 0) {
        await addDoc(collection(db, "incomes"), { 
            amount: incomeAmount, 
            userId: userId  // Store the userId along with the income
        });
        incomeInput.value = '';
        alert("Income added successfully!");
        renderIncome(userId);
        updateSummary();
    } else {
        alert("Please enter a valid income amount.");
    }
});

// Add Expense
addExpenseBtn.addEventListener('click', async () => {
    const userId = firebase.auth().currentUser.uid;  // Get the current user ID
    const expenseAmount = parseFloat(sanitizeInput(expenseAmountInput.value.trim()));
    const expenseCategory = sanitizeInput(expenseCategoryInput.value.trim());
    if (!isNaN(expenseAmount) && expenseAmount > 0 && expenseCategory) {
        await addDoc(collection(db, "expenses"), { 
            amount: expenseAmount, 
            category: expenseCategory, 
            userId: userId  // Store the userId along with the expense
        });
        expenseAmountInput.value = '';
        expenseCategoryInput.value = '';
        alert("Expense added successfully!");
        renderExpenses(userId);
        updateSummary();
    } else {
        alert("Please enter a valid expense amount and category.");
    }
});
