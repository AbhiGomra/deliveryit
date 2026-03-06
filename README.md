# Deliveryit 🛒

A single-vendor grocery delivery web application built with vanilla JavaScript and Firebase.

## Overview

Deliveryit is a lightweight, mobile-first grocery store allowing guests to browse products and place Cash on Delivery (COD) orders, with a protected admin dashboard for inventory and order management.

## Features

### Customer Features
- 📱 Mobile-first responsive design
- 🔍 Product search functionality
- 🏷️ Category-based filtering
- 🛒 Shopping cart with localStorage persistence
- 📦 Cash on Delivery (COD) checkout
- 📜 Order history tracking

### Admin Features
- 📊 Dashboard with real-time analytics
- 🛍️ Product management (add, edit, delete)
- 📂 Category management
- 📋 Order management (accept/reject)
- 🔐 Secure admin authentication

## Tech Stack

| Technology | Purpose |
|------------|---------|
| HTML5 | Page structure |
| CSS3 | Styling with CSS variables |
| ES6 JavaScript | Frontend logic (ES6 Modules) |
| Firebase 9.22.0 | Backend (Firestore + Authentication) |
| Inter Font | Typography |

## Project Structure

```
deliveryit/
├── index.html              # Main shopping page
├── admin.html              # Admin dashboard
├── login.html              # Admin login
├── customer-login.html     # Customer login
├── customer-register.html  # Customer registration
├── orders.html             # Customer order history
├── forgot-email.html       # Password reset
├── 404.html                # Firebase 404 page
├── css/
│   └── style.css           # Global styles
├── js/
│   ├── firebase-config.js  # Firebase initialization
│   ├── app.js              # Customer shopping logic
│   ├── auth.js             # Admin authentication
│   ├── admin.js            # Admin dashboard logic
│   ├── orders.js           # Customer orders
│   ├── customer-auth.js    # Customer authentication
│   └── utils.js            # Shared utilities
├── SPEC.md                 # Project specification
└── README.md               # This file
```

## Getting Started

### Prerequisites
- Node.js (optional, for local development)
- Firebase account

### Firebase Setup

1. Create a Firebase project at [firebase.google.com](https://firebase.google.com)
2. Enable **Authentication** (Email/Password)
3. Enable **Firestore Database**
4. Copy your Firebase config to `js/firebase-config.js`

### Firestore Collections

Create these collections in Firestore:

```
products/
├── name (string)
├── price (number)
├── category (string)
├── imageURL (string)
└── createdAt (timestamp)

categories/
├── name (string)
└── createdAt (timestamp)

orders/
├── customerName (string)
├── phone (string)
├── address (string)
├── items (array)
├── totalAmount (number)
├── status (string)
└── createdAt (timestamp)
```

### Running Locally

Simply open `index.html` in a browser, or use a local server:

```bash
# Using Python
python -m http.server

# Using Node.js
npx serve
```

## Live Demo

[Add your deployed URL here]

## Color Palette

| Role | Color | Hex |
|------|-------|-----|
| Primary | Vivid Purple | #7C3AED |
| Secondary | Rich Black | #111827 |
| Background | Off-White | #F9FAFB |
| Success | Emerald | #10B981 |
| Danger | Red | #EF4444 |

## License

MIT License
