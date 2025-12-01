export class ProductEditModal {
    constructor() {
        this.product = null;
        this.onSave = null;
        this.createModal();
    }

    createModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'productEditModal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h2 class="modal-title">Editar Producto</h2>
                    <button class="btn-close" id="editModalCloseBtn">✕</button>
                </div>
                <form id="editProductForm">
                    <div class="form-group">
                        <label class="form-label">Código</label>
                        <input type="text" class="form-input" id="edit_codigo" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Producto</label>
                        <input type="text" class="form-input" id="edit_producto" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Categoría</label>
                        <input type="text" class="form-input" id="edit_categoria" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Subcategoría</label>
                        <input type="text" class="form-input" id="edit_sub_categoria">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Precio Total</label>
                        <input type="number" step="0.01" class="form-input" id="edit_precio_total" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Stock</label>
                        <input type="number" class="form-input" id="edit_stock" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">URL de Imagen</label>
                        <input type="url" class="form-input" id="edit_image_url" placeholder="https://ejemplo.com/imagen.jpg">
                        <small style="color: #666; font-size: 12px; display: block; margin-top: 4px;">Opcional - URL de la imagen del producto</small>
                    </div>
                    <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                        <button type="button" class="btn-secondary" id="editCancelBtn" style="flex: 1;">Cancelar</button>
                        <button type="submit" class="btn-primary" style="flex: 1;">Modificar</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);
        this.modal = modal;

        // Event listeners
        const closeBtn = modal.querySelector('#editModalCloseBtn');
        const cancelBtn = modal.querySelector('#editCancelBtn');
        const form = modal.querySelector('#editProductForm');

        closeBtn?.addEventListener('click', () => this.hide());
        cancelBtn?.addEventListener('click', () => this.hide());

        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hide();
            }
        });
    }

    show(product) {
        this.product = product;
        this.populateForm(product);
        this.modal.classList.add('active');
    }

    hide() {
        this.modal.classList.remove('active');
        this.product = null;
    }

    populateForm(product) {
        document.getElementById('edit_codigo').value = product.codigo || '';
        document.getElementById('edit_producto').value = product.producto || '';
        document.getElementById('edit_categoria').value = product.categoria || '';
        document.getElementById('edit_sub_categoria').value = product.sub_categoria || '';
        document.getElementById('edit_precio_total').value = product.precio_total || '';
        document.getElementById('edit_stock').value = product.stock || '';
        document.getElementById('edit_image_url').value = product.image_url || '';
    }

    handleSubmit() {
        if (!this.product) return;

        const imageUrl = document.getElementById('edit_image_url').value.trim();

        const updatedProduct = {
            ...this.product,
            codigo: document.getElementById('edit_codigo').value,
            producto: document.getElementById('edit_producto').value,
            categoria: document.getElementById('edit_categoria').value,
            sub_categoria: document.getElementById('edit_sub_categoria').value,
            precio_total: parseFloat(document.getElementById('edit_precio_total').value),
            stock: parseInt(document.getElementById('edit_stock').value),
            image_url: imageUrl || null
        };

        if (this.onSave) {
            this.onSave(updatedProduct);
        }

        this.hide();
    }

    setOnSave(callback) {
        this.onSave = callback;
    }
}
