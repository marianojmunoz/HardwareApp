import { formatPrice, formatGarantia } from '../../utils/formatters.js';
import { escapeHtml } from '../../utils/sanitizer.js';

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

    // Sanitize user-controlled content to prevent XSS
    const safeName = escapeHtml(this.product.producto);
    const safeCategory = escapeHtml(categoryLabel);

    return `
        ${this.isAdmin ? `
            <div class="admin-actions">
                <button class="btn-icon-sm edit-btn" data-action="edit" title="Editar">✏️</button>
                <button class="btn-icon-sm delete-btn" data-action="delete" title="Eliminar">🗑️</button>
            </div>
        ` : ''}

        ${hasImage ? `
            <div class="product-image">
                <img src="${escapeHtml(this.product.image_url)}" alt="${safeName}" />
            </div>
        ` : `
            <div class="product-image-placeholder">
                <span>🖥️</span>
            </div>
        `}
        
        <div class="product-content">
            <span class="product-category-label">${safeCategory}</span>
            <h3 class="product-name" title="${safeName}">${safeName}</h3>
            
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
        const result = this.onAddToCart(this.product, quantity);

        console.log('Add to cart result:', result); // Debug log

        // Visual feedback based on result
        const originalText = addToCartBtn.textContent;

        if (result && result.success) {
          // Success - product added
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
        } else {
          // Failed - show error (not logged in)
          addToCartBtn.textContent = '⚠️ Inicia sesión';
          addToCartBtn.classList.add('btn-warning');

          setTimeout(() => {
            addToCartBtn.textContent = originalText;
            addToCartBtn.classList.remove('btn-warning');
          }, 3000);
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
