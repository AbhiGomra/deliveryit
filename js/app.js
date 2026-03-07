// Deliveryit - Customer App Logic

import {
    getFirestore,
    collection,
    getDocs,
    addDoc,
    query,
    orderBy
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import {
    formatPrice,
    getCart,
    saveCart,
    calculateTotal,
    calculateItemCount,
    showElement,
    hideElement,
    createElement,
    debounce,
    sanitizeInput
} from './utils.js';

// Firebase config - import from firebase-config
import { db, auth } from './firebase-config.js';
import { signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "customer-login.html";
  }
});
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    alert("Logged out successfully");
    window.location.href = "customer-login.html";
  });
}
// State
let products = [];
let categories = [];
let cart = [];
let currentCategory = 'all';
let searchQuery = '';

// Calculate delivery charge based on cart total
function calculateDeliveryCharge(total) {
    if (total < 30) return 10;
    if (total < 100) return 7;
    if (total < 150) return 8;
    if (total < 181) return 9;
    if (total < 221) return 10;
    if (total < 301) return 12;
    if (total < 401) return 15;
    if (total < 500) return 17;
    if (total < 1001) return 20;
    if (total < 1501) return 23;
    if (total < 2001) return 25;
    if (total < 3001) return 35;
    if (total > 3000) return 50;
    return 50;
}

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const categoriesContainer = document.getElementById('categoriesContainer');
const searchInput = document.getElementById('searchInput');
const cartBtn = document.getElementById('cartBtn');
const cartCount = document.getElementById('cartCount');
const cartModal = document.getElementById('cartModal');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartItems = document.getElementById('cartItems');
const cartEmpty = document.getElementById('cartEmpty');
const cartFooter = document.getElementById('cartFooter');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutModal = document.getElementById('checkoutModal');
const closeCheckoutBtn = document.getElementById('closeCheckoutBtn');
const checkoutForm = document.getElementById('checkoutForm');
const summaryItems = document.getElementById('summaryItems');
const summaryTotal = document.getElementById('summaryTotal');
const placeOrderBtn = document.getElementById('placeOrderBtn');
const orderSpinner = document.getElementById('orderSpinner');
const successModal = document.getElementById('successModal');
const successBtn = document.getElementById('successBtn');
const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    loadProducts();
    loadCategories();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Search
    searchInput.addEventListener('input', debounce((e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        renderProducts();
    }, 300));

    // Cart modal
    cartBtn.addEventListener('click', () => openCartModal());
    closeCartBtn.addEventListener('click', () => closeCartModal());
    cartModal.addEventListener('click', (e) => {
        if (e.target === cartModal) closeCartModal();
    });

    // Checkout modal
    checkoutBtn.addEventListener('click', () => openCheckoutModal());
    closeCheckoutBtn.addEventListener('click', () => closeCheckoutModal());
    checkoutModal.addEventListener('click', (e) => {
        if (e.target === checkoutModal) closeCheckoutModal();
    });

    // Checkout form
    checkoutForm.addEventListener('submit', handleCheckout);

    // Success modal
    successBtn.addEventListener('click', () => closeSuccessModal());
}

// Load cart from localStorage
function loadCart() {
    cart = getCart();
    updateCartCount();
}

// Load products from Firestore
async function loadProducts() {
    try {
        showElement(loadingState);
        hideElement(emptyState);
        hideElement(productsGrid);

        const productsRef = collection(db, 'products');
        const snapshot = await getDocs(productsRef);

        products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log('Products loaded:', products.length);
        renderProducts();
    } catch (error) {
        console.error('Error loading products:', error);
        showElement(emptyState);
    } finally {
        hideElement(loadingState);
    }
}

