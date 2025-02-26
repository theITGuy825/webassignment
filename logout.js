import { auth } from "./firebaseconfig";
import { signOut } from "firebase/auth";

document.getElementById("logoutBtn").addEventListener("click", async () => {
    try {
        await signOut(auth);
        window.location.href = "index.html";  // Redirect to login after logout
    } catch (error) {
        alert("Logout failed: " + error.message);
    }
});
