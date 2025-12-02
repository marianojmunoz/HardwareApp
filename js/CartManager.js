import { StorageManager } from './StorageManager.js';
import { formatPrice } from '../frontend/src/utils/formatters.js';

export class CartManager {
    constructor(authManager) {
        this.authManager = authManager;
        this.storage = null; // Will be initialized on user login
        this.items = [];
        this.isOpen = false;

        this.initializeCart();
        this.updateCartForAuthState();
    }

    initializeCart() {
        this.cartIcon = document.getElementById('cartIcon');
        this.cartCount = document.getElementById('cartCount');
        this.cartSidebar = document.getElementById('cartSidebar');
        this.cartBody = document.getElementById('cartBody');
        this.cartFooter = document.getElementById('cartFooter');
        this.cartTotal = document.getElementById('cartTotal');
        this.closeCartBtn = document.getElementById('closeCartBtn');
        this.checkoutBtn = document.getElementById('checkoutBtn');

        // Attach event listeners
        this.cartIcon?.addEventListener('click', () => this.toggleCart());
        this.closeCartBtn?.addEventListener('click', () => this.closeCart());
        this.cartSidebar?.addEventListener('click', (e) => {
            if (e.target === this.cartSidebar) {
                this.closeCart();
            }
        });
    }

    updateCartForAuthState() {
        const user = this.authManager.getCurrentUser ? this.authManager.getCurrentUser() : null;
        if (user && user.email) {
            // User is logged in, initialize user-specific storage
            this.storage = new StorageManager(`cart_${user.email}`);
            this.items = this.storage.load() || [];
            this.enableCart();
        } else {
            // User is logged out, disable cart
            this.storage = null;
            this.items = [];
            this.disableCart();
        }
        this.render();
    }

    enableCart() {
        if (!this.cartIcon) return;
        this.cartIcon.style.pointerEvents = 'auto';
        this.cartIcon.style.opacity = '1';
    }

    disableCart() {
        if (!this.cartIcon) return;
        this.cartIcon.style.pointerEvents = 'none';
        this.cartIcon.style.opacity = '0.5';
        if (this.isOpen) {
            this.closeCart();
        }
    }

    toggleCart() {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.openCart();
        } else {
            this.closeCart();
        }
    }

    openCart() {
        if (!this.cartSidebar) return;
        this.isOpen = true;
        this.cartSidebar.classList.add('active');
    }

    closeCart() {
        if (!this.cartSidebar) return;
        this.isOpen = false;
        this.cartSidebar.classList.remove('active');
    }

    addItem(product, quantity = 1) {
        if (!this.storage) {
            alert('Por favor, inicia sesión para añadir productos al carrito.');
            return;
        }

        const existingItem = this.items.find(item => item.product.id === product.id);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({ product, quantity });
        }
        this.saveCart();
        this.render();
        this.openCart();
    }

    removeItem(productId) {
        if (!this.storage) {
            console.error("Attempted to remove item when no user is logged in.");
            return;
        }

        this.items = this.items.filter(item => item.product.id !== productId);
        this.saveCart();
        this.render();
    }

    updateQuantity(productId, newQuantity) {
        if (!this.storage) {
            console.error("Attempted to update quantity when no user is logged in.");
            return;
        }

        const item = this.items.find(item => item.product.id === productId);

        if (item) {
            if (newQuantity > 0) {
                item.quantity = newQuantity;
            } else {
                this.removeItem(productId);
            }
        }
        this.saveCart();
        this.render();
    }

    clearCart() {
        if (!this.storage) {
            console.error("Attempted to clear cart when no user is logged in.");
            return;
        }

        this.items = [];
        this.saveCart();
        this.render();
    }

    saveCart() {
        if (this.storage) {
            this.storage.save(this.items);
        }
    }

    render() {
        if (!this.cartBody || !this.cartFooter) return;

        this.updateCartCount();

        if (this.items.length === 0) {
            const message = this.authManager.isAuthenticated() ? 'Tu carrito está vacío' : 'Inicia sesión para ver tu carrito';
            this.cartBody.innerHTML = `<p class="cart-empty-msg">${message}</p>`;
            this.cartFooter.style.display = 'none';
            return;
        }

        this.cartFooter.style.display = 'block';
        this.cartBody.innerHTML = this.items.map(item => `
            <div class="cart-item" data-id="${item.product.id}">
                <div class="cart-item-info">
                    <span class="cart-item-name">${item.product.producto}</span>
                    <span class="cart-item-price">${formatPrice(item.product.precio_total || item.product.precio_publico)}</span>
                </div>
                <div class="cart-item-controls">
                    <input type="number" class="cart-item-quantity" value="${item.quantity}" min="1">
                    <button class="cart-item-remove">✕</button>
                </div>
            </div>
        `).join('');

        this.cartTotal.textContent = formatPrice(this.calculateTotal());
        this.addRenderedItemListeners();
    }

    addRenderedItemListeners() {
        this.cartBody.querySelectorAll('.cart-item').forEach(element => {
            const productId = element.dataset.id;
            element.querySelector('.cart-item-remove')?.addEventListener('click', () => this.removeItem(productId));
            element.querySelector('.cart-item-quantity')?.addEventListener('change', (e) => this.updateQuantity(productId, parseInt(e.target.value, 10)));
        });
    }

    updateCartCount() {
        if (!this.cartCount) return;
        const count = this.items.reduce((sum, item) => sum + item.quantity, 0);
        this.cartCount.textContent = count;
        this.cartCount.style.display = count > 0 ? 'block' : 'none';
    }

    calculateTotal() {
        return this.items.reduce((sum, item) => {
            const price = parseFloat(item.product.precio_total || item.product.precio_publico);
            return sum + (price * item.quantity);
        }, 0);
    }

    getCartItems() {
        return this.items;
    }

    handleLogin() {
        this.updateCartForAuthState();
    }
}