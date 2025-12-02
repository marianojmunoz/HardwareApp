import { formatPrice } from '../../utils/formatters.js';

export class OrderDetailsRow {
    constructor(order, index, onStatusChange) {
        this.order = order;
        this.index = index;
        this.onStatusChange = onStatusChange;
        this.isExpanded = false;
    }

    render() {
        const row = document.createElement('div');
        row.className = 'order-row';
        row.dataset.orderId = this.order.id;

        // Format date
        const date = new Date(this.order.created_at);
        const formattedDate = date.toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Count products (sum of quantities)
        const productCount = this.order.order_items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
        const productsText = productCount === 1 ? '1 producto' : `${productCount} productos`;

        // Status badge
        const statusBadge = this.getStatusBadge(this.order.status);

        row.innerHTML = `
            <div class="order-row-main">
                <div class="order-cell order-number">#${this.index}</div>
                <div class="order-cell order-email">${this.order.user_email}</div>
                <div class="order-cell order-date">${formattedDate}</div>
                <div class="order-cell order-products">
                    <button class="expand-btn" data-order-id="${this.order.id}">
                        <span class="expand-icon">▶</span>
                        <span>${productsText}</span>
                    </button>
                </div>
                <div class="order-cell order-total">${formatPrice(this.order.total_amount)}</div>
                <div class="order-cell order-status">
                    ${statusBadge}
                    <select class="status-select" data-order-id="${this.order.id}">
                        <option value="pending" ${this.order.status === 'pending' ? 'selected' : ''}>Pendiente</option>
                        <option value="accepted" ${this.order.status === 'accepted' ? 'selected' : ''}>Aceptado</option>
                        <option value="rejected" ${this.order.status === 'rejected' ? 'selected' : ''}>Rechazado</option>
                    </select>
                </div>
            </div>
            <div class="order-row-details" style="display: none;">
                ${this.renderOrderItems()}
            </div>
        `;

        // Attach event listeners
        this.attachEventListeners(row);

        return row;
    }

    renderOrderItems() {
        if (!this.order.order_items || this.order.order_items.length === 0) {
            return '<p class="no-items">No hay productos en este pedido</p>';
        }

        const itemsHtml = this.order.order_items.map((item, index) => `
            <div class="order-item">
                <span class="item-number">${index + 1}.</span>
                <span class="item-name">${item.product_name}</span>
                <span class="item-quantity">x${item.quantity}</span>
                <span class="item-price">${formatPrice(item.unit_price)}</span>
                <span class="item-subtotal">${formatPrice(item.subtotal)}</span>
            </div>
        `).join('');

        return `
            <div class="order-items-header">
                <span>Producto</span>
                <span>Cantidad</span>
                <span>Precio Unit.</span>
                <span>Subtotal</span>
            </div>
            <div class="order-items-list">
                ${itemsHtml}
            </div>
        `;
    }

    getStatusBadge(status) {
        const badges = {
            pending: '<span class="status-badge status-pending">Pendiente</span>',
            accepted: '<span class="status-badge status-accepted">Aceptado</span>',
            rejected: '<span class="status-badge status-rejected">Rechazado</span>'
        };
        return badges[status] || badges.pending;
    }

    attachEventListeners(row) {
        // Expand/Collapse button
        const expandBtn = row.querySelector('.expand-btn');
        const detailsDiv = row.querySelector('.order-row-details');
        const expandIcon = row.querySelector('.expand-icon');

        if (expandBtn) {
            expandBtn.addEventListener('click', () => {
                this.isExpanded = !this.isExpanded;
                if (this.isExpanded) {
                    detailsDiv.style.display = 'block';
                    expandIcon.textContent = '▼';
                    row.classList.add('expanded');
                } else {
                    detailsDiv.style.display = 'none';
                    expandIcon.textContent = '▶';
                    row.classList.remove('expanded');
                }
            });
        }

        // Status select
        const statusSelect = row.querySelector('.status-select');
        if (statusSelect) {
            statusSelect.addEventListener('change', async (e) => {
                const newStatus = e.target.value;
                if (this.onStatusChange) {
                    try {
                        await this.onStatusChange(this.order.id, newStatus);
                        this.order.status = newStatus;
                        // Update badge
                        const statusCell = row.querySelector('.order-status');
                        const badge = statusCell.querySelector('.status-badge');
                        if (badge) {
                            badge.outerHTML = this.getStatusBadge(newStatus);
                        }
                    } catch (error) {
                        console.error('Error updating status:', error);
                        // Revert select
                        e.target.value = this.order.status;
                        alert('Error al actualizar el estado del pedido');
                    }
                }
            });
        }
    }
}
