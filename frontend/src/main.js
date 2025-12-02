// API Services

import { authApi } from './services/api/authApi.js';

// Infrastructure
import { SupabaseProductRepository } from './infrastructure/repositories/SupabaseProductRepository.js';
import { ExcelParser } from './infrastructure/parsers/ExcelParser.js';
import { ImageUploader } from './infrastructure/parsers/ImageUploader.js';

// Services
import { ProductService } from './services/ProductService.js';
import { UploadService } from './services/UploadService.js';
import { CheckoutService } from './services/CheckoutService.js';
import { CartService } from './services/CartService.js';
import { OrderService } from './services/OrderService.js';

// Components
import { ProductGrid } from './components/products/ProductGrid.js';
import { SearchBar } from './components/products/SearchBar.js';
import { LoginModal } from './components/auth/LoginModal.js';
import { AdminButton } from './components/auth/AdminButton.js';
import { UploadSummaryModal } from './components/upload/UploadSummaryModal.js';
import { CategorySidebar } from './components/products/CategorySidebar.js';
import { CartIcon } from './components/cart/CartIcon.js';
import { Cart } from './components/cart/Cart.js';
import { ProductEditModal } from './components/products/ProductEditModal.js';
import { ConfirmModal } from './components/common/ConfirmModal.js';
import { OrdersButton } from './components/orders/OrdersButton.js';
import { OrdersModal } from './components/orders/OrdersModal.js';

class HardwareCatalogApp {
    constructor() {
        // Initialize repositories
        this.productRepo = new SupabaseProductRepository();
        this.excelParser = new ExcelParser();
        this.imageUploader = new ImageUploader();

        // Initialize services
        this.productService = new ProductService(this.productRepo);
        this.uploadService = new UploadService(this.excelParser, this.productRepo);
        this.cartService = new CartService();
        this.orderService = new OrderService();
        this.checkoutService = new CheckoutService(this.orderService); // Inject OrderService

        // Initialize components
        this.productGrid = new ProductGrid('productsContainer');
        this.searchBar = new SearchBar('searchBox');
        this.loginModal = new LoginModal();
        this.adminButton = new AdminButton('adminBtn');
        this.uploadSummaryModal = new UploadSummaryModal();
        this.categorySidebar = new CategorySidebar('categorySidebar');
        this.cartIcon = new CartIcon('cartIconContainer', this.cartService);
        this.cart = new Cart(this.cartService, this.checkoutService);
        this.productEditModal = new ProductEditModal();
        this.confirmModal = new ConfirmModal();
        this.ordersButton = new OrdersButton('ordersButtonContainer', false); // Initially false
        this.ordersModal = new OrdersModal(this.orderService, false);

        // State
        this.currentUser = null;
        this.isAdmin = false;

        // Allowed admin emails
        this.ADMIN_EMAILS = [
            'mariano.j.munoz.1985@gmail.com',
            'mariano.j.munoz@hotmail.com'
        ];
    }

    async init() {

        // Setup event listeners
        this.setupEventListeners();

        // Check if user is already logged in
        await this.checkAuthState();

        // Load initial products
        await this.loadProducts();

        // Update pending orders count if admin
        if (this.isAdmin) {
            await this.updatePendingOrdersCount();
        }
    }

