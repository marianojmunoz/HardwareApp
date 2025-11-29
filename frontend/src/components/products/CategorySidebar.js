export class CategorySidebar {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.products = [];
        this.categories = {};
        this.activeCategory = null;
        this.activeSubCategory = null;
        this.expandedCategories = new Set(); // Track expanded states independently
        this.onFilterChange = null;
    }

    setFilterCallback(callback) {
        this.onFilterChange = callback;
    }

    setProducts(products) {
        this.products = products;
        this.extractCategories();
        this.render();
    }

    extractCategories() {
        this.categories = {};

        this.products.forEach(product => {
            const cat = product.categoria || 'Sin Categoría';
            const subCat = product.sub_categoria;

            if (!this.categories[cat]) {
                this.categories[cat] = new Set();
            }

            if (subCat) {
                this.categories[cat].add(subCat);
            }
        });
    }

    render() {
        if (!this.container) return;

        // "All Products" link
        let html = `
            <div class="nav-item ${!this.activeCategory ? 'active' : ''}" data-action="all">
                <span class="nav-icon">🏠</span>
                <span class="nav-text">Todos los productos</span>
            </div>
            <div class="nav-divider"></div>
        `;

        // Categories
        Object.keys(this.categories).sort().forEach(category => {
            const subCategories = Array.from(this.categories[category]).sort();
            const hasSubCats = subCategories.length > 0;
            const isExpanded = this.expandedCategories.has(category);
            const isActiveCategory = this.activeCategory === category;

            html += `
                <div class="category-group ${isExpanded ? 'expanded' : ''}">
                    <div class="nav-item ${isActiveCategory && !this.activeSubCategory ? 'active' : ''}" 
                         data-category="${category}"
                         data-has-subcats="${hasSubCats}">
                        <span class="nav-icon">📦</span>
                        <span class="nav-text">${category}</span>
                        ${hasSubCats ? `<span class="chevron ${isExpanded ? 'rotated' : ''}">›</span>` : ''}
                    </div>
                    
                    ${hasSubCats ? `
                        <div class="sub-category-list" style="${isExpanded ? 'max-height: 1000px; opacity: 1;' : 'max-height: 0; opacity: 0;'}">
                            ${subCategories.map(sub => `
                                <div class="nav-item sub-item ${this.activeSubCategory === sub ? 'active' : ''}" 
                                     data-category="${category}" 
                                     data-subcategory="${sub}">
                                    <span class="nav-text">${sub}</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
        });

        this.container.innerHTML = html;
        this.attachEventListeners();
    }

    attachEventListeners() {
        this.container.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();

                if (item.dataset.action === 'all') {
                    this.activeCategory = null;
                    this.activeSubCategory = null;
                    this.expandedCategories.clear();
                    this.triggerFilter();
                    this.render();
                    return;
                }

                const category = item.dataset.category;
                const subCategory = item.dataset.subcategory;
                const hasSubCats = item.dataset.hasSubcats === 'true';

                if (subCategory) {
                    // Clicked a sub-category
                    this.activeCategory = category;
                    this.activeSubCategory = subCategory;
                    this.triggerFilter();
                } else {
                    // Clicked a category header
                    if (hasSubCats) {
                        // Toggle expansion only
                        if (this.expandedCategories.has(category)) {
                            this.expandedCategories.delete(category);
                        } else {
                            this.expandedCategories.add(category);
                        }
                        // Optional: Don't filter, just toggle. 
                        // Or if you want to filter "All in Category", uncomment below:
                        // this.activeCategory = category;
                        // this.activeSubCategory = null;
                        // this.triggerFilter();
                    } else {
                        // Category with no sub-cats: Filter directly
                        this.activeCategory = category;
                        this.activeSubCategory = null;
                        this.triggerFilter();
                    }
                }

                this.render();
            });
        });
    }

    triggerFilter() {
        if (this.onFilterChange) {
            this.onFilterChange(this.activeCategory, this.activeSubCategory);
        }
    }
}
