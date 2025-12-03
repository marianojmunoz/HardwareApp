import { CartItem } from './CartItem.js';
import { formatPrice } from '../../utils/formatters.js';

export class Cart {
    constructor(cartService, checkoutService) {
        this.cartService = cartService;
        this.checkoutService = checkoutService;
        this.isOpen = false;
        this.createModal();
        this.setupListeners();
    }

    createModal() {
        // Create modal overlay
        const modal = document.createElement('div');
        modal.className = 'cart-modal-overlay';
        modal.id = 'cartModal';
        modal.innerHTML = `
            <div class="cart-modal-content">
                <div class="cart-modal-header">
                    <h2>🛒 Carrito de Compras</h2>
                    <button class="cart-close-btn" id="closeCartBtn">✕</button>
                </div>
                <div class="cart-modal-body" id="cartModalBody">
                    <!-- Cart items will be rendered here -->
                </div>
                <div class="cart-modal-footer">
                    <div class="cart-total">
                        <span class="cart-total-label">Total:</span>
                        <span class="cart-total-value" id="cartTotalValue">$0</span>
                    </div>
                    <div class="cart-actions">
                        <button class="btn-secondary" id="clearCartBtn">Vaciar Carrito</button>
                        <button class="btn-primary" id="checkoutBtn">Confirmar Pedido</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.modal = modal;

        // Create confirmation modal
        const confirmModal = document.createElement('div');
        confirmModal.className = 'cart-modal-overlay';
        confirmModal.id = 'confirmModal';
        confirmModal.style.zIndex = '1001'; // Higher than cart modal
        confirmModal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-header">
                    <h3 class="modal-title">Confirmar acción</h3>
                </div>
                <p style="margin: 1rem 0;">¿Estás seguro de vaciar el carrito?</p>
                <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                    <button class="btn-secondary" id="confirmCancelBtn" style="flex: 1;">Cancelar</button>
                    <button class="btn-primary" id="confirmOkBtn" style="flex: 1; background: var(--error);">Vaciar</button>
                </div>
            </div>
        `;
        document.body.appendChild(confirmModal);
        this.confirmModal = confirmModal;

        // Attach close events
        const closeBtn = modal.querySelector('#closeCartBtn');
        closeBtn?.addEventListener('click', () => this.hide());

        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hide();
            }
        });

        // Clear cart button - show confirmation modal
        const clearBtn = modal.querySelector('#clearCartBtn');
        clearBtn?.addEventListener('click', () => {

            this.confirmModal.classList.add('active');
        });

        // Confirmation modal buttons
        const confirmOkBtn = confirmModal.querySelector('#confirmOkBtn');
        const confirmCancelBtn = confirmModal.querySelector('#confirmCancelBtn');

        confirmOkBtn?.addEventListener('click', () => {

            this.confirmModal.classList.remove('active');
            this.cartService.clearCart();
            this.hide();
        });

        confirmCancelBtn?.addEventListener('click', () => {

            this.confirmModal.classList.remove('active');
        });

        // Click outside confirmation modal to close
        confirmModal.addEventListener('click', (e) => {
            if (e.target === confirmModal) {
                this.confirmModal.classList.remove('active');
            }
        });

        // Checkout button
        const checkoutBtn = modal.querySelector('#checkoutBtn');
        checkoutBtn?.addEventListener('click', async () => {
            try {
                const items = this.cartService.getItems();
                await this.checkoutService.processCheckout(items);

                // Clear cart after successful checkout
                this.cartService.clearCart();
                this.hide();
            } catch (error) {
                alert(error.message);
            }
        });
    }

    setupListeners() {
        // Update cart display when cart changes
        this.cartService.subscribe(() => {
            if (this.isOpen) {
                this.renderItems();
            }
        });
    }

    show() {
        this.isOpen = true;
        this.renderItems();
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    hide() {
        this.isOpen = false;
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    renderItems() {
        const body = this.modal.querySelector('#cartModalBody');
        const totalEl = this.modal.querySelector('#cartTotalValue');
        const items = this.cartService.getItems();

        if (items.length === 0) {
            body.innerHTML = `
                <div class="cart-empty-state">
                    <div class="cart-empty-icon">🛒</div>
                    <p>Tu carrito está vacío</p>
                    <small>Agrega productos para comenzar</small>
                </div>
            `;
            totalEl.textContent = formatPrice(0);
            return;
        }

        // Render cart items
        body.innerHTML = '';
        items.forEach(item => {
            const cartItem = new CartItem(item, this.cartService);
            body.appendChild(cartItem.render());
        });

        // Update total
        const total = this.cartService.getTotal();
        totalEl.textContent = formatPrice(total);
    }
}
