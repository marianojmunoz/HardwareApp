/**
 * ProductManager Class
 * Manages product data, filtering, and searching
 */
export class ProductManager {
    constructor() {
        this.allProducts = [];
        this.filteredProducts = [];
    }

    /**
     * Set the complete product list
     * @param {Array} products 
     */
    setProducts(products) {
        this.allProducts = products.map((product, index) => ({
            id: index,
            ...product
        }));
        this.filteredProducts = [...this.allProducts];
    }

    /**
     * Get all products
     * @returns {Array}
     */
    getProducts() {
        return this.allProducts;
    }

    /**
     * Get filtered products
     * @returns {Array}
     */
    getFilteredProducts() {
        return this.filteredProducts;
    }

    /**
     * Search products by term across all fields
     * @param {string} searchTerm 
     * @returns {Array}
     */
    searchProducts(searchTerm) {
        if (!searchTerm || searchTerm.trim() === '') {
            this.filteredProducts = [...this.allProducts];
            return this.filteredProducts;
        }

        const term = searchTerm.toLowerCase();
        this.filteredProducts = this.allProducts.filter(product => {
            return Object.values(product).some(value =>
                String(value).toLowerCase().includes(term)
            );
        });

        return this.filteredProducts;
    }

    /**
     * Filter products by category
     * @param {string} category 
     * @returns {Array}
     */
    filterByCategory(category) {
        if (!category || category === '') {
            this.filteredProducts = [...this.allProducts];
            return this.filteredProducts;
        }

        const categoryKey = this.getCategoryKey();
        if (!categoryKey) {
            return this.filteredProducts;
        }

        this.filteredProducts = this.allProducts.filter(product =>
            product[categoryKey] === category
        );

        return this.filteredProducts;
    }

    /**
     * Apply both search and category filter
     * @param {string} searchTerm 
     * @param {string} category 
     * @returns {Array}
     */
    applyFilters(searchTerm, category) {
        let results = [...this.allProducts];

        // Apply category filter
        if (category && category !== '') {
            const categoryKey = this.getCategoryKey();
            if (categoryKey) {
                results = results.filter(product => product[categoryKey] === category);
            }
        }

        // Apply search filter
        if (searchTerm && searchTerm.trim() !== '') {
            const term = searchTerm.toLowerCase();
            results = results.filter(product => {
                return Object.values(product).some(value =>
                    String(value).toLowerCase().includes(term)
                );
            });
        }

        this.filteredProducts = results;
        return this.filteredProducts;
    }

    /**
     * Get all unique categories from products
     * @returns {Array}
     */
    getCategories() {
        const categoryKey = this.getCategoryKey();
        if (!categoryKey) {
            return [];
        }

        const categories = new Set();
        this.allProducts.forEach(product => {
            if (product[categoryKey]) {
                categories.add(product[categoryKey]);
            }
        });

        return Array.from(categories).sort();
    }

    /**
     * Find the category key in product data
     * @returns {string|null}
     */
    getCategoryKey() {
        if (this.allProducts.length === 0) {
            return null;
        }

        const categoryKeys = ['categoria', 'category', 'tipo', 'type'];
        const keys = Object.keys(this.allProducts[0]);

        return keys.find(k =>
            categoryKeys.some(ck => k.toLowerCase().includes(ck))
        );
    }

    /**
     * Check if there are products
     * @returns {boolean}
     */
    hasProducts() {
        return this.allProducts.length > 0;
    }

    /**
     * Clear all products
     */
    clear() {
        this.allProducts = [];
        this.filteredProducts = [];
    }
}
