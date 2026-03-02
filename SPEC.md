# Deliveryit - Grocery Delivery Website Specification

## 1. Project Overview

**Project Name:** Deliveryit
**Type:** Full-Stack Single-Vendor Grocery Delivery Web Application
**Core Functionality:** A lightweight, mobile-first grocery store allowing guest users to browse products and place Cash on Delivery (COD) orders, with a protected admin dashboard for inventory and order management.
**Target Users:** Mobile shoppers seeking quick, account-free grocery ordering; store owners managing catalog and orders.

## 2. Tech Stack

- **Frontend:** HTML5, CSS3, ES6+ JavaScript (ES6 Modules)
- **Backend:** Firebase (Authentication, Firestore)
- **No Frameworks:** Pure vanilla JavaScript, no React/Tailwind/Bootstrap
- **Deployment:** Netlify (frontend), Firebase Hosting

## 3. UI/UX Specification

### 3.1 Color Palette

| Role | Color | Hex Code |
|------|-------|----------|
| Primary | Vivid Purple | #7C3AED |
| Primary Dark | Deep Purple | #6D28D9 |
| Secondary | Rich Black | #111827 |
| Background | Off-White | #F9FAFB |
| Surface | Pure White | #FFFFFF |
| Text Primary | Dark Gray | #1F2937 |
| Text Secondary | Medium Gray | #6B7280 |
| Success | Emerald Green | #10B981 |
| Warning | Amber | #F59E0B |
| Danger | Red | #EF4444 |
| Border | Light Gray | #E5E7EB |

### 3.2 Typography

- **Font Family:** 'Inter', system-ui, -apple-system, sans-serif
- **Headings:** 700 weight
  - H1: 32px (mobile), 40px (desktop)
  - H2: 24px (mobile), 32px (desktop)
  - H3: 18px (mobile), 20px (desktop)
- **Body:** 400 weight, 16px
- **Small:** 14px
- **Prices:** 600 weight, #7C3AED

### 3.3 Spacing System

- **Base Unit:** 4px
- **Spacing Scale:** 4, 8, 12, 16, 24, 32, 48, 64px
- **Container Max-Width:** 1200px
- **Card Padding:** 16px
- **Grid Gap:** 16px (mobile), 24px (desktop)

### 3.4 Layout Structure

#### Customer View (index.html)

**Header (Fixed)**
- Logo: "Deliveryit" text with purple accent
- Search bar: Full-width below logo on mobile, inline on desktop
- Cart icon with item count badge

**Category Rail**
- Horizontal scrollable pills
- "All" category selected by default
- Active state: filled purple background

**Product Grid**
- Mobile: 2 columns
- Tablet (768px+): 3 columns
- Desktop (1024px+): 4 columns

**Cart Modal**
- Slide-up sheet on mobile
- Centered modal on desktop
- Item list with quantity controls
- Checkout form at bottom
- Sticky "Place Order" button

#### Admin View (login.html)

**Login Page**
- Centered card layout
- Email and password fields
- Login button
- Error message display

#### Admin Dashboard (admin.html)

**Navigation**
- Tabs: Products, Categories, Orders
- Logout button in header

**Products Panel**
- Add Product button
- Product table/grid with edit/delete actions
- Modal form for add/edit

**Categories Panel**
- Add Category input
- Category list with delete option

**Orders Panel**
- Real-time order list
- Status badges: Pending (amber), Accepted (green), Rejected (red)
- Accept/Reject buttons

### 3.5 Components

**Product Card**
- Image container (aspect-ratio 1:1, object-fit cover)
- Product name (max 2 lines, ellipsis)
- Price in purple
- "Add to Cart" button

**Category Pill**
- Rounded pill shape (border-radius: 20px)
- Horizontal padding: 16px
- Active: purple background, white text
- Inactive: light gray background, dark text

**Cart Item**
- Product thumbnail (48x48)
- Name and price
- Quantity controls (- / count / +)
- Remove button

