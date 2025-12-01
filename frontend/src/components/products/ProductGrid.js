import { ProductCard } from './ProductCard.js';

export class ProductGrid {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container with id "${containerId}" not found`);
        }
        this.isAdmin = false;
        this.onEdit = null;
        this.onDelete = null;
        this.onAddToCart = null;
        this.products = [];
        this.filteredProducts = [];
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.currentSort = ''; // '', 'price-asc', 'price-desc'
    }

    setAdminMode(isAdmin) {
        this.isAdmin = isAdmin;
    }

    display(products) {
        this.products = products; // Store full list
        this.filteredProducts = products;
        this.currentPage = 1;
        this.applySorting();
        this.renderGrid();
    }

    renderGrid() {
        this.container.innerHTML = '';

        if (!this.filteredProducts || this.filteredProducts.length === 0) {
            this.showEmptyState();
            this.updateProductCount(0);
            return;
        }

        // Calculate pagination
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const productsToRender = this.filteredProducts.slice(startIndex, endIndex);

        const grid = document.createElement('div');
        grid.className = 'products-grid';

        productsToRender.forEach(product => {
            try {
                const card = new ProductCard(product, this.isAdmin);

                card.setEditCallback((p) => {
                    if (this.onEdit) this.onEdit(p);
                });

                card.setDeleteCallback((p) => {
                    if (this.onDelete) this.onDelete(p);
                });

                card.setAddToCartCallback((p, quantity) => {
                    if (this.onAddToCart) this.onAddToCart(p, quantity);
                });

                grid.appendChild(card.render());
            } catch (error) {
                console.error('Error rendering product card:', product, error);
            }
        });

        this.container.appendChild(grid);
        this.renderPagination();
        this.updateProductCount(this.filteredProducts.length);
    }

    renderPagination() {
        const totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
        console.log('renderPagination called:', {
            filteredProductsLength: this.filteredProducts.length,
            itemsPerPage: this.itemsPerPage,
            totalPages: totalPages,
            currentPage: this.currentPage
        });

        // Always show pagination, even with 1 page
        const paginationContainer = document.createElement('div');
        paginationContainer.className = 'pagination-controls';

        // Items per page selector
        const itemsPerPageContainer = document.createElement('div');
        itemsPerPageContainer.className = 'items-per-page';
        itemsPerPageContainer.innerHTML = `
            <label for="itemsPerPageSelect">Items por página:</label>
            <select id="itemsPerPageSelect" class="items-per-page-select">
                <option value="1" ${this.itemsPerPage === 1 ? 'selected' : ''}>1</option>
                <option value="3" ${this.itemsPerPage === 3 ? 'selected' : ''}>3</option>
                <option value="6" ${this.itemsPerPage === 6 ? 'selected' : ''}>6</option>
                <option value="12" ${this.itemsPerPage === 12 ? 'selected' : ''}>12</option>
                <option value="15" ${this.itemsPerPage === 15 ? 'selected' : ''}>15</option>
                <option value="1000" ${this.itemsPerPage === 1000 ? 'selected' : ''}>Todos</option>
            </select>
        `;

        // Previous Button
        const prevBtn = document.createElement('button');
        prevBtn.className = 'btn-pagination';
        prevBtn.innerHTML = '← Prev';
        prevBtn.disabled = this.currentPage === 1;
        prevBtn.onclick = () => this.changePage(this.currentPage - 1);

        // Page Info
        const pageInfo = document.createElement('span');
        pageInfo.className = 'page-info';
        pageInfo.textContent = `Página ${this.currentPage} de ${totalPages}`;

        // Next Button
        const nextBtn = document.createElement('button');
        nextBtn.className = 'btn-pagination';
        nextBtn.innerHTML = 'Next →';
        nextBtn.disabled = this.currentPage === totalPages;
        nextBtn.onclick = () => this.changePage(this.currentPage + 1);

        paginationContainer.appendChild(itemsPerPageContainer);
        paginationContainer.appendChild(prevBtn);
        paginationContainer.appendChild(pageInfo);
        paginationContainer.appendChild(nextBtn);

        this.container.appendChild(paginationContainer);
        console.log('Pagination controls appended to container');

        // Add event listener for items per page change
        const selectElement = document.getElementById('itemsPerPageSelect');
        if (selectElement) {
            selectElement.addEventListener('change', (e) => {
                this.itemsPerPage = parseInt(e.target.value);
                this.currentPage = 1; // Reset to first page
                this.renderGrid();
            });
        }
    }

    changePage(newPage) {
        this.currentPage = newPage;
        this.renderGrid();
        // Scroll to top of grid
        const mainContent = document.querySelector('.content-scroll');
        if (mainContent) mainContent.scrollTop = 0;
    }

    filterByCategory(category, subCategory) {
        if (!category || category === 'all') {
            this.filteredProducts = this.products;
        } else {
            this.filteredProducts = this.products.filter(p => {
                const matchCat = p.categoria === category;
                const matchSub = subCategory ? p.sub_categoria === subCategory : true;
                return matchCat && matchSub;
            });
        }

        this.currentPage = 1;
        this.renderGrid();
    }

    showEmptyState(message = 'No se encontraron productos') {
        this.container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <p>${message}</p>
            </div>
        `;
    }

    showLoading(message = 'Cargando productos...') {
        this.container.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>${message}</p>
            </div>
        `;
    }

    setEditCallback(callback) {
        this.onEdit = callback;
    }

    setDeleteCallback(callback) {
        this.onDelete = callback;
    }

    setAddToCartCallback(callback) {
        this.onAddToCart = callback;
    }

    updateProductCount(count) {
        const countEl = document.getElementById('productCount');
        if (countEl) {
            countEl.textContent = `Mostrando ${count} producto${count !== 1 ? 's' : ''}`;
        }
    }

    applySorting() {
        if (!this.currentSort) {
            // No sorting - keep original order
            return;
        }

        this.filteredProducts = [...this.filteredProducts].sort((a, b) => {
            const priceA = parseFloat(a.precio_total) || 0;
            const priceB = parseFloat(b.precio_total) || 0;

            if (this.currentSort === 'price-asc') {
                return priceA - priceB; // Ascending
            } else if (this.currentSort === 'price-desc') {
                return priceB - priceA; // Descending
            }
            return 0;
        });
    }

    setSortOption(sortOption) {
        this.currentSort = sortOption;
        this.applySorting();
        this.currentPage = 1; // Reset to first page
        this.renderGrid();
    }

    clear() {
        this.container.innerHTML = '';
    }
}
