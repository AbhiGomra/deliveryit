// Deliveryit - Authentication Logic

import {
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { auth } from './firebase-config.js';

// DOM Elements
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const loginSpinner = document.getElementById('loginSpinner');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkExistingSession();
    setupEventListeners();
});

// Check if already logged in
function checkExistingSession() {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            window.location.href = 'admin.html';
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    loginForm.addEventListener('submit', handleLogin);
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        showError('Please enter both email and password');
        return;
    }

    // Show loading
    loginBtn.disabled = true;
  // showElement(loginSpinner);
    loginBtn.textContent = 'Signing in...';
  // hideError();

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Check if email is verified (optional)
        if (!user.emailVerified) {
            // You can enable email verification in Firebase Console
            // For now, we'll allow login without verification
        }

        // Redirect to admin dashboard
        window.location.href = 'admin.html';

    } catch (error) {
        console.error('Login error:', error);

        // Handle specific Firebase auth errors
        switch (error.code) {
            case 'auth/invalid-email':
                showError('Invalid email address');
                break;
            case 'auth/user-disabled':
                showError('This account has been disabled');
                break;
            case 'auth/user-not-found':
                showError('No account found with this email');
                break;
            case 'auth/wrong-password':
                showError('Incorrect password');
                break;
            case 'auth/invalid-credential':
                showError('Invalid email or password');
                break;
            case 'auth/too-many-requests':
                showError('Too many failed attempts. Please try again later');
                break;
            default:
                showError('Login failed. Please try again');
        }
    } finally {
        loginBtn.disabled = false;
      // hideElement(loginSpinner);
        loginBtn.textContent = 'Sign In';
    }
}

// Show error message
function showError(message) {
    errorText.textContent = message;
 // showElement(errorMessage);
}

// Hide error message
function hideError() {
    errorText.textContent = '';
}
