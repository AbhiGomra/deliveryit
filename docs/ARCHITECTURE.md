# Deliveryit - Code Architecture Documentation

## Overview

Deliveryit is a single-vendor grocery delivery web application built with vanilla JavaScript and Firebase. The project uses a multi-page architecture where each HTML page has a dedicated JavaScript module handling its logic.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| HTML5 | Page structure |
| CSS3 | Styling with CSS variables |
| ES6 JavaScript | Frontend logic (ES6 Modules) |
| Firebase 9.22.0 | Backend (Firestore + Authentication) |
| Inter Font | Typography |

---

## File Structure

```
deliveryit/
├── index.html              # Main shopping page (customer)
├── admin.html             # Admin dashboard
├── login.html             # Admin login page
├── customer-login.html    # Customer login
├── customer-register.html # Customer registration
├── orders.html            # Customer order history
├── 404.html               # Firebase 404 page
├── forgot-email.html      # Password reset page
├── firebase.json          # Firebase config
├── SPEC.md                # Project specification
├── css/
│   └── style.css          # Global styles
└── js/
    ├── firebase-config.js # Firebase initialization
    ├── app.js             # Customer shopping logic
    ├── auth.js            # Admin authentication
    ├── admin.js           # Admin dashboard logic
    ├── orders.js          # Customer orders logic
    ├── customer-auth.js   # Customer authentication
    └── utils.js           # Shared utilities
```

---

## Page-to-Script Relationships

| HTML Page | JavaScript Module | Purpose |
|-----------|-------------------|----------|
| `index.html` | `js/app.js` | Product display, cart, checkout |
| `admin.html` | `js/admin.js` | Product/Category/Order management |
| `login.html` | `js/auth.js` | Admin login |
| `customer-login.html` | `js/customer-auth.js` | Customer login |
| `customer-register.html` | `js/customer-auth.js` | Customer registration |
| `forgot-email.html` | Inline script | Password reset |
| `orders.html` | `js/orders.js` | Customer order history |

---

## Data Flow Architecture

### Firebase Collections

```
Firestore Database (deliveryit-d9d5a)
│
├── products/
│   ├── id (auto)
│   ├── name (string)
│   ├── price (number)
│   ├── category (string)
│   ├── imageURL (string)
│   └── createdAt (timestamp)
│
├── categories/
│   ├── id (auto)
│   ├── name (string)
│   └── createdAt (timestamp)
│
└── orders/
    ├── id (auto)
    ├── customerName (string)
    ├── phone (string)
    ├── address (string)
    ├── items (array: {name, price, quantity})
    ├── totalAmount (number)
    ├── status (string: "pending" | "accepted" | "rejected")
    └── createdAt (timestamp)
```

### Authentication

```
Firebase Auth (deliveryit-d9d5a)
│
├── Admin Users
│   └── Stored in auth.js → admin.html dashboard
│
└── Customer Users
    └── Stored in customer-auth.js → index.html (logged-in state)
```

---

## File Linkages

### index.html → js/app.js

```
index.html loads:
├── Google Fonts (Inter)
├── css/style.css
└── js/app.js (module type)

app.js imports:
├── firebase-auth.js (getAuth)
├── firebase-firestore (getDocs, addDoc, etc.)
└── js/utils.js (formatPrice, getCart, saveCart, etc.)

Data Flow:
1. On load → fetch products from Firestore "products" collection
2. User clicks category → filter products by category
3. User searches → filter products by name
4. User adds to cart → save to localStorage
5. User checkout → add document to Firestore "orders" collection
```

### admin.html → js/admin.js

```
admin.html loads:
├── Google Fonts (Inter)
├── css/style.css
└── js/admin.js (module type)

admin.js imports:
├── firebase-auth.js
├── firebase-firestore
└── js/utils.js

Data Flow:
1. Check auth state → redirect to login.html if not authenticated
2. Load products from Firestore
3. Load categories from Firestore  
4. Load orders from Firestore (real-time with onSnapshot)
5. Admin actions:
   - Add product → addDoc to "products"
   - Edit product → updateDoc in "products"
   - Delete product → deleteDoc from "products"
   - Add category → addDoc to "categories"
   - Delete category → deleteDoc from "categories"
   - Accept order → updateDoc status "accepted"
   - Reject order → updateDoc status "rejected"
```

