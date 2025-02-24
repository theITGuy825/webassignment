import { getDoc, getDocs, addDoc, getFirestore, collection } from
"firebase/firestore";
import { initializeApp } from "firebase/app";
import { GoogleGenerativeAI } from '@google/generative-ai';


// import { getAuth } from 'firebase/auth';

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
const incomeInput = document.getElementById('incomeInput');
const addIncomeBtn = document.getElementById('addIncomeBtn');
const incomeList = document.getElementById('incomeList');
const expenseAmountInput = document.getElementById('expenseAmountInput');
const expenseCategoryInput = document.getElementById('expenseCategoryInput');
const addExpenseBtn = document.getElementById('addExpenseBtn');
const expenseList = document.getElementById('expenseList');
const totalIncomeElem = document.getElementById('totalIncome');
const totalExpensesElem = document.getElementById('totalExpenses');
const balanceElem = document.getElementById('balance');

// Load data on window load
window.addEventListener('load', async () => {
    await renderIncome();
    await renderExpenses();
    updateSummary();
});

// Add Income
addIncomeBtn.addEventListener('click', async () => {
    const incomeAmount = parseFloat(incomeInput.value.trim());
    if (!isNaN(incomeAmount) && incomeAmount > 0) {
        await addIncomeToFirestore(incomeAmount);
        incomeInput.value = '';
        renderIncome();
        updateSummary();
    } else {
        alert("Please enter a valid income amount.");
    }
});

// Add Expense
addExpenseBtn.addEventListener('click', async () => {
    const expenseAmount = parseFloat(expenseAmountInput.value.trim());
    const expenseCategory = expenseCategoryInput.value.trim();
    if (!isNaN(expenseAmount) && expenseAmount > 0 && expenseCategory) {
        await addExpenseToFirestore(expenseAmount, expenseCategory);
        expenseAmountInput.value = '';
        expenseCategoryInput.value = '';
        renderExpenses();
        updateSummary();
    } else {
        alert("Please enter a valid expense amount and category.");
    }
});

// Fetch and render incomes
async function renderIncome() {
    const incomesSnapshot = await getDocs(collection(db, "incomes"));
    incomeList.innerHTML = '';
    let totalIncome = 0;

    incomesSnapshot.forEach(doc => {
        const incomeItem = document.createElement('li');
        incomeItem.textContent = `$${doc.data().amount}`;
        incomeItem.id = doc.id;
        incomeList.appendChild(incomeItem);
        totalIncome += doc.data().amount;
    });

    totalIncomeElem.textContent = totalIncome.toFixed(2);
}

// Fetch and render expenses
async function renderExpenses() {
    const expensesSnapshot = await getDocs(collection(db, "expenses"));
    expenseList.innerHTML = '';
    let totalExpenses = 0;

    expensesSnapshot.forEach(doc => {
        const expenseItem = document.createElement('li');
        expenseItem.textContent = `$${doc.data().amount} - ${doc.data().category}`;
        expenseItem.id = doc.id;
        expenseList.appendChild(expenseItem);
        totalExpenses += doc.data().amount;
    });

    totalExpensesElem.textContent = totalExpenses.toFixed(2);
}

// Update Summary
function updateSummary() {
    const totalIncome = parseFloat(totalIncomeElem.textContent);
    const totalExpenses = parseFloat(totalExpensesElem.textContent);
    const balance = totalIncome - totalExpenses;
    balanceElem.textContent = balance.toFixed(2);
}

// Add Income to Firestore with localStorage fallback
async function addIncomeToFirestore(amount) {
    try {
        // Attempt to add income to Firestore
        await addDoc(collection(db, "incomes"), {
            amount: amount,
        });
        console.log('Income added to Firebase.');
    } catch (err) {
        // If Firebase fails, save to localStorage
        console.error('Failed to add income to Firebase, saving to localStorage:', err);

        // Retrieve existing incomes from localStorage or initialize as empty array
        let savedIncomes = JSON.parse(localStorage.getItem('incomes')) || [];
        
        // Add new income to the list
        savedIncomes.push({ amount: amount, date: new Date() });

        // Save the updated list back to localStorage
        localStorage.setItem('incomes', JSON.stringify(savedIncomes));

        alert('Income saved locally as Firebase is unavailable.');
    }
}

// Add Expense to Firestore with localStorage fallback
async function addExpenseToFirestore(amount, category) {
    try {
        // Attempt to add expense to Firestore
        await addDoc(collection(db, "expenses"), {
            amount: amount,
            category: category,
        });
        console.log('Expense added to Firebase.');
    } catch (err) {
        // If Firebase fails, save to localStorage
        console.error('Failed to add expense to Firebase, saving to localStorage:', err);

        // Retrieve existing expenses from localStorage or initialize as empty array
        let savedExpenses = JSON.parse(localStorage.getItem('expenses')) || [];
        
        // Add new expense to the list
        savedExpenses.push({ amount: amount, category: category, date: new Date() });

        // Save the updated list back to localStorage
        localStorage.setItem('expenses', JSON.stringify(savedExpenses));

        alert('Expense saved locally as Firebase is unavailable.');
    }
}






// Chatbot Implementation
const chatHistory = document.getElementById('chat-history');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');

async function getApiKey() {
    let snapshot = await getDoc(doc(db, "apikey", "googlegenai"));
    return snapshot.data().key;
}

async function askChatBot(request) {
    const apiKey = await getApiKey();
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const response = await model.generateContent(request);
    return response.text();
}

function appendMessage(text, isUser = false) {
    const message = document.createElement("div");
    message.classList.add("message", isUser ? "user-message" : "bot-message");
    message.textContent = text;
    chatHistory.appendChild(message);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

sendBtn.addEventListener('click', async () => {
    const userInput = chatInput.value.trim();
    if (!userInput) return;
    appendMessage(userInput, true);
    chatInput.value = '';
    
    const botResponse = await askChatBot(userInput);
    appendMessage(botResponse, false);
});

// Load previous chat history if needed (from Firebase)
async function loadChatHistory() {
    const chatSnapshot = await getDocs(collection(db, "chat-history"));
    chatSnapshot.forEach(doc => {
        appendMessage(doc.data().message, doc.data().isUser);
    });
}

window.addEventListener('load', loadChatHistory);

