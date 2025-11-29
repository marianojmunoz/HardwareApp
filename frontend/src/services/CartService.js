export class CartService {
    constructor() {
        this.storageKey = 'hardware_cart';
        this.cart = this.loadFromStorage();
        this.listeners = [];
    }

    // Get all cart items
    getItems() {
        return this.cart;
    }

    // Get total item count
    getItemCount() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    // Get cart total price
    getTotal() {
        return this.cart.reduce((total, item) => total + (item.product.precio_total * item.quantity), 0);
    }

    // Add product to cart
    addProduct(product, quantity = 1) {
        const existingItem = this.cart.find(item => item.product.id === product.id);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                product: product,
                quantity: quantity
            });
        }

        this.saveToStorage();
        this.notifyListeners();
    }

    // Update item quantity
    updateQuantity(productId, quantity) {
        const item = this.cart.find(item => item.product.id === productId);

        if (item) {
            if (quantity <= 0) {
                this.removeProduct(productId);
            } else {
                item.quantity = quantity;
                this.saveToStorage();
                this.notifyListeners();
            }
        }
    }

    // Remove product from cart
    removeProduct(productId) {
        this.cart = this.cart.filter(item => item.product.id !== productId);
        this.saveToStorage();
        this.notifyListeners();
    }

    // Clear entire cart
    clearCart() {
        this.cart = [];
        this.saveToStorage();
        this.notifyListeners();
    }

    // Subscribe to cart changes
    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(listener => listener !== callback);
        };
    }

    // Notify all listeners of cart changes
    notifyListeners() {
        this.listeners.forEach(callback => callback(this.cart));
    }

    // Save to localStorage
    saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.cart));
        } catch (error) {
            console.error('Error saving cart to localStorage:', error);
        }
    }

    // Load from localStorage
    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading cart from localStorage:', error);
            return [];
        }
    }
}