### login.html → js/auth.js

```
login.html loads:
├── Google Fonts (Inter)
├── css/style.css
└── js/auth.js (module type)

auth.js:
├── Uses Firebase Auth (signInWithEmailAndPassword)
└── On success → redirect to admin.html
```

### customer-login.html & customer-register.html → js/customer-auth.js

```
Both pages load:
├── Google Fonts (Inter)
├── css/style.css
└── js/customer-auth.js (module type)

customer-auth.js handles:
├── createUserWithEmailAndPassword (register)
├── signInWithEmailAndPassword (login)
└── onAuthStateChanged (auth state listener)

customer-register.html → success → customer-login.html
customer-login.html → success → index.html
```

### forgot-email.html (Inline Script)

```
forgot-email.html uses inline <script> (not module):
├── Imports auth from firebase-config.js
├── Imports sendPasswordResetEmail from Firebase Auth
└── Sends password reset email to user

Flow:
1. User enters email
2. Clicks "Reset Password"
3. Firebase sends reset email
4. User redirected to check inbox/spam
```

### orders.html → js/orders.js

```
orders.html loads:
├── Google Fonts (Inter)
├── css/style.css
└── js/orders.js (module type)

orders.js:
├── Load customer's orders from Firestore "orders" collection
├── Display order status (pending/accepted/rejected)
└── Filter by current user email
```

---

## Module Dependencies

```
firebase-config.js (core)
    ↓
    ├─→ auth.js (admin)
    ├─→ customer-auth.js
    ├─→ app.js
    ├─→ admin.js
    └─→ orders.js

utils.js (shared)
    ↓
    ├─→ app.js
    ├─→ admin.js
    └─→ orders.js
```

---

## Key Functions Reference

### utils.js

| Function | Purpose |
|----------|---------|
| `formatPrice(price)` | Format number to ₹ currency |
| `generateId()` | Generate unique ID |
| `getCart()` | Get cart from localStorage |
| `saveCart(cart)` | Save cart to localStorage |
| `calculateTotal(cart)` | Calculate cart total |
| `calculateItemCount(cart)` | Count cart items |
| `showElement(element)` | Show hidden element |
| `hideElement(element)` | Hide element |
| `createElement(html)` | Create element from HTML string |
| `debounce(func, wait)` | Debounce function |
| `sanitizeInput(input)` | Sanitize user input |
| `isValidPhone(phone)` | Validate phone number |

### app.js

| Function | Purpose |
|----------|---------|
| `loadProducts()` | Fetch all products from Firestore |
| `displayProducts(products)` | Render product grid |
| `filterByCategory(category)` | Filter products by category |
| `searchProducts(query)` | Search products by name |
| `addToCart(product)` | Add item to cart |
| `updateCartQuantity(id, quantity)` | Update item quantity |
| `removeFromCart(id)` | Remove item from cart |
| `openCart()` | Open cart modal |
| `closeCart()` | Close cart modal |
| `openCheckout()` | Open checkout form |
| `submitOrder()` | Submit order to Firestore |

### auth.js (admin)

| Function | Purpose |
|----------|---------|
| `login(email, password)` | Admin sign in |
| `checkAuth()` | Check auth state |
| `logout()` | Admin sign out |

### admin.js

| Function | Purpose |
|----------|---------|
| `loadAdminProducts()` | Load products for admin |
| `showAddProductModal()` | Show add product form |
| `saveProduct(product)` | Save product to Firestore |
| `deleteProduct(id)` | Delete product |
| `loadCategories()` | Load categories |
| `addCategory(name)` | Add category |
| `deleteCategory(id)` | Delete category |
| `loadOrders()` | Load orders (real-time) |
| `acceptOrder(id)` | Accept order |
| `rejectOrder(id)` | Reject order |

