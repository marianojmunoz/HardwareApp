/**
 * ProductCard Class
 * Creates and formats individual product card DOM elements
 */
export class ProductCard {
    constructor(product) {
        this.product = product;
    }

    /**
     * Render the product card as a DOM element
     * @returns {HTMLElement}
     */
    render() {
        const card = document.createElement('div');
        card.className = 'product-card';

        // Get all keys except 'id'
        const keys = Object.keys(this.product).filter(key => key !== 'id');

        // Try to identify common fields
        const nameKey = this.findKey(keys, ['nombre', 'name', 'producto', 'product']);
        const priceKey = this.findKey(keys, ['precio', 'price']);
        const categoryKey = this.findKey(keys, ['categoria', 'category', 'tipo', 'type']);

        // Build card HTML
        let html = `<h3 class="product-name">${this.product[nameKey] || 'Producto'}</h3>`;
        html += `<div class="product-info">`;

        // Display all fields except the name (already shown as title)
        keys.forEach(key => {
            if (key !== nameKey && this.product[key] !== undefined &&
                this.product[key] !== null && this.product[key] !== '') {
                const value = this.product[key];
                const label = this.formatLabel(key);

                // Special formatting for price
                if (key === priceKey && !isNaN(value)) {
                    html += `<div class="product-price">${this.formatPrice(value)}</div>`;
                } else {
                    html += `
            <div class="product-detail">
              <span class="detail-label">${label}</span>
              <span class="detail-value">${value}</span>
            </div>
          `;
                }
            }
        });

        html += `</div>`;
        card.innerHTML = html;

        return card;
    }

    /**
     * Find a key in the keys array that matches any of the search terms
     * @param {string[]} keys 
     * @param {string[]} searchTerms 
     * @returns {string|null}
     */
    findKey(keys, searchTerms) {
        return keys.find(k =>
            searchTerms.some(term => k.toLowerCase().includes(term))
        ) || keys[0];
    }

    /**
     * Format a key name into a readable label
     * @param {string} key 
     * @returns {string}
     */
    formatLabel(key) {
        // Convert camelCase or snake_case to Title Case
        return key
            .replace(/([A-Z])/g, ' $1')
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())
            .trim();
    }

    /**
     * Format price value
     * @param {number} price 
     * @returns {string}
     */
    formatPrice(price) {
        return `$${parseFloat(price).toLocaleString('es-AR')}`;
    }
}
