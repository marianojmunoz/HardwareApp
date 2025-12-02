import { OrderDetailsRow } from './OrderDetailsRow.js';

export class OrdersModal {
    constructor(orderService, isAdmin = false) {
        this.orderService = orderService;
        this.isAdmin = isAdmin;
        this.isOpen = false;
        this.orders = [];
        this.userEmail = null; // To store user's email for fetching their orders
        this.createModal();
    }

    createModal() {
        const modal = document.createElement('div');
        modal.className = 'orders-modal-overlay';
        modal.id = 'ordersModal';
        modal.innerHTML = `
            <div class="orders-modal-content">
                <div class="orders-modal-header" id="ordersModalHeader">
                    <h2>📋 Gestión de Pedidos</h2>
                    <button class="orders-close-btn" id="closeOrdersBtn">✕</button>
                </div>
                <div class="orders-modal-body" id="ordersModalBody">
                    <div class="orders-loading">
                        <div class="spinner"></div>
                        <p>Cargando pedidos...</p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.modal = modal;

        // Attach close events
        const closeBtn = modal.querySelector('#closeOrdersBtn');
        closeBtn?.addEventListener('click', () => this.hide());

        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hide();
            }
        });
    }

    async show(userEmail = null) {
        this.isOpen = true;
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.userEmail = userEmail;

        this.updateTitle();
        await this.loadOrders();
    }

    updateTitle() {
        const header = this.modal.querySelector('#ordersModalHeader h2');
        const title = this.isAdmin ? '📋 Gestión de Pedidos' : '🛍️ Mis Pedidos';
        header.textContent = title;
    }

    hide() {
        this.isOpen = false;
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    async loadOrders() {
        const body = this.modal.querySelector('#ordersModalBody');

        try {
            body.innerHTML = `
                <div class="orders-loading">
                    <div class="spinner"></div>
                    <p>Cargando pedidos...</p>
                </div>
            `;

            if (this.isAdmin) {
                this.orders = await this.orderService.getAllOrders();
            } else {
                this.orders = await this.orderService.getOrdersByEmail(this.userEmail);
            }

            this.renderOrders();
        } catch (error) {
            body.innerHTML = `
                <div class="orders-error">
                    <p>❌ Error al cargar pedidos</p>
                    <small>${error.message}</small>
                    <button class="btn-primary" id="retryLoadOrders">Reintentar</button>
                </div>
            `;

            const retryBtn = body.querySelector('#retryLoadOrders');
            retryBtn?.addEventListener('click', () => this.loadOrders());
        }
    }

    renderOrders() {
        const body = this.modal.querySelector('#ordersModalBody');

        if (!this.orders || this.orders.length === 0) {
            body.innerHTML = `
                <div class="orders-empty-state">
                    <div class="empty-icon">${this.isAdmin ? '📭' : '🛒'}</div>
                    <p>No hay pedidos registrados</p>
                    <small>Los pedidos aparecerán aquí cuando los usuarios confirmen su carrito</small>
                </div>
            `;
            return;
        }

        const statsHtml = this.isAdmin ? this.renderStats() : '';

        // For admins, render grouped by user
        if (this.isAdmin) {
            this.renderGroupedOrders(body, statsHtml);
        } else {
            // For regular users, render flat list
            this.renderFlatOrders(body, statsHtml);
        }
    }

    renderGroupedOrders(body, statsHtml) {
        // Group orders by email
        const ordersByEmail = this.orders.reduce((acc, order) => {
            const email = order.user_email || 'Sin email';
            if (!acc[email]) {
                acc[email] = [];
            }
            acc[email].push(order);
            return acc;
        }, {});

        body.innerHTML = `
            <div class="orders-table-container">
                ${statsHtml}
                <div class="orders-grouped-list" id="ordersGroupedList">
                    <!-- Groups will be rendered here -->
                </div>
            </div>
            <div class="orders-total-general">
                <span>Total General: </span>
                <span class="total-amount">${this.calculateTotalGeneral()}</span>
            </div>
        `;

        const listContainer = body.querySelector('#ordersGroupedList');

        Object.entries(ordersByEmail).forEach(([email, userOrders]) => {
            this.renderUserGroup(listContainer, email, userOrders);
        });
    }

    renderUserGroup(container, email, userOrders) {
        // Calculate user totals
        const totalAmount = userOrders.reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0);
        const totalProducts = userOrders.reduce((sum, o) => {
            // Count total items across all orders
            return sum + (o.order_items ? o.order_items.reduce((s, i) => s + i.quantity, 0) : 0);
        }, 0);

        const formattedTotal = new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(totalAmount);

        const groupDiv = document.createElement('div');
        groupDiv.className = 'order-user-group';

        // User Header Row
        groupDiv.innerHTML = `
            <div class="user-group-header" data-email="${email}">
                <div class="user-info">
                    <span class="user-email">👤 ${email}</span>
                    <span class="user-stats">
                        <span class="badge-qty">${totalProducts} productos</span>
                        <span class="badge-total">${formattedTotal}</span>
                        <span class="badge-count">${userOrders.length} pedidos</span>
                    </span>
                </div>
                <div class="user-toggle">▼</div>
            </div>
            <div class="user-group-body" style="display: none;">
                <div class="orders-table">
                    <div class="orders-table-header">
                        <div class="order-cell order-number">#</div>
                        <div class="order-cell order-date">Fecha</div>
                        <div class="order-cell order-products">Productos</div>
                        <div class="order-cell order-total">Total</div>
                        <div class="order-cell order-status">Estado</div>
                    </div>
                    <div class="orders-table-body user-orders-body"></div>
                </div>
            </div>
        `;

        // Render orders for this user
        const ordersBody = groupDiv.querySelector('.user-orders-body');
        userOrders.forEach((order, index) => {
            const statusChangeCallback = (orderId, newStatus) => this.handleStatusChange(orderId, newStatus);
            // Pass false for isAdmin to OrderDetailsRow to hide the Email column in the nested table
            const orderRow = new OrderDetailsRow(order, index + 1, statusChangeCallback, false);
            ordersBody.appendChild(orderRow.render());
        });

        // Toggle event
        const header = groupDiv.querySelector('.user-group-header');
        const body = groupDiv.querySelector('.user-group-body');
        const toggle = groupDiv.querySelector('.user-toggle');

        header.addEventListener('click', () => {
            const isVisible = body.style.display !== 'none';
            body.style.display = isVisible ? 'none' : 'block';
            toggle.textContent = isVisible ? '▼' : '▲';
            header.classList.toggle('active', !isVisible);
        });

        container.appendChild(groupDiv);
    }

    renderFlatOrders(body, statsHtml) {
        body.innerHTML = `
            <div class="orders-table-container">
                ${statsHtml}
                <div class="orders-table">
                    <div class="orders-table-header">
                        <div class="order-cell order-number">#</div>
                        ${this.isAdmin ? '<div class="order-cell order-email">Email Cliente</div>' : ''}
                        <div class="order-cell order-date">Fecha</div>
                        <div class="order-cell order-products">Productos</div>
                        <div class="order-cell order-total">Total</div>
                        <div class="order-cell order-status">Estado</div>
                    </div>
                    <div class="orders-table-body" id="ordersTableBody"></div>
                </div>
            </div>
            <div class="orders-total-general">
                <span>Total General: </span>
                <span class="total-amount">${this.calculateTotalGeneral()}</span>
            </div>
        `;

        const tableBody = body.querySelector('#ordersTableBody');

        this.orders.forEach((order, index) => {
            const statusChangeCallback = this.isAdmin ?
                (orderId, newStatus) => this.handleStatusChange(orderId, newStatus) :
                null;

            const orderRow = new OrderDetailsRow(order, index + 1, statusChangeCallback, this.isAdmin);
            tableBody.appendChild(orderRow.render());
        });
    }

    async handleStatusChange(orderId, newStatus) {
        try {
            await this.orderService.updateOrderStatus(orderId, newStatus);

            // Update local order data
            const order = this.orders.find(o => o.id === orderId);
            if (order) {
                order.status = newStatus;
            }

            // Re-render to update UI (stats and totals)
            if (this.isAdmin) {
                // Full re-render needed to update group totals
                const body = this.modal.querySelector('#ordersModalBody');
                const statsHtml = this.renderStats();
                this.renderGroupedOrders(body, statsHtml);
            }
        } catch (error) {
            throw error;
        }
    }

    updateStats() {
        // Deprecated in favor of full re-render for grouped view
        // But kept for compatibility if needed
    }

    renderStats() {
        return `
            <div class="orders-stats">
                <div class="stat-item">
                    <span class="stat-value">${this.orders.length}</span>
                    <span class="stat-label">Total de pedidos</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${this.orders.filter(o => o.status === 'pending').length}</span>
                    <span class="stat-label">Pendientes</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${this.orders.filter(o => o.status === 'accepted').length}</span>
                    <span class="stat-label">Aceptados</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${this.orders.filter(o => o.status === 'rejected').length}</span>
                    <span class="stat-label">Rechazados</span>
                </div>
            </div>`;
    }

    calculateTotalGeneral() {
        const total = this.orders.reduce((sum, order) => {
            return sum + (parseFloat(order.total_amount) || 0);
        }, 0);

        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(total);
    }
}
