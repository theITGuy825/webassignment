import { auth } from "./firebaseconfig";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// DOM Elements
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const googleSignInBtn = document.getElementById("googleSignInBtn");
const biometricSignInBtn = document.getElementById("biometricSignInBtn");
const messageElem = document.getElementById("message");

// Login with Email and Password
loginBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    try {
        await signInWithEmailAndPassword(auth, email, password);
        messageElem.textContent = "Login successful!";
    } catch (error) {
        messageElem.textContent = "Error: " + error.message;
    }
});

// Google Sign-In
googleSignInBtn.addEventListener("click", async () => {
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
        messageElem.textContent = "Google Sign-In successful!";
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
