export class SearchBar {
    constructor(inputId) {
        this.input = document.getElementById(inputId);
        if (!this.input) {
            throw new Error(`Input with id "${inputId}" not found`);
        }
        this.searchCallback = null;
    }

    setupEventListeners() {
        // Debounce para no buscar en cada tecla
        let timeout;
        this.input.addEventListener('input', (e) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                if (this.searchCallback) {
                    this.searchCallback(e.target.value);
                }
            }, 300);
        });
    }

    onSearch(callback) {
        this.searchCallback = callback;
    }

    getValue() {
        return this.input.value;
    }

    clear() {
        this.input.value = '';
    }

    show() {
        this.input.parentElement.style.display = 'flex';
    }

    hide() {
        this.input.parentElement.style.display = 'none';
    }
}
