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
import { db } from './firebase-config.js';

// State
let products = [];
let categories = [];
let cart = [];
let currentCategory = 'all';
let searchQuery = '';

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
        const q = query(productsRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);

        products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

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
    // Remove existing category buttons except "All"
    const existingPills = categoriesContainer.querySelectorAll('.category-pill:not([data-category="all"])');
    existingPills.forEach(pill => pill.remove());

    // Add category pills
    categories.forEach(category => {
        const pill = createElement(`
            <button class="category-pill" data-category="${sanitizeInput(category.name)}">
                ${sanitizeInput(category.name)}
            </button>
        `);
        pill.addEventListener('click', () => selectCategory(category.name));
        categoriesContainer.appendChild(pill);
    });
}

// Select category
function selectCategory(category) {
    currentCategory = category;

    // Update active state
    document.querySelectorAll('.category-pill').forEach(pill => {
        pill.classList.toggle('active', pill.dataset.category === category);
    });

    renderProducts();
}

// Render products
function renderProducts() {
    // Filter products
    let filteredProducts = products;

    // Category filter
    if (currentCategory !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category === currentCategory);
    }

    // Search filter
    if (searchQuery) {
        filteredProducts = filteredProducts.filter(p =>
            p.name.toLowerCase().includes(searchQuery)
        );
    }

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
            </div>
            <div class="product-info">
                <h3 class="product-name">${sanitizeInput(product.name)}</h3>
                <p class="product-price">${formatPrice(product.price)}</p>
                <button class="add-to-cart-btn" data-id="${product.id}" data-name="${sanitizeInput(product.name)}" data-price="${product.price}">
                    Add to Cart
                </button>
            </div>
        </div>
    `).join('');

    // Add event listeners to buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', handleAddToCart);
    });
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

    // Show added feedback
    btn.textContent = 'Added!';
    btn.classList.add('added');
    setTimeout(() => {
        btn.textContent = 'Add to Cart';
        btn.classList.remove('added');
    }, 1000);
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
    cartTotal.textContent = formatPrice(calculateTotal(cart));
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
    closeCartModal();
    summaryItems.textContent = calculateItemCount(cart);
    summaryTotal.textContent = formatPrice(calculateTotal(cart));
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

    // Show loading
    placeOrderBtn.disabled = true;
    showElement(orderSpinner);
    placeOrderBtn.querySelector('span').textContent = 'Placing Order...';

    try {
        const orderData = {
            customerName: sanitizeInput(customerName),
            phone: sanitizeInput(phone),
            address: sanitizeInput(address),
            items: cart.map(item => ({
                name: item.name,
                price: item.price,
                quantity: item.quantity
            })),
            totalAmount: calculateTotal(cart),
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
