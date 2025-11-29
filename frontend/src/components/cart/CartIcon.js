export class CartIcon {
    constructor(containerId, cartService) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container with id "${containerId}" not found`);
        }
        this.cartService = cartService;
        this.onCartClick = null;

        this.render();
        this.setupListeners();
    }

    render() {
        const itemCount = this.cartService.getItemCount();

        this.container.innerHTML = `
            <div class="cart-icon-wrapper">
                <button class="cart-icon-btn" id="cartIconBtn" title="Ver carrito">
                    🛒
                    ${itemCount > 0 ? `<span class="cart-badge">${itemCount}</span>` : ''}
                </button>
            </div>
        `;
    }

    setupListeners() {
        // Update when cart changes
        this.cartService.subscribe(() => {
            this.render();
            this.attachClickHandler();
        });

        this.attachClickHandler();
    }

    attachClickHandler() {
        const btn = document.getElementById('cartIconBtn');
        if (btn && this.onCartClick) {
            btn.addEventListener('click', this.onCartClick);
        }
    }

    onClick(callback) {
        this.onCartClick = callback;
        this.attachClickHandler();
    }
}
