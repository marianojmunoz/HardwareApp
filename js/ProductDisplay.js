import { ProductCard } from './ProductCard.js';

/**
 * ProductDisplay Class
 * Manages the rendering of the product grid and various UI states
 */
export class ProductDisplay {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container with id "${containerId}" not found`);
        }
    }

    /**
     * Display an array of products in a grid
     * @param {Array} products 
     */
    displayProducts(products) {
        if (!products || products.length === 0) {
            this.showEmptyState('No se encontraron productos');
            return;
        }

        const grid = document.createElement('div');
        grid.className = 'products-grid';

        products.forEach(product => {
            const productCard = new ProductCard(product);
            const cardElement = productCard.render();
            grid.appendChild(cardElement);
        });

        this.container.innerHTML = '';
        this.container.appendChild(grid);
    }

    /**
     * Show loading state
     * @param {string} message 
     */
    showLoading(message = 'Procesando archivo...') {
        this.container.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        <p>${message}</p>
      </div>
    `;
    }

    /**
     * Show empty state
     * @param {string} message 
     */
    showEmptyState(message = 'No hay productos cargados') {
        this.container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📦</div>
        <h3>${message}</h3>
        <p>Los productos aparecerán aquí una vez que el administrador los cargue</p>
      </div>
    `;
    }

    /**
     * Clear the container
     */
    clear() {
        this.container.innerHTML = '';
    }
}
