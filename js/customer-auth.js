import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { auth } from "./firebase-config.js";



/* =========================
   CUSTOMER REGISTER
========================= */

const registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value.trim();

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

alert("Registration successful ✅");

window.location.href = "customer-login.html";

    } catch (error) {
      alert(error.message);
    }
  });
}



/* =========================
   CUSTOMER LOGIN
========================= */

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
const user = userCredential.user;

alert("Login successful ✅");
window.location.href = "index.html";

    } catch (error) {
      alert(error.message);
    }
  });
}



/* =========================
   AUTH STATE LISTENER
========================= */

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Logged in as:", user.email);
  } else {
    console.log("User not logged in");
  }
});