    setupEventListeners() {
        // Sidebar filtering
        this.categorySidebar.setFilterCallback(async (category, subCategory) => {
            // Limpiar búsqueda si estaba activa
            this.searchBar.clear();

            // Recargar todos los productos antes de filtrar
            await this.loadProducts();

            // Aplicar filtro de categoría sobre todos los productos
            this.productGrid.filterByCategory(category, subCategory);
            this.updatePageTitle('', category, subCategory);
            this.updatePageTitle('', category, subCategory);
        });

        // Cart interactions
        this.cartIcon.onClick(() => {
            this.cart.show();
        });

        this.productGrid.setAddToCartCallback((product, quantity) => {
            return this.cartService.addProduct(product, quantity);
        });

        // Login modal events
        this.loginModal.onLogin(async (email, password) => {
            await this.handleLogin(email, password);
        });

        this.loginModal.onUpload(async (file) => {
            await this.handleExcelUpload(file);
        });

        this.loginModal.onLogout(async () => {
            await this.handleLogout();
        });

        // Search
        this.searchBar.setupEventListeners();
        this.searchBar.onSearch(async (term) => {
            await this.handleSearch(term);
        });

        // Product grid admin actions
        this.productGrid.setEditCallback((product) => {
            this.handleEditProduct(product);
        });

        this.productGrid.setDeleteCallback(async (product) => {
            await this.handleDeleteProduct(product);
        });

        // Admin button click
        this.adminButton.setupEventListeners();
        this.adminButton.onClick(() => {
            if (this.currentUser) {
                // User is logged in
                if (this.isAdmin) {
                    // Show upload form for admin
                    this.loginModal.showUploadForm();
                } else {
                    // Show user profile for regular user
                    this.loginModal.showUserProfile(this.currentUser.email);
                }
                this.loginModal.show();
            } else {
                // User is not logged in, show login form
                this.loginModal.showLoginForm();
                this.loginModal.show();
            }
        });

        // Orders button click
        this.ordersButton.onClick(async () => {
            const userEmail = this.currentUser ? this.currentUser.email : null;
            await this.ordersModal.show(userEmail);

            // Update count after modal closes
            await this.updatePendingOrdersCount();
        });

        // Sort selector
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.productGrid.setSortOption(e.target.value);
            });
        }

        // Auth state changes
        authApi.onAuthStateChange((event, session) => {

            if (event === 'SIGNED_IN') {
                this.currentUser = session.user;
                this.isAdmin = this.ADMIN_EMAILS.includes(session.user.email);

                this.adminButton.showLoggedIn(session.user.email);
                this.cartService.setUser(session.user.email);
                // Only enable admin mode if user is in allowed list
                this.productGrid.setAdminMode(this.isAdmin);
                this.ordersModal = new OrdersModal(this.orderService, this.isAdmin);
                this.ordersButton.setUserStatus(true, this.isAdmin); // Show for all logged-in users

                this.loadProducts(); // Reload to show/hide admin buttons

                this.loadProducts(); // Reload to show/hide admin buttons

                // Update pending orders count for all users
                this.updatePendingOrdersCount();
            } else if (event === 'PASSWORD_RECOVERY') {
                // User clicked password reset link - redirect to reset page
                window.location.href = './password-reset.html';
            } else if (event === 'SIGNED_OUT') {
                this.currentUser = null;

                this.cartService.clearUser();
                if (this.cart && this.cart.isOpen) {
                    this.cart.hide();
                }
                this.ordersModal = new OrdersModal(this.orderService, false);
                this.isAdmin = false;
                this.adminButton.showLoggedOut();
                this.productGrid.setAdminMode(false);
                this.ordersButton.setUserStatus(false, false); // Hide orders button
                this.loadProducts(); // Reload to hide admin buttons
            }
        });
    }

    async checkAuthState() {
        try {
            const session = await authApi.getSession();
            if (session) {
                this.currentUser = session.user;
                this.isAdmin = this.ADMIN_EMAILS.includes(session.user.email);

                this.adminButton.showLoggedIn(session.user.email);
                this.cartService.setUser(session.user.email);
                this.productGrid.setAdminMode(this.isAdmin);
                this.ordersButton.setUserStatus(true, this.isAdmin);// Show/hide orders button
            }
        } catch (error) {
            this.loginModal.showError('authError', error.message);
        }
    }

    async handleLogin(email, password) {
        try {
            const { user } = await authApi.signIn(email, password);


            // Check if user is admin
            const isAdmin = this.ADMIN_EMAILS.includes(user.email);

            if (isAdmin) {
                this.loginModal.showUploadForm();
            } else {
                this.loginModal.showUserProfile(user.email);
            }
        } catch (error) {

            this.loginModal.showError('loginError', error.message);
        }
    }

    async handleLogout() {
        try {
            await authApi.signOut();
            this.loginModal.hide();
        } catch (error) {
            this.loginModal.showError('logoutError', error.message);
        }
    }

    async handleExcelUpload(file) {
        try {
            this.productGrid.showLoading('Procesando archivo Excel...');
            this.loginModal.clearError('uploadError');

            const products = await this.uploadService.uploadExcel(file);

            // Generate and show upload summary
            const summary = this.uploadService.getUploadSummary(products);

            this.loginModal.closeAfterUpload();
            await this.loadProducts();

            // Show summary modal after products are loaded
            if (summary) {
                setTimeout(() => {
                    this.uploadSummaryModal.show(summary);
                }, 300);
            }
        } catch (error) {
            this.loginModal.showError('uploadError', error.message);
            this.productGrid.showEmptyState();
        }
    }

    async handleSearch(term) {
        try {
            const products = await this.productService.searchProducts(term);
            this.productGrid.display(products);
            this.updatePageTitle(term);
        } catch (error) {
            this.productGrid.showEmptyState('Error al buscar productos');
        }
    }

    updatePageTitle(searchTerm = '', category = null, subCategory = null) {
        const titleEl = document.getElementById('pageTitle');
        if (!titleEl) return;

        // Prioridad 1: Búsqueda activa
        if (searchTerm && searchTerm.trim().length > 0) {
            titleEl.textContent = 'Búsqueda Personalizada';
            return;
        }

        // Prioridad 2: Filtro de categoría
        if (category && category !== 'all') {
            titleEl.textContent = subCategory ? `${category} > ${subCategory}` : category;
            return;
        }

        // Default: Todos los productos
        titleEl.textContent = 'Todos los productos';
    }

    handleEditProduct(product) {
        this.productEditModal.show(product);

        // Set the callback for when user saves
        this.productEditModal.setOnSave(async (updatedProduct) => {
            try {
                await this.productService.updateProduct(updatedProduct.id, updatedProduct);

                await this.loadProducts();
            } catch (error) {

                alert(`Error al actualizar producto: ${error.message}`);
            }
        });
    }

    async handleDeleteProduct(product) {
        // Using custom confirm modal
        this.confirmModal.show(
            'Eliminar Producto',
            `¿Estás seguro de eliminar el producto "${product.producto}"?\n\nEsta acción no se puede deshacer.`,
            async () => {
                try {
                    await this.productService.deleteProduct(product.id);

                    await this.loadProducts();
                } catch (error) {

                    alert(`Error al eliminar producto: ${error.message}`);
                }
            }
        );
    }

    async loadProducts() {
        try {

            this.productGrid.showLoading();


            const products = await this.productService.getAllProducts();


            if (products && products.length > 0) {

                this.productGrid.display(products);

                this.categorySidebar.setProducts(products); // Populate sidebar
                this.searchBar.show();
            } else {

                this.productGrid.showEmptyState();
            }
        } catch (error) {

            this.productGrid.showEmptyState('Error al cargar productos');
        }
    }

    async updatePendingOrdersCount() {
        // If not logged in, don't update
        if (!this.currentUser) return;

        try {
            // If admin, get all pending. If user, get only theirs.
            const email = this.isAdmin ? null : this.currentUser.email;
            const count = await this.orderService.getPendingCount(email);
            this.ordersButton.setPendingCount(count);
        } catch (error) {
            console.error('Error updating pending count:', error);
        }
    }
}

// Initialize app when DOM is ready
const initApp = () => {

    try {
        const app = new HardwareCatalogApp();
        app.init();
    } catch (error) {

    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
