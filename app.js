import { AuthManager } from './js/AuthManager.js';
import { StorageManager } from './js/StorageManager.js';
import { ProductManager } from './js/ProductManager.js';
import { ProductDisplay } from './js/ProductDisplay.js';
import { SearchFilter } from './js/SearchFilter.js';
import { FileUploader } from './js/FileUploader.js';
import { LoginModal } from './js/LoginModal.js';

/**
 * HardwareCatalogApp
 * Main application controller that coordinates all components
 */
class HardwareCatalogApp {
  constructor() {
    // Initialize all components
    this.authManager = new AuthManager();
    this.storageManager = new StorageManager('hardwareProducts');
    this.productManager = new ProductManager();
    this.productDisplay = new ProductDisplay('productsContainer');
    this.searchFilter = new SearchFilter('searchBox', 'filterSelect', 'controls');
    this.fileUploader = new FileUploader(this.authManager);
    this.loginModal = new LoginModal(this.authManager, this.fileUploader);

    this.currentSearchTerm = '';
    this.currentCategory = '';
  }

  /**
   * Initialize the application
   */
  init() {
    // Setup event listeners
    this.setupEventListeners();

    // Load products from storage if available
    this.loadStoredProducts();

    // Setup admin button
    this.setupAdminButton();
  }

  /**
   * Setup all event listeners
   */
  setupEventListeners() {
    // File upload success
    this.fileUploader.onUploadSuccess((products) => {
      this.handleProductsUploaded(products);
    });

    // File upload error
    this.fileUploader.onUploadError((error) => {
      console.error('Upload error:', error);
      this.loginModal.displayError('uploadError', error);
    });

    // Search filter events
    this.searchFilter.onSearchChange((searchTerm) => {
      this.currentSearchTerm = searchTerm;
      this.applyFilters();
    });

    this.searchFilter.onFilterChange((category) => {
      this.currentCategory = category;
      this.applyFilters();
    });

    this.searchFilter.setupEventListeners();
  }

  /**
   * Load products from localStorage
   */
  loadStoredProducts() {
    const storedProducts = this.storageManager.load();

    if (storedProducts && storedProducts.length > 0) {
      this.productManager.setProducts(storedProducts);
      this.displayProducts();
      this.searchFilter.show();
      this.searchFilter.populateCategories(this.productManager.getCategories());
    } else {
      this.productDisplay.showEmptyState();
      this.searchFilter.hide();
    }
  }

  /**
   * Handle products uploaded
   * @param {Array} products 
   */
  handleProductsUploaded(products) {
    // Set products in manager
    this.productManager.setProducts(products);

    // Save to storage
    this.storageManager.save(products);

    // Display products
    this.displayProducts();

    // Setup search/filter
    this.searchFilter.show();
    this.searchFilter.populateCategories(this.productManager.getCategories());
    this.searchFilter.reset();

    // Close modal
    this.loginModal.closeAfterUpload();
  }

  /**
   * Apply current search and filter
   */
  applyFilters() {
    const filteredProducts = this.productManager.applyFilters(
      this.currentSearchTerm,
      this.currentCategory
    );

    this.productDisplay.displayProducts(filteredProducts);
  }

  /**
   * Display products
   */
  displayProducts() {
    const products = this.productManager.getFilteredProducts();
    this.productDisplay.displayProducts(products);
  }

  /**
   * Setup admin button
   */
  setupAdminButton() {
    const adminBtn = document.getElementById('adminBtn');
    if (adminBtn) {
      adminBtn.addEventListener('click', () => {
        this.loginModal.show();
      });
    }
  }
}

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new HardwareCatalogApp();
  app.init();
});
