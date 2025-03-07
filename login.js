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

// Redirect on login
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User authenticated, redirecting...");
        window.location.href = "/webassignment/main.html";
    }
});

// Login with Email and Password
loginBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    try {
        await setPersistence(auth, browserLocalPersistence);
        await signInWithEmailAndPassword(auth, email, password);
        console.log("Login successful!");
    } catch (error) {
        console.error("Login Error:", error.message);
    }
});

// Google Sign-In
googleSignInBtn.addEventListener("click", async () => {
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
        console.log("Google Sign-In successful!");
    } catch (error) {
        console.error("Google Sign-In Error:", error.message);
    }
});

// Biometric Authentication
biometricSignInBtn.addEventListener("click", async () => {
    if (!window.PublicKeyCredential) {
        console.error("Biometric authentication not supported.");
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
            console.log("Biometric authentication successful!");
        } else {
            console.error("Biometric authentication failed.");
        }
    } catch (error) {
        console.error("Biometric Auth Error:", error.message);
    }
});

// Create Account
createAccountBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (email === "" || password === "") {
        alert("Please enter both email and password.");
        return;
    }

    try {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Account created successfully!");
    } catch (error) {
        console.error("Account Creation Error:", error.message);
    }
});

// Enter keypress
emailInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        loginBtn.click();
    }
});

passwordInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        loginBtn.click();
    }
});

//  Google Sign-In 
emailInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        googleSignInBtn.click(); 
    }
});

passwordInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        googleSignInBtn.click();  
    }
});
