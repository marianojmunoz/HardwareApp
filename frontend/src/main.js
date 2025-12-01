// API Services
console.log('MAIN.JS LOADED - TOP LEVEL');
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
        this.checkoutService = new CheckoutService();

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
        console.log('Initializing Hardware Catalog App...');

        // Setup event listeners
        this.setupEventListeners();

        // Check if user is already logged in
        await this.checkAuthState();

        // Load initial products
        await this.loadProducts();
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
            this.cartService.addProduct(product, quantity);
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

        // Sort selector
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.productGrid.setSortOption(e.target.value);
            });
        }

        // Auth state changes
        authApi.onAuthStateChange((event, session) => {
            console.log('Auth state changed:', event);
            if (event === 'SIGNED_IN') {
                this.currentUser = session.user;
                this.isAdmin = this.ADMIN_EMAILS.includes(session.user.email);

                this.adminButton.showLoggedIn(session.user.email);

                // Only enable admin mode if user is in allowed list
                this.productGrid.setAdminMode(this.isAdmin);

                this.loadProducts(); // Reload to show/hide admin buttons
            } else if (event === 'PASSWORD_RECOVERY') {
                // User clicked password reset link - redirect to reset page
                console.log('Password recovery detected, redirecting to reset page');
                window.location.href = './password-reset.html';
            } else if (event === 'SIGNED_OUT') {
                this.currentUser = null;
                this.isAdmin = false;
                this.adminButton.showLoggedOut();
                this.productGrid.setAdminMode(false);
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
                this.productGrid.setAdminMode(this.isAdmin);
            }
        } catch (error) {
            console.error('Error checking auth state:', error);
        }
    }

    async handleLogin(email, password) {
        try {
            const { user } = await authApi.signIn(email, password);
            console.log('Login successful:', user);

            // Check if user is admin
            const isAdmin = this.ADMIN_EMAILS.includes(user.email);

            if (isAdmin) {
                this.loginModal.showUploadForm();
            } else {
                this.loginModal.showUserProfile(user.email);
            }
        } catch (error) {
            console.error('Login error:', error);
            this.loginModal.showError('loginError', error.message);
        }
    }

    async handleLogout() {
        try {
            await authApi.signOut();
            this.loginModal.hide();
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    async handleExcelUpload(file) {
        try {
            this.productGrid.showLoading('Procesando archivo Excel...');
            this.loginModal.clearError('uploadError');

            const products = await this.uploadService.uploadExcel(file);
            console.log(`${products.length} productos cargados exitosamente`);

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
            console.error('Upload error:', error);
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
            console.error('Search error:', error);
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
        console.log('Edit product:', product);
        this.productEditModal.show(product);

        // Set the callback for when user saves
        this.productEditModal.setOnSave(async (updatedProduct) => {
            try {
                await this.productService.updateProduct(updatedProduct.id, updatedProduct);
                console.log('Product updated:', updatedProduct.id);
                await this.loadProducts();
            } catch (error) {
                console.error('Update error:', error);
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
                    console.log('Product deleted:', product.id);
                    await this.loadProducts();
                } catch (error) {
                    console.error('Delete error:', error);
                    alert(`Error al eliminar producto: ${error.message}`);
                }
            }
        );
    }

    async loadProducts() {
        try {
            console.log('Starting loadProducts...');
            this.productGrid.showLoading();

            console.log('Fetching products from service...');
            const products = await this.productService.getAllProducts();
            console.log('Products fetched:', products ? products.length : 'null');

            if (products && products.length > 0) {
                console.log('Displaying products in grid...');
                this.productGrid.display(products);
                console.log('Setting products in sidebar...');
                this.categorySidebar.setProducts(products); // Populate sidebar
                this.searchBar.show();
            } else {
                console.log('No se encontraron productos.');
                this.productGrid.showEmptyState();
            }
        } catch (error) {
            console.error('Error al cargar productos:', error);
            this.productGrid.showEmptyState('Error al cargar productos');
        }
    }
}

// Initialize app when DOM is ready
const initApp = () => {
    console.log('Starting App Initialization...');
    try {
        const app = new HardwareCatalogApp();
        app.init();
    } catch (error) {
        console.error('Error al inicializar la app:', error);
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
