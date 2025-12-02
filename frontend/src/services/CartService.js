export class CartService {
    constructor(userEmail = null) {
        this.userEmail = userEmail;
        this.storageKey = this.generateStorageKey(userEmail);
        this.cart = this.loadFromStorage();
        this.listeners = [];
    }

    // Generate unique storage key based on user email
    generateStorageKey(email) {
        if (email) {
            return `hardware_cart_${email}`;
        }
        return 'hardware_cart'; // Fallback for non-logged in users
    }

    // Set user email and reload cart from their specific storage
    setUser(userEmail) {
        console.log(`CartService: Switching user to ${userEmail}`);
        this.userEmail = userEmail;
        this.storageKey = this.generateStorageKey(userEmail);
        console.log(`CartService: New storage key is ${this.storageKey}`);
        this.cart = this.loadFromStorage();
        console.log(`CartService: Loaded ${this.cart.length} items for ${userEmail}`);
        this.notifyListeners();
    }

    // Clear user and reset to default cart
    clearUser() {
        this.userEmail = null;
        this.storageKey = 'hardware_cart';
        this.cart = [];
        this.saveToStorage();
        this.notifyListeners();
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
        // Check if user is logged in
        if (!this.userEmail) {
            return {
                success: false,
                message: 'Por favor, inicia sesión para agregar productos al carrito'
            };
        }

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

        return {
            success: true,
            message: 'Producto agregado al carrito'
        };
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
            throw error;
        }
    }

    // Load from localStorage
    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            throw error;
        }
    }
}
