// Utility Functions for Deliveryit

/**
 * Format price to currency string
 * @param {number} price - Price value
 * @returns {string} Formatted price
 */
export function formatPrice(price) {
    return '₹' + parseFloat(price).toFixed(2);
}

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Get cart from localStorage
 * @returns {Array} Cart items
 */
export function getCart() {
    const cart = localStorage.getItem('deliveryit_cart');
    return cart ? JSON.parse(cart) : [];
}

/**
 * Save cart to localStorage
 * @param {Array} cart - Cart items
 */
export function saveCart(cart) {
    localStorage.setItem('deliveryit_cart', JSON.stringify(cart));
}

/**
 * Calculate cart total
 * @param {Array} cart - Cart items
 * @returns {number} Total amount
 */
export function calculateTotal(cart) {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

/**
 * Calculate cart item count
 * @param {Array} cart - Cart items
 * @returns {number} Total items
 */
export function calculateItemCount(cart) {
    return cart.reduce((count, item) => count + item.quantity, 0);
}

/**
 * Show element
 * @param {HTMLElement} element - Element to show
 */
export function showElement(element) {
    if (element) {
        element.classList.remove('hidden');
    }
}

/**
 * Hide element
 * @param {HTMLElement} element - Element to hide
 */
export function hideElement(element) {
    if (element) {
        element.classList.add('hidden');
    }
}

/**
 * Create element from HTML string
 * @param {string} html - HTML string
 * @returns {HTMLElement} Created element
 */
export function createElement(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstChild;
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Format timestamp to date string
 * @param {Object} timestamp - Firestore timestamp
 * @returns {string} Formatted date
 */
export function formatDate(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Validate phone number
 * @param {string} phone - Phone number
 * @returns {boolean} Is valid
 */
export function isValidPhone(phone) {
    const phoneRegex = /^[\d\s\-+()]{7,20}$/;
    return phoneRegex.test(phone);
}

/**
 * Sanitize input
 * @param {string} input - Input string
 * @returns {string} Sanitized string
 */
export function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}