// Load categories from Firestore
async function loadCategories() {
    try {
        const categoriesRef = collection(db, 'categories');
        const snapshot = await getDocs(categoriesRef);

        categories = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        renderCategories();
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Render categories
function renderCategories() {

    const existingPills = categoriesContainer
        .querySelectorAll('.category-pill:not([data-category="all"])');
    existingPills.forEach(pill => pill.remove());

    categories.forEach(category => {
        const pill = createElement(`
            <button class="category-pill" data-category="${sanitizeInput(category.name)}">
                ${sanitizeInput(category.name)}
            </button>
        `);

        pill.addEventListener('click', () => selectCategory(category.name));
        categoriesContainer.appendChild(pill);
    });

    // Fix All button click
    const allBtn = categoriesContainer.querySelector('[data-category="all"]');
    if (allBtn) {
        allBtn.addEventListener('click', () => selectCategory('all'));
    }
}

// Select category
function selectCategory(category) {
    currentCategory = category.toLowerCase();

    // Update active state
  document.querySelectorAll('.category-pill').forEach(pill => {
    pill.classList.toggle(
        'active',
        pill.dataset.category.toLowerCase() === currentCategory
    );
});

renderProducts();
}

// Render products
function renderProducts() {
    console.log('Rendering products, total:', products.length, 'category:', currentCategory, 'search:', searchQuery);
    
    // Filter products
    let filteredProducts = products;

    // Category filter
    if (currentCategory !== 'all') {
    filteredProducts = filteredProducts.filter(
        p => p.category.toLowerCase() === currentCategory
    );
}
    // Search filter
    if (searchQuery) {
        filteredProducts = filteredProducts.filter(p =>
            p.name.toLowerCase().includes(searchQuery)
        );
    }

    console.log('Filtered products:', filteredProducts.length);

    // Show/hide empty state
    if (filteredProducts.length === 0) {
        showElement(emptyState);
        hideElement(productsGrid);
    } else {
        hideElement(emptyState);
        showElement(productsGrid);
    }

    // Render products grid
    productsGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card" data-id="${product.id}">
            <div class="product-image">
                ${product.imageURL
                    ? `<img src="${sanitizeInput(product.imageURL)}" alt="${sanitizeInput(product.name)}" onerror="this.parentElement.innerHTML='<div class=\\'product-image-placeholder\\'><svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'48\\' height=\\'48\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'1.5\\'><rect x=\\'3\\' y=\\'3\\' width=\\'18\\' height=\\'18\\' rx=\\'2\\' ry=\\'2\\'/><circle cx=\\'8.5\\' cy=\\'8.5\\' r=\\'1.5\\'/><polyline points=\\'21 15 16 10 5 21\\'/></svg></div>'">`
                    : `<div class="product-image-placeholder">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                    </div>`
                }
                <div class="product-badge">⚡ ASAP</div>
            </div>
            <div class="product-info">
                <h3 class="product-name">${sanitizeInput(product.name)}</h3>
                ${product.quantity ? `<p class="product-weight">${sanitizeInput(product.quantity)}</p>` : ''}
                <p class="product-price">${formatPrice(product.price)}</p>
                ${getProductButtonHtml(product)}
            </div>
        </div>
    `).join('');

    // Add event listeners to buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', handleAddToCart);
    });
    
    // Add event listeners to quantity buttons
    document.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', handleQuantityChange);
    });
}

// Get product button HTML (Add to Cart or Quantity Selector)
function getProductButtonHtml(product) {
    const cartItem = cart.find(item => item.id === product.id);
    
    if (cartItem) {
        return `
            <div class="quantity-selector">
                <button class="quantity-btn" data-id="${product.id}" data-action="decrease">−</button>
                <span class="quantity-value">${cartItem.quantity}</span>
                <button class="quantity-btn" data-id="${product.id}" data-action="increase">+</button>
            </div>
        `;
    }
    
    return `<button class="add-to-cart-btn" data-id="${product.id}" data-name="${sanitizeInput(product.name)}" data-price="${product.price}">Add to Cart</button>`;
}

// Handle add to cart
function handleAddToCart(e) {
    const btn = e.target;
    const productId = btn.dataset.id;
    const productName = btn.dataset.name;
    const productPrice = parseFloat(btn.dataset.price);

    // Check if item exists in cart
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: productPrice,
            quantity: 1
        });
    }

    // Save cart
    saveCart(cart);
    updateCartCount();
    
    // Re-render products to show quantity selector
    renderProducts();
}

// Handle quantity change (+/-)
function handleQuantityChange(e) {
    const btn = e.target.closest('.quantity-btn');
    const productId = btn.dataset.id;
    const action = btn.dataset.action;
    
    const existingItem = cart.find(item => item.id === productId);
    if (!existingItem) return;
    
    if (action === 'increase') {
        existingItem.quantity++;
    } else if (action === 'decrease') {
        existingItem.quantity--;
        if (existingItem.quantity <= 0) {
            cart = cart.filter(item => item.id !== productId);
        }
    }
    
    saveCart(cart);
    updateCartCount();
    renderProducts();
}

// Update cart count
function updateCartCount() {
    const count = calculateItemCount(cart);
    cartCount.textContent = count;
}

// Open cart modal
function openCartModal() {
    renderCartItems();
    showElement(cartModal);
    document.body.style.overflow = 'hidden';
}

// Close cart modal
function closeCartModal() {
    hideElement(cartModal);
    document.body.style.overflow = '';
}

// Render cart items
function renderCartItems() {
    if (cart.length === 0) {
        showElement(cartEmpty);
        hideElement(cartFooter);
        cartItems.innerHTML = '';
        cartItems.appendChild(cartEmpty);
        return;
    }

    hideElement(cartEmpty);
    showElement(cartFooter);

    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <div class="cart-item-details">
                <h4 class="cart-item-name">${sanitizeInput(item.name)}</h4>
                <p class="cart-item-price">${formatPrice(item.price)}</p>
                <div class="cart-item-qty">
                    <button class="qty-btn decrease" data-id="${item.id}">-</button>
                    <span class="qty-value">${item.quantity}</span>
                    <button class="qty-btn increase" data-id="${item.id}">+</button>
                </div>
            </div>
            <button class="cart-item-remove" data-id="${item.id}">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>
        </div>
    `).join('');

    // Add event listeners
    cartItems.querySelectorAll('.decrease').forEach(btn => {
        btn.addEventListener('click', () => updateQuantity(btn.dataset.id, -1));
    });
    cartItems.querySelectorAll('.increase').forEach(btn => {
        btn.addEventListener('click', () => updateQuantity(btn.dataset.id, 1));
    });
    cartItems.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
    });

    // Update total
    const cartSubtotal = calculateTotal(cart);
    const deliveryCharge = calculateDeliveryCharge(cartSubtotal);
    const grandTotal = cartSubtotal + deliveryCharge;
    
    // Update delivery charge display
    const deliveryChargeEl = document.getElementById('deliveryCharge');
    if (deliveryChargeEl) {
        deliveryChargeEl.textContent = formatPrice(deliveryCharge);
    }
    
    cartTotal.textContent = formatPrice(grandTotal);
}

