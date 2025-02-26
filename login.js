import { auth } from "./firebaseconfig";
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup,
    setPersistence,
    browserLocalPersistence,
    onAuthStateChanged
} from "firebase/auth";

// DOM Elements
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const googleSignInBtn = document.getElementById("googleSignInBtn");
const biometricSignInBtn = document.getElementById("biometricSignInBtn");
const createAccountBtn = document.getElementById("createAccountBtn");
const messageElem = document.getElementById("message");

// Redirect on login
onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = "./main.html";
    }
});

// Login with Email and Password
loginBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    try {
        await setPersistence(auth, browserLocalPersistence);
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        messageElem.textContent = "Error: " + error.message;
    }
});

// Google Sign-In
googleSignInBtn.addEventListener("click", async () => {
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        messageElem.textContent = "Error: " + error.message;
    }
});

// Biometric Authentication (WebAuthn - Simplified)
biometricSignInBtn.addEventListener("click", async () => {
    if (!window.PublicKeyCredential) {
        messageElem.textContent = "Biometric authentication not supported.";
        return;
    }

    try {
        const publicKey = {
            challenge: new Uint8Array(32),
            rp: { name: "Your Website" },
            user: {
                id: new Uint8Array(16),
                name: "user@example.com",
                displayName: "User",
            },
            pubKeyCredParams: [{ type: "public-key", alg: -7 }],
        };

        const credential = await navigator.credentials.create({ publicKey });
        if (credential) {
            messageElem.textContent = "Biometric authentication successful!";
        } else {
            messageElem.textContent = "Biometric authentication failed.";
        }
    } catch (error) {
        messageElem.textContent = "Error: " + error.message;
    }
});

// Create Account with Email and Password
createAccountBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (email === "" || password === "") {
        messageElem.textContent = "Please enter both email and password.";
        return;
    }

    try {
        await createUserWithEmailAndPassword(auth, email, password);
        messageElem.textContent = "Account created successfully!";
    } catch (error) {
        messageElem.textContent = "Error: " + error.message;
    }
});
