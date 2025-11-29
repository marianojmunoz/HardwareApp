import { formatPrice, formatGarantia } from '../../utils/formatters.js';

export class ProductCard {
  constructor(product, isAdmin = false) {
    this.product = product;
    this.isAdmin = isAdmin;
    this.onEdit = null;
    this.onDelete = null;
    this.onAddToCart = null;
  }

  render() {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = this.getTemplate();

    if (this.isAdmin) {
      this.attachAdminEvents(card);
    }

    this.attachCartEvents(card);

    return card;
  }

  getTemplate() {
    const hasImage = this.product.hasImage();
    const categoryLabel = this.product.categoria || 'Hardware';

    return `
        ${this.isAdmin ? `
            <div class="admin-actions">
                <button class="btn-icon-sm edit-btn" data-action="edit" title="Editar">✏️</button>
                <button class="btn-icon-sm delete-btn" data-action="delete" title="Eliminar">🗑️</button>
            </div>
        ` : ''}

        ${hasImage ? `
            <div class="product-image">
                <img src="${this.product.image_url}" alt="${this.product.producto}" />
            </div>
        ` : `
            <div class="product-image-placeholder">
                <span>🖥️</span>
            </div>
        `}
        
        <div class="product-content">
            <span class="product-category-label">${categoryLabel}</span>
            <h3 class="product-name" title="${this.product.producto}">${this.product.producto}</h3>
            
            <div class="product-footer">
                <div class="product-price-total">
                    ${formatPrice(this.product.precio_total)}
                </div>
                <div class="product-cart-controls">
                    <input type="number" class="product-quantity-input" value="1" min="1" max="999" />
                    <button class="btn-add-cart" data-action="add-to-cart">Agregar</button>
                </div>
            </div>
        </div>
    `;
  }

  attachAdminEvents(card) {
    const editBtn = card.querySelector('[data-action="edit"]');
    const deleteBtn = card.querySelector('[data-action="delete"]');

    if (editBtn && this.onEdit) {
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.onEdit(this.product);
      });
    }

    if (deleteBtn && this.onDelete) {
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.onDelete(this.product);
      });
    }
  }

  attachCartEvents(card) {
    const addToCartBtn = card.querySelector('[data-action="add-to-cart"]');
    const quantityInput = card.querySelector('.product-quantity-input');

    if (addToCartBtn && this.onAddToCart) {
      addToCartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const quantity = parseInt(quantityInput?.value || 1);
        this.onAddToCart(this.product, quantity);

        // Visual feedback
        const originalText = addToCartBtn.textContent;
        addToCartBtn.textContent = '¡Agregado!';
        addToCartBtn.classList.add('btn-success');

        setTimeout(() => {
          addToCartBtn.textContent = originalText;
          addToCartBtn.classList.remove('btn-success');
        }, 2000);

        // Reset quantity to 1 after adding
        if (quantityInput) {
          quantityInput.value = 1;
        }
      });
    }
  }

  setEditCallback(callback) {
    this.onEdit = callback;
  }

  setDeleteCallback(callback) {
    this.onDelete = callback;
  }

  setAddToCartCallback(callback) {
    this.onAddToCart = callback;
  }
}