### customer-auth.js

| Function | Purpose |
|----------|---------|
| `register(email, password)` | Customer registration |
| `login(email, password)` | Customer login |
| `logout()` | Customer logout |
| `getCurrentUser()` | Get current user |

### orders.js

| Function | Purpose |
|----------|---------|
| `loadOrders()` | Load customer orders |
| `displayOrders(orders)` | Render order list |
| `getStatusBadge(status)` | Get status badge HTML |

---

## CSS Architecture

### CSS Variables (style.css)

```css
:root {
    /* Colors */
    --primary: #7C3AED;
    --primary-dark: #6D28D9;
    --primary-light: #A78BFA;
    --secondary: #111827;
    --background: #F9FAFB;
    --surface: #FFFFFF;
    --text-primary: #1F2937;
    --text-secondary: #6B7280;
    --border: #E5E7EB;
    --success: #10B981;
    --warning: #F59E0B;
    --danger: #EF4444;
    
    /* Shadows */
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
    --shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
    
    /* Border Radius */
    --radius-sm: 4px;
    --radius: 8px;
    --radius-lg: 12px;
    --radius-xl: 16px;
    
    /* Transitions */
    --transition: 200ms ease;
}
```

### Key CSS Sections

1. **Reset & Base** - Box-sizing, margins, typography
2. **Header** - Sticky header with search and cart
3. **Category Rail** - Horizontal scrollable categories
4. **Product Grid** - Responsive grid (2/3/4 columns)
5. **Cart Modal** - Slide-up cart sheet
6. **Forms** - Input styling, buttons
7. **Admin Panels** - Tab navigation, tables
8. **Order Cards** - Status badges, action buttons
9. **Utilities** - Helper classes (hidden, container)

---

## User Flows

### Customer: Browse & Order

```
1. Open index.html
   ↓
2. app.js loads products from Firestore
   ↓
3. User browses/searches/filters products
   ↓
4. User clicks "Add to Cart"
   → app.js saves to localStorage
   ↓
5. User clicks cart icon
   → Cart modal opens
   ↓
6. User clicks "Checkout"
   → Checkout form appears
   ↓
7. User fills: Name, Phone, Address
   ↓
8. User clicks "Place Order"
   → app.js adds order to Firestore
   → Success alert shown
   → Cart cleared
```

### Customer: Register & Login

```
Register Flow:
1. Open customer-register.html
   ↓
2. Fill email/password
   ↓
3. Click "Register"
   → customer-auth.js creates user in Firebase Auth
   → Redirects to customer-login.html
   ↓
4. User logs in
   → Redirects to index.html

Login Flow:
1. Open customer-login.html
   ↓
2. Fill email/password
   ↓
3. Click "Login"
   → customer-auth.js signs in
   → Redirects to index.html
```

### Admin: Manage Store

```
1. Open login.html
   ↓
2. Enter admin credentials
   ↓
3. Click "Login"
   → auth.js authenticates
   → Redirects to admin.html
   ↓
4. Admin dashboard loads
   → admin.js checks auth state
   → Loads products, categories, orders
   ↓
5. Admin can:
   - Add/Edit/Delete products (Products tab)
   - Add/Delete categories (Categories tab)
   - Accept/Reject orders (Orders tab)
```

---

## Local Storage Keys

| Key | Data | Purpose |
|-----|------|---------|
| `deliveryit_cart` | Array of cart items | Persist cart between sessions |

---

## Security Considerations

1. **Firestore Rules** - Products: Public read, Admin write
2. **Auth** - Admin and customer auth separated
3. **Input Sanitization** - Uses utils.js sanitizeInput()
4. **Phone Validation** - Uses utils.js isValidPhone()

---

## Development Notes

- All Firestore operations use Firebase SDK 9 (modular)
- ES6 modules with `type="module"` in script tags
- No build step required - runs directly in browser
- Deploy to Firebase Hosting or Netlify
- Use Firebase Emulator for local development
