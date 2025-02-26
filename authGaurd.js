import { auth } from "./firebaseconfig";
import { onAuthStateChanged } from "firebase/auth";

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "login.html"; 
    }
});
