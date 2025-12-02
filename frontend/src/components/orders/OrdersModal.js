import { OrderDetailsRow } from './OrderDetailsRow.js';

export class OrdersModal {
    constructor(orderService) {
        this.orderService = orderService;
        this.isOpen = false;
        this.orders = [];
        this.createModal();
    }

    createModal() {
        const modal = document.createElement('div');
        modal.className = 'orders-modal-overlay';
        modal.id = 'ordersModal';
        modal.innerHTML = `
            <div class="orders-modal-content">
                <div class="orders-modal-header">
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

    async show() {
        this.isOpen = true;
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        await this.loadOrders();
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

            this.orders = await this.orderService.getAllOrders();
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
                    <div class="empty-icon">📭</div>
                    <p>No hay pedidos registrados</p>
                    <small>Los pedidos aparecerán aquí cuando los usuarios confirmen su carrito</small>
                </div>
            `;
            return;
        }

        // Create table structure
        body.innerHTML = `
            <div class="orders-table-container">
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
                </div>

                <div class="orders-table">
                    <div class="orders-table-header">
                        <div class="order-cell order-number">#</div>
                        <div class="order-cell order-email">Email Cliente</div>
                        <div class="order-cell order-date">Fecha</div>
                        <div class="order-cell order-products">Productos</div>
                        <div class="order-cell order-total">Total</div>
                        <div class="order-cell order-status">Estado</div>
                    </div>
                    <div class="orders-table-body" id="ordersTableBody">
                        <!-- Orders will be rendered here -->
                    </div>
                </div>
            </div>
        `;

        const tableBody = body.querySelector('#ordersTableBody');

        // Render each order
        this.orders.forEach((order, index) => {
            // Pass index + 1 for 1-based numbering
            const orderRow = new OrderDetailsRow(order, index + 1, (orderId, newStatus) =>
                this.handleStatusChange(orderId, newStatus)
            );
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

            // Re-render stats to update counts
            this.updateStats();
        } catch (error) {

            throw error; // Re-throw to let OrderDetailsRow handle the error
        }
    }

    updateStats() {
        const statsContainer = this.modal.querySelector('.orders-stats');
        if (statsContainer) {
            const stats = statsContainer.querySelectorAll('.stat-value');
            if (stats.length >= 4) {
                stats[0].textContent = this.orders.length;
                stats[1].textContent = this.orders.filter(o => o.status === 'pending').length;
                stats[2].textContent = this.orders.filter(o => o.status === 'accepted').length;
                stats[3].textContent = this.orders.filter(o => o.status === 'rejected').length;
            }
        }
    }
}
