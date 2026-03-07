import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { auth } from './firebase-config.js';

const googleProvider = new GoogleAuthProvider();
// Request email and profile scopes for Google Sign-In
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Mobile detection helper
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
    || window.innerWidth <= 768;
};

// Show loading state on button
const setButtonLoading = (button, isLoading) => {
  if (!button) return;
  
  if (isLoading) {
    button.disabled = true;
    button.dataset.originalText = button.innerHTML;
    button.innerHTML = '<span>Loading...</span>';
  } else {
    button.disabled = false;
    if (button.dataset.originalText) {
      button.innerHTML = button.dataset.originalText;
    }
  }
};

// Handle Firebase auth errors with user-friendly messages
const handleAuthError = (error) => {
  console.error('Auth error:', error);
  
  let message = 'An error occurred. Please try again.';
  
  switch (error.code) {
    case 'auth/popup-closed-by-user':
      message = 'Sign-in was cancelled. Please try again.';
      break;
    case 'auth/cancelled-popup-request':
      message = 'Only one popup allowed at a time.';
      break;
    case 'auth/operation-not-allowed':
      message = 'Google Sign-In is not enabled. Contact admin.';
      break;
    case 'auth/unauthorized-domain':
      message = 'This domain is not authorized for OAuth. Contact admin.';
      break;
    case 'auth/network-request-failed':
      message = 'Network error. Check your internet connection.';
      break;
    case 'auth/too-many-requests':
      message = 'Too many attempts. Please wait a moment and try again.';
      break;
    case 'auth/user-disabled':
      message = 'This account has been disabled.';
      break;
    default:
      message = error.message || 'An error occurred during sign-in.';
  }
  
  alert(message);
};

// Unified Google Sign-In handler
const handleGoogleAuth = async (button, destination = 'index.html') => {
  try {
    setButtonLoading(button, true);
    
    // Store destination for redirect flow
    sessionStorage.setItem('googleAuthDestination', destination);
    
    if (isMobile()) {
      // Mobile browsers block popups - use redirect
      await signInWithRedirect(auth, googleProvider);
    } else {
      // Desktop - use popup for better UX
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      alert('Login successful ');
      window.location.href = destination;
    }
  } catch (error) {
    setButtonLoading(button, false);
    
    // Don't show error for user cancellation
    if (error.code === 'auth/popup-closed-by-user' || 
        error.code === 'auth/cancelled-popup-request') {
      return;
    }
    
    handleAuthError(error);
  }
};

// Handle redirect result on page load
// Runs when user returns from Google OAuth redirect
(async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      const destination = sessionStorage.getItem('googleAuthDestination') || 'index.html';
      sessionStorage.removeItem('googleAuthDestination');
      
      setTimeout(() => {
        alert('Login successful ');
        window.location.href = destination;
      }, 500);
    }
  } catch (error) {
    console.error('Redirect result error:', error);
    handleAuthError(error);
  }
})();



/* =========================
   CUSTOMER REGISTER
========================= */

const registerForm = document.getElementById('registerForm');
const googleRegisterBtn = document.getElementById('googleRegisterBtn');

// Google Register Button with touch prevention
if (googleRegisterBtn) {
  googleRegisterBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
  }, { passive: false });
  
  googleRegisterBtn.addEventListener('click', (e) => {
    e.preventDefault();
    handleGoogleAuth(googleRegisterBtn, 'index.html');
  });
}

// Email Registration Form
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value.trim();
    const submitBtn = registerForm.querySelector('button[type= submit]');

    if (!email || !password) {
      alert('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }

    try {
      setButtonLoading(submitBtn, true);
      
      await createUserWithEmailAndPassword(auth, email, password);
      
      alert('Registration successful ');
      window.location.href = 'customer-login.html';
    } catch (error) {
      setButtonLoading(submitBtn, false);
      
      let message = 'Registration failed.';
      if (error.code === 'auth/email-already-in-use') {
        message = 'This email is already registered. Please login instead.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address.';
      } else if (error.code === 'auth/weak-password') {
        message = 'Password is too weak. Use at least 6 characters.';
      }
      
      alert(message);
    }
  });
}



/* =========================
   CUSTOMER LOGIN
========================= */

const loginForm = document.getElementById('loginForm');
const googleLoginBtn = document.getElementById('googleLoginBtn');

// Google Login Button with touch prevention
if (googleLoginBtn) {
  googleLoginBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
  }, { passive: false });
  
  googleLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    handleGoogleAuth(googleLoginBtn, 'index.html');
  });
}

// Email Login Form
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const submitBtn = loginForm.querySelector('button[type=submit]');

    if (!email || !password) {
      alert('Please enter email and password.');
      return;
    }

    try {
      setButtonLoading(submitBtn, true);
      
      await signInWithEmailAndPassword(auth, email, password);
      
      alert('Login successful ');
      window.location.href = 'index.html';
    } catch (error) {
      setButtonLoading(submitBtn, false);
      
      let message = 'Login failed.';
      if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email. Please register first.';
      } else if (error.code === 'auth/wrong-password') {
        message = 'Incorrect password.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address.';
      }
      
      alert(message);
    }
  });
}



/* =========================
   AUTH STATE LISTENER
========================= */

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('Logged in as:', user.email);
  } else {
    console.log('No user logged in');
  }
});
