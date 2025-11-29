/**
 * SearchFilter Class
 * Manages search and category filter UI and events
 */
export class SearchFilter {
    constructor(searchBoxId, filterSelectId, controlsId) {
        this.searchBox = document.getElementById(searchBoxId);
        this.filterSelect = document.getElementById(filterSelectId);
        this.controls = document.getElementById(controlsId);

        if (!this.searchBox || !this.filterSelect || !this.controls) {
            throw new Error('Search/Filter elements not found');
        }

        this.searchCallback = null;
        this.filterCallback = null;
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        this.searchBox.addEventListener('input', (e) => {
            if (this.searchCallback) {
                this.searchCallback(e.target.value);
            }
        });

        this.filterSelect.addEventListener('change', (e) => {
            if (this.filterCallback) {
                this.filterCallback(e.target.value);
            }
        });
    }

    /**
     * Register callback for search changes
     * @param {Function} callback 
     */
    onSearchChange(callback) {
        this.searchCallback = callback;
    }

    /**
     * Register callback for filter changes
     * @param {Function} callback 
     */
    onFilterChange(callback) {
        this.filterCallback = callback;
    }

    /**
     * Populate the category dropdown
     * @param {Array} categories 
     */
    populateCategories(categories) {
        if (!categories || categories.length === 0) {
            this.filterSelect.style.display = 'none';
            return;
        }

        this.filterSelect.style.display = 'block';
        this.filterSelect.innerHTML = '<option value="">Todas las categorías</option>';

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            this.filterSelect.appendChild(option);
        });
    }

    /**
     * Show the search/filter controls
     */
    show() {
        this.controls.style.display = 'flex';
    }

    /**
     * Hide the search/filter controls
     */
    hide() {
        this.controls.style.display = 'none';
    }

    /**
     * Clear search input
     */
    clearSearch() {
        this.searchBox.value = '';
    }

    /**
     * Reset filter to default
     */
    resetFilter() {
        this.filterSelect.value = '';
    }

    /**
     * Clear both search and filter
     */
    reset() {
        this.clearSearch();
        this.resetFilter();
    }
}
