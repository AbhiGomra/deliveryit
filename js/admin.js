// Deliveryit - Admin Dashboard Logic

import {
    getAuth,
    onAuthStateChanged,
    signOut
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import {
    getFirestore,
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    onSnapshot
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';
import {
    formatPrice,
    formatDate,
    showElement,
    hideElement,
    createElement,
    sanitizeInput
} from './utils.js';

import { auth, db } from './firebase-config.js';

// State
let products = [];
let categories = [];
let orders = [];
let editingProductId = null;
let deletingItem = null;
let deleteType = null;

// DOM Elements
const logoutBtn = document.getElementById('logoutBtn');
const navTabs = document.querySelectorAll('.nav-tab');
const adminPanels = document.querySelectorAll('.admin-panel');

// Products Panel
const productsTableBody = document.getElementById('productsTableBody');
const productsLoading = document.getElementById('productsLoading');
const productsEmpty = document.getElementById('productsEmpty');
const addProductBtn = document.getElementById('addProductBtn');
const productModal = document.getElementById('productModal');
const closeProductModalBtn = document.getElementById('closeProductModal');
const productModalTitle = document.getElementById('productModalTitle');
const productForm = document.getElementById('productForm');
const productIdInput = document.getElementById('productId');
const productCategorySelect = document.getElementById('productCategory');
const productQuantityInput = document.getElementById('productQuantity');
const cancelProductBtn = document.getElementById('cancelProductBtn');
const saveProductBtn = document.getElementById('saveProductBtn');
const productSpinner = document.getElementById('productSpinner');

// Categories Panel
const categoryForm = document.getElementById('categoryForm');
const categoryInput = document.getElementById('categoryInput');
const categoriesList = document.getElementById('categoriesList');
const categoriesLoading = document.getElementById('categoriesLoading');
const categoriesEmpty = document.getElementById('categoriesEmpty');

// Orders Panel
const ordersList = document.getElementById('ordersList');
const ordersLoading = document.getElementById('ordersLoading');
const ordersEmpty = document.getElementById('ordersEmpty');

// Delete Modal
const deleteModal = document.getElementById('deleteModal');
const deleteMessage = document.getElementById('deleteMessage');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

// Check authentication
function checkAuth() {
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            window.location.href = 'login.html';
        } 
        else if (user.email !== "abhigomra@gmail.com") {
            alert("Access Denied. Not an Admin.");
            window.location.href = "index.html";
        } 
        else {
            loadAllData();
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    // Navigation tabs
    navTabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // Logout
    logoutBtn.addEventListener('click', handleLogout);

    // Products
    addProductBtn.addEventListener('click', () => openProductModal());
    closeProductModalBtn.addEventListener('click', () => closeProductModal());
    cancelProductBtn.addEventListener('click', () => closeProductModal());
    productModal.addEventListener('click', (e) => {
        if (e.target === productModal) closeProductModal();
    });
    productForm.addEventListener('submit', handleProductSubmit);

    // Categories
    categoryForm.addEventListener('submit', handleCategorySubmit);

    // Delete Modal
    cancelDeleteBtn.addEventListener('click', () => closeDeleteModal());
    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) closeDeleteModal();
    });
    confirmDeleteBtn.addEventListener('click', handleConfirmDelete);
}

// Switch tab
function switchTab(tabName) {
    navTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabName);
    });
    adminPanels.forEach(panel => {
        panel.classList.toggle('active', panel.id === tabName + 'Panel');
    });
}

// Load all data
async function loadAllData() {
    loadProducts();
    loadCategories();
    loadOrders();
}

// Handle logout
async function handleLogout() {
    try {
        await signOut(auth);
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Error logging out:', error);
    }
}

// ====================
// Products Management
// ====================

async function loadProducts() {
    try {
        showElement(productsLoading);
        hideElement(productsEmpty);
        productsTableBody.innerHTML = '';

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
    } finally {
        hideElement(productsLoading);
    }
}

