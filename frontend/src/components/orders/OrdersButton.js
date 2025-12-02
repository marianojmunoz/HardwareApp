export class OrdersButton {
    constructor(containerId, isAdmin = false) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.warn(`Container with id "${containerId}" not found`);
            return;
        }

        this.isAdmin = isAdmin;
        this.onOrdersClick = null;
        this.pendingCount = 0;

        if (this.isAdmin) {
            this.render();
            this.setupListeners();
        }
    }

    render() {
        if (!this.isAdmin) {
            this.container.innerHTML = '';
            return;
        }

        this.container.innerHTML = `
            <div class="orders-icon-wrapper">
                <button class="orders-icon-btn" id="ordersIconBtn" title="Ver pedidos pendientes">
                    📋
                    ${this.pendingCount > 0 ? `<span class="orders-badge">${this.pendingCount}</span>` : ''}
                </button>
            </div>
        `;
    }

    setupListeners() {
        this.attachClickHandler();
    }

    attachClickHandler() {
        const btn = document.getElementById('ordersIconBtn');
        if (btn && this.onOrdersClick) {
            btn.addEventListener('click', this.onOrdersClick);
        }
    }

    onClick(callback) {
        this.onOrdersClick = callback;
        this.attachClickHandler();
    }

    // Update the pending orders count
    setPendingCount(count) {
        this.pendingCount = count;
        this.render();
        this.attachClickHandler(); // Re-attach after re-render
    }

    // Update visibility based on admin status
    setAdminMode(isAdmin) {
        this.isAdmin = isAdmin;
        this.render();
        if (isAdmin) {
            this.setupListeners();
        }
    }

    show() {
        if (this.container) {
            this.container.style.display = 'block';
        }
    }

    hide() {
        if (this.container) {
            this.container.style.display = 'none';
        }
    }
}
