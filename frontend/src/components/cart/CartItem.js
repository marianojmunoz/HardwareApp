import { formatPrice } from '../../utils/formatters.js';

export class CartItem {
    constructor(item, cartService) {
        this.item = item;
        this.cartService = cartService;
    }

    render() {
        const { product, quantity } = this.item;
        const subtotal = product.precio_total * quantity;

        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item';
        itemEl.innerHTML = `
            <div class="cart-item-info">
                <h4 class="cart-item-name">${product.producto}</h4>
                <div class="cart-item-price">${formatPrice(product.precio_total)} c/u</div>
            </div>
            <div class="cart-item-controls">
                <div class="cart-item-quantity">
                    <button class="quantity-btn quantity-decrease" data-id="${product.id}">−</button>
                    <span class="quantity-value">${quantity}</span>
                    <button class="quantity-btn quantity-increase" data-id="${product.id}">+</button>
                </div>
                <div class="cart-item-subtotal">${formatPrice(subtotal)}</div>
                <button class="cart-item-remove" data-id="${product.id}" title="Eliminar">🗑️</button>
            </div>
        `;

        this.attachEvents(itemEl);
        return itemEl;
    }

    attachEvents(element) {
        const { product, quantity } = this.item;

        // Decrease quantity
        const decreaseBtn = element.querySelector('.quantity-decrease');
        decreaseBtn?.addEventListener('click', () => {
            this.cartService.updateQuantity(product.id, quantity - 1);
        });

        // Increase quantity
        const increaseBtn = element.querySelector('.quantity-increase');
        increaseBtn?.addEventListener('click', () => {
            this.cartService.updateQuantity(product.id, quantity + 1);
        });

        // Remove item
        const removeBtn = element.querySelector('.cart-item-remove');
        removeBtn?.addEventListener('click', () => {
            this.cartService.removeProduct(product.id);
        });
    }
}
