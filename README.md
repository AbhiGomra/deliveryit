# Deliveryit - Grocery Delivery Website

A lightweight, full-stack grocery delivery website built with pure HTML, CSS, Vanilla JavaScript, and Firebase. Features a modern, mobile-first design similar to Instamart and Blinkit.

## Features

### Customer Features
- Browse products in a responsive grid layout
- Search products by name
- Filter products by category
- Add to cart with quantity management
- Checkout with Cash on Delivery (COD)
- Order without login

### Admin Features
- Secure admin login
- Product management (add, edit, delete)
- Category management (add, delete)
- Real-time order management
- Accept or reject orders

## Project Structure

```
deliveryit/
├── index.html          # Customer storefront
├── admin.html          # Admin dashboard
├── login.html          # Admin login page
├── css/
│   └── style.css       # All styles
├── js/
│   ├── firebase-config.js  # Firebase configuration
│   ├── utils.js           # Utility functions
│   ├── app.js             # Customer app logic
│   ├── admin.js           # Admin dashboard logic
│   └── auth.js            # Authentication logic
├── SPEC.md             # Project specification
└── README.md           # This file
```

## Firebase Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the steps
3. Enter your project name (e.g., "deliveryit")
4. Disable Google Analytics (optional, for simplicity)
5. Click "Create project"

### Step 2: Enable Authentication

1. In Firebase Console, go to **Build > Authentication**
2. Click "Get Started"
3. Go to **Sign-in method** tab
4. Enable **Email/Password**
5. Click "Save"

### Step 3: Create Admin User

1. In Authentication, go to **Users** tab
2. Click "Add user"
3. Enter admin email and password
4. Click "Add user"

### Step 4: Enable Firestore Database

1. In Firebase Console, go to **Build > Firestore Database**
2. Click "Create database"
3. Select location (choose closest to you)
4. Start in **Test mode** (we'll update security rules later)
5. Click "Create"

### Step 5: Get Firebase Config

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click the web icon (</>)
4. Register app (optional name)
5. Copy the `firebaseConfig` object

### Step 6: Update Firebase Config

Open `js/firebase-config.js` and replace the placeholder values:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### Step 7: Set Security Rules

In Firestore Console, go to **Rules** tab and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Products: Public read, Admin write
    match /products/{productId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null;
    }

    // Categories: Public read, Admin write
    match /categories/{categoryId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null;
    }

    // Orders: Guest create, Admin read/update
    match /orders/{orderId} {
      allow create: if true;
      allow read, update: if request.auth != null;
      allow delete: if false;
    }
  }
}
```

Click "Publish" to save the rules.

## Deployment

### Option 1: Netlify (Recommended)

1. Create a [Netlify](https://www.netlify.com/) account
2. Go to "Sites" tab
3. Drag and drop the `deliveryit` folder (or connect to GitHub)
4. Your site will be deployed with a random URL
5. To use custom domain, follow Netlify's instructions

### Option 2: Firebase Hosting

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in project folder:
   ```bash
   firebase init hosting
   ```

4. Select your Firebase project
5. Set public directory to `.` (current folder)
6. Configure as single-page app: `No`
7. Set up automatic builds: `No`

8. Deploy:
   ```bash
   firebase deploy
   ```

## Adding Sample Data

### Add Categories

In Firestore Console > Firestore Database:

1. Click "Start collection"
2. Collection ID: `categories`
3. Document ID: Auto-generated
4. Add field:
   - Field: `name`
   - Type: `string`
   - Value: e.g., "Fruits", "Vegetables", "Dairy", "Bakery"
5. Add field:
   - Field: `createdAt`
   - Type: `timestamp`
   - Value: Current time

Repeat for more categories.

### Add Products

1. Click "Start collection"
2. Collection ID: `products`
3. Document ID: Auto-generated
4. Add fields:
   - `name`: string (e.g., "Organic Bananas")
   - `price`: number (e.g., 2.50)
   - `category`: string (must match category name)
   - `imageURL`: string (URL to product image)
   - `createdAt`: timestamp

## Usage

### Customer Flow

1. Open the website
2. Browse products or search
3. Click category to filter
4. Click "Add to Cart" on products
5. Click cart icon to view cart
6. Click "Proceed to Checkout"
7. Fill in name, phone, address
8. Click "Place Order (COD)"
9. See success message

### Admin Flow

1. Go to `/login.html`
2. Enter admin credentials
3. Manage products in "Products" tab
4. Manage categories in "Categories" tab
5. View and process orders in "Orders" tab
6. Click "Accept" or "Reject" on orders
7. Click "Logout" to sign out

## Technologies Used

- **Frontend**: HTML5, CSS3, ES6+ JavaScript
- **Backend**: Firebase Authentication, Firestore
- **No Frameworks**: Pure vanilla JavaScript, no React/Tailwind
- **Deployment**: Netlify / Firebase Hosting

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License - Feel free to use and modify for your own projects.