function renderProducts() {
    if (products.length === 0) {
        showElement(productsEmpty);
        hideElement(productsTableBody.parentElement.querySelector('table'));
        return;
    }

    hideElement(productsEmpty);
    showElement(productsTableBody.parentElement.querySelector('table'));

    productsTableBody.innerHTML = products.map(product => `
        <tr>
            <td>
                <div class="product-thumb">
                    ${product.imageURL
                        ? `<img src="${sanitizeInput(product.imageURL)}" alt="${sanitizeInput(product.name)}" onerror="this.style.display='none'">`
                        : ''
                    }
                </div>
            </td>
            <td>${sanitizeInput(product.name)}</td>
            <td>${sanitizeInput(product.category)}</td>
            <td>${formatPrice(product.price)}</td>
            <td>
                <div class="action-btns">
                    <button class="edit-btn" data-id="${product.id}">Edit</button>
                    <button class="delete-btn" data-id="${product.id}">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');

    // Add event listeners
    productsTableBody.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editProduct(btn.dataset.id));
    });
    productsTableBody.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => openDeleteModal(btn.dataset.id, 'product'));
    });
}

function openProductModal(product = null) {
    editingProductId = product ? product.id : null;
    productModalTitle.textContent = product ? 'Edit Product' : 'Add Product';
    productIdInput.value = product ? product.id : '';
    document.getElementById('productName').value = product ? product.name : '';
document.getElementById('productPrice').value = product ? product.price : '';
document.getElementById('productImage').value = product ? product.imageURL : '';
productQuantityInput.value = product ? (product.quantity || "") : "";
    // Populate category select
    populateCategorySelect();
    document.getElementById('productCategory').value = product ? product.category : '';

    showElement(productModal);
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    hideElement(productModal);
    productForm.reset();
    editingProductId = null;
    document.body.style.overflow = '';
}

function populateCategorySelect() {
    productCategorySelect.innerHTML = '<option value="">Select category</option>' +
        categories.map(cat => `<option value="${sanitizeInput(cat.name)}">${sanitizeInput(cat.name)}</option>`).join('');
}

function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        openProductModal(product);
    }
}

async function handleProductSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('productName').value.trim();
    const price = parseFloat(document.getElementById('productPrice').value);
    const category = document.getElementById('productCategory').value;
    const imageURL = document.getElementById('productImage').value.trim();
    const quantity = document.getElementById('productQuantity').value.trim();

   if (!name || !price || !category) {
        alert('Please fill in all required fields');
        return;
    }

    saveProductBtn.disabled = true;
    showElement(productSpinner);
    saveProductBtn.querySelector('span').textContent = 'Saving...';

    try {
        const productData = {
            name: sanitizeInput(name),
            price: price,
            category: sanitizeInput(category),
            quantity: quantity ? sanitizeInput(quantity) : "",
            imageURL: sanitizeInput(imageURL),
            createdAt: editingProductId
                ? products.find(p => p.id === editingProductId).createdAt
                : new Date()
        };

        if (editingProductId) {
            // Update existing product
            await updateDoc(doc(db, 'products', editingProductId), productData);
        } else {
            // Add new product
            await addDoc(collection(db, 'products'), productData);
        }

        closeProductModal();
        loadProducts();
    } catch (error) {
        console.error('Error saving product:', error);
        alert('Failed to save product. Please try again.');
    } finally {
        saveProductBtn.disabled = false;
        hideElement(productSpinner);
        saveProductBtn.querySelector('span').textContent = 'Save Product';
    }
}

// ====================
// Categories Management
// ====================

async function loadCategories() {
    try {
        showElement(categoriesLoading);
        hideElement(categoriesEmpty);

        const categoriesRef = collection(db, 'categories');
        const snapshot = await getDocs(categoriesRef);

        categories = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        renderCategories();
    } catch (error) {
        console.error('Error loading categories:', error);
    } finally {
        hideElement(categoriesLoading);
    }
}

function renderCategories() {
    if (categories.length === 0) {
        showElement(categoriesEmpty);
        hideElement(categoriesList);
        return;
    }

    hideElement(categoriesEmpty);
    showElement(categoriesList);

    categoriesList.innerHTML = categories.map(category => `
        <div class="category-item">
            <span class="category-item-name">${sanitizeInput(category.name)}</span>
            <button class="category-delete-btn" data-id="${category.id}">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
            </button>
        </div>
    `).join('');

    // Add event listeners
    categoriesList.querySelectorAll('.category-delete-btn').forEach(btn => {
        btn.addEventListener('click', () => openDeleteModal(btn.dataset.id, 'category'));
    });
}

async function handleCategorySubmit(e) {
    e.preventDefault();

    const name = categoryInput.value.trim();
    if (!name) return;

    try {
        await addDoc(collection(db, 'categories'), {
            name: sanitizeInput(name),
            createdAt: new Date()
        });

        categoryInput.value = '';
        loadCategories();
    } catch (error) {
        console.error('Error adding category:', error);
        alert('Failed to add category. Please try again.');
    }
}

// ====================
// Orders Management
// ====================

function loadOrders() {
    try {
        showElement(ordersLoading);
        hideElement(ordersEmpty);

        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, orderBy('createdAt', 'desc'));

        // Real-time listener
        onSnapshot(q, (snapshot) => {
            orders = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            renderOrders();
        });
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

function renderOrders() {
    if (orders.length === 0) {
        showElement(ordersEmpty);
        hideElement(ordersList);
        return;
    }

    hideElement(ordersEmpty);
    showElement(ordersList);

    ordersList.innerHTML = orders.map(order => `
        <div class="order-card" data-id="${order.id}">
            <div class="order-header">
                <div>
                    <div class="order-customer">${sanitizeInput(order.customerName)}</div>
                    <div class="order-phone">${sanitizeInput(order.phone)}</div>
                </div>
                <span class="order-status ${order.status}">${order.status}</span>
            </div>
            <div class="order-address">${sanitizeInput(order.address)}</div>
            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-item">
                        <span class="order-item-name">${sanitizeInput(item.name)}</span>
                        <span class="order-item-qty">x${item.quantity}</span>
                    </div>
                `).join('')}
            </div>
            <div class="order-total">
                <span>Total</span>
                <span>${formatPrice(order.totalAmount)}</span>
            </div>
            ${order.status === 'pending' ? `
                <div class="order-actions">
                    <button class="accept-btn" data-id="${order.id}">Accept</button>
                    <button class="reject-btn" data-id="${order.id}">Reject</button>
                </div>
            ` : `
                <div class="order-actions">
                    <span class="${order.status}">${order.status === 'accepted' ? 'Accepted' : 'Rejected'}</span>
                </div>
            `}
        </div>
    `).join('');

    // Add event listeners
    ordersList.querySelectorAll('.accept-btn').forEach(btn => {
        btn.addEventListener('click', () => updateOrderStatus(btn.dataset.id, 'accepted'));
    });
    ordersList.querySelectorAll('.reject-btn').forEach(btn => {
        btn.addEventListener('click', () => updateOrderStatus(btn.dataset.id, 'rejected'));
    });
}

