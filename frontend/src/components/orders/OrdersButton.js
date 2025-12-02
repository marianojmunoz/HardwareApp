export class OrdersButton {
    constructor(containerId, isAdmin = false) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            return;
        }

        this.isAdmin = isAdmin;
        this.isLoggedIn = false;
        this.onOrdersClick = null;
        this.pendingCount = 0;
    }

    render() {
        if (!this.isLoggedIn) {
            this.container.innerHTML = '';
            return;
        }

        // Show badge if there are pending orders
        const badgeHtml = this.pendingCount > 0
            ? `<span class="orders-badge">${this.pendingCount}</span>`
            : '';

        const title = this.isAdmin ? 'Ver todos los pedidos' : 'Ver mis pedidos';

        this.container.innerHTML = `
            <div class="orders-icon-wrapper">
                <button class="orders-icon-btn" id="ordersIconBtn" title="${title}">
                    📋
                    ${badgeHtml}
                </button>
            </div>
        `;

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

    // Update the pending orders count (admin only)
    setPendingCount(count) {
        this.pendingCount = count;
        this.render();
    }

    // Update visibility based on login and admin status
    setUserStatus(isLoggedIn, isAdmin = false) {
        this.isLoggedIn = isLoggedIn;
        this.isAdmin = isAdmin;
        this.render();
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