// Update quantity
function updateQuantity(productId, change) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;

    item.quantity += change;
    if (item.quantity < 1) {
        item.quantity = 1;
    }

    saveCart(cart);
    updateCartCount();
    renderCartItems();
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    updateCartCount();
    renderCartItems();
}

// Open checkout modal
function openCheckoutModal() {
if (!auth.currentUser) {
  alert("Please login to place order");
  window.location.href = "customer-login.html";
  return;
}

if (cart.length === 0) {
    alert('Your cart is empty. Please add items before checkout.');
    return;
}

closeCartModal();
    const cartSubtotal = calculateTotal(cart);
    const deliveryCharge = calculateDeliveryCharge(cartSubtotal);
    const grandTotal = cartSubtotal + deliveryCharge;
    
    summaryItems.textContent = calculateItemCount(cart);
    
    // Update delivery charge display
    const summaryDelivery = document.getElementById('summaryDelivery');
    if (summaryDelivery) {
        summaryDelivery.textContent = formatPrice(deliveryCharge);
    }
    
    summaryTotal.textContent = formatPrice(grandTotal);
    showElement(checkoutModal);
    document.body.style.overflow = 'hidden';
}

// Close checkout modal
function closeCheckoutModal() {
    hideElement(checkoutModal);
    document.body.style.overflow = '';
}

// Handle checkout
async function handleCheckout(e) {
    e.preventDefault();

    const customerName = document.getElementById('customerName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();

    if (!customerName || !phone || !address) {
        alert('Please fill in all fields');
        return;
    }

    // Validate phone number - must be exactly 10 digits
    if (!/^\d{10}$/.test(phone)) {
        alert('Please enter a valid 10-digit phone number');
        document.getElementById('phone').focus();
        return;
    }

    // Show loading
    placeOrderBtn.disabled = true;
    showElement(orderSpinner);
    placeOrderBtn.querySelector('span').textContent = 'Placing Order...';

    try {
        const cartSubtotal = calculateTotal(cart);
        const deliveryCharge = calculateDeliveryCharge(cartSubtotal);
        const grandTotal = cartSubtotal + deliveryCharge;
        
        const paymentMethodEl = document.getElementById('paymentMethod');
        const paymentMethod = paymentMethodEl ? paymentMethodEl.value : 'cod';
        
        const orderData = {
            customerName: sanitizeInput(customerName),
            phone: sanitizeInput(phone),
            address: sanitizeInput(address),
            email: auth.currentUser.email,
            items: cart.map(item => ({
                name: item.name,
                price: item.price,
                quantity: item.quantity
            })),
            subtotal: cartSubtotal,
            deliveryCharge: deliveryCharge,
            totalAmount: grandTotal,
            paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment',
            status: 'pending',
            createdAt: new Date()
        };

        // Add order to Firestore
        await addDoc(collection(db, 'orders'), orderData);

        // Clear cart
        cart = [];
        saveCart(cart);
        updateCartCount();

        // Close checkout and show success
        closeCheckoutModal();
        checkoutForm.reset();
        openSuccessModal();

    } catch (error) {
        console.error('Error placing order:', error);
        alert('Failed to place order. Please try again.');
    } finally {
        placeOrderBtn.disabled = false;
        hideElement(orderSpinner);
        placeOrderBtn.querySelector('span').textContent = 'Place Order (COD)';
    }
}

// Open success modal
function openSuccessModal() {
    showElement(successModal);
    document.body.style.overflow = 'hidden';
}

// Close success modal
function closeSuccessModal() {
    hideElement(successModal);
    document.body.style.overflow = '';
}