async function updateOrderStatus(orderId, status) {
    try {
        await updateDoc(doc(db, 'orders', orderId), {
            status: status
        });
    } catch (error) {
        console.error('Error updating order:', error);
        alert('Failed to update order. Please try again.');
    }
}

// ====================
// Delete Modal
// ====================

function openDeleteModal(itemId, type) {
    deletingItem = itemId;
    deleteType = type;

    const itemName = type === 'product'
        ? products.find(p => p.id === itemId)?.name
        : categories.find(c => c.id === itemId)?.name;

    deleteMessage.textContent = `Are you sure you want to delete "${itemName}"?`;

    showElement(deleteModal);
    document.body.style.overflow = 'hidden';
}

function closeDeleteModal() {
    hideElement(deleteModal);
    deletingItem = null;
    deleteType = null;
    document.body.style.overflow = '';
}

async function handleConfirmDelete() {
    if (!deletingItem || !deleteType) return;

    try {
        if (deleteType === 'product') {
            await deleteDoc(doc(db, 'products', deletingItem));
            loadProducts();
        } else if (deleteType === 'category') {
            await deleteDoc(doc(db, 'categories', deletingItem));
            loadCategories();
        }

        closeDeleteModal();
    } catch (error) {
        console.error('Error deleting item:', error);
        alert('Failed to delete item. Please try again.');
    }
}