**Order Card**
- Customer name and phone
- Address (truncated)
- Items summary
- Total amount
- Status badge
- Action buttons (Accept/Reject)

### 3.6 Animations & Effects

- Card hover: subtle lift (transform: translateY(-2px))
- Button hover: darken background 10%
- Modal: fade-in (opacity 0 -> 1, 200ms ease)
- Cart slide-up: translateY(100% -> 0, 300ms ease-out)
- Loading spinner: rotating circle
- Status change: smooth color transition

## 4. Database Schema (Firestore)

### Collection: products
```json
{
  "id": "auto-generated",
  "name": "Organic Bananas",
  "price": 2.50,
  "category": "Fruits",
  "imageURL": "https://example.com/banana.jpg",
  "createdAt": "timestamp"
}
```

### Collection: categories
```json
{
  "id": "auto-generated",
  "name": "Fruits",
  "createdAt": "timestamp"
}
```

### Collection: orders
```json
{
  "id": "auto-generated",
  "customerName": "John Doe",
  "phone": "555-0123",
  "address": "123 Main St, Apt 4",
  "items": [
    { "name": "Bananas", "price": 2.50, "quantity": 2 }
  ],
  "totalAmount": 5.00,
  "status": "pending",
  "createdAt": "timestamp"
}
```

## 5. Functionality Specification

### 5.1 Customer Features

**Product Browsing**
- Fetch all products from Firestore on page load
- Display in responsive grid
- Show loading state while fetching

**Search**
- Real-time filtering as user types
- Match product name (case-insensitive)
- Show "No products found" if empty

**Category Filter**
- Click category pill to filter
- "All" shows all products
- Update URL hash for bookmarking

**Cart Management**
- Add to cart: creates cart item or increments quantity
- Update quantity: min 1, max 99
- Remove item: delete from cart
- Persist to localStorage
- Show cart count in header

**Checkout**
- Open cart modal
- Fill form: Name (required), Phone (required), Address (required)
- Validate all fields
- Submit order to Firestore
- Show success message
- Clear cart

### 5.2 Admin Features

**Authentication**
- Login with email/password
- Session persistence
- Redirect if not authenticated
- Logout functionality

**Product Management**
- List all products
- Add new product (name, price, category, image URL)
- Edit existing product
- Delete product (with confirmation)

**Category Management**
- List all categories
- Add new category
- Delete category (with confirmation)

**Order Management**
- Real-time order updates (onSnapshot)
- View all orders sorted by date
- Accept order: update status to "accepted"
- Reject order: update status to "rejected"

## 6. Security Rules

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

## 7. File Structure

```
/deliveryit
├── index.html
├── admin.html
├── login.html
├── css/
│   └── style.css
├── js/
│   ├── firebase-config.js
│   ├── utils.js
│   ├── app.js
│   ├── admin.js
│   └── auth.js
└── README.md
```

## 8. Acceptance Criteria

### Customer Flow
- [ ] Products load from Firestore and display in grid
- [ ] Search filters products in real-time
- [ ] Category filter works correctly
- [ ] Add to cart updates cart count
- [ ] Cart persists across page refresh
- [ ] Quantity can be increased/decreased
- [ ] Items can be removed from cart
- [ ] Checkout form validates required fields
- [ ] Order submits to Firestore successfully
- [ ] Success message displays after order

### Admin Flow
- [ ] Login page requires authentication
- [ ] Invalid credentials show error message
- [ ] Dashboard accessible only when logged in
- [ ] Products can be added/edited/deleted
- [ ] Categories can be added/deleted
- [ ] Orders display in real-time
- [ ] Accept/Reject buttons update order status
- [ ] Logout redirects to login page

### Security
- [ ] Unauthenticated users cannot access admin
- [ ] Firestore rules prevent unauthorized writes
- [ ] Customer cannot modify products/categories
- [ ] Customer cannot view other orders
