export class UploadSummaryModal {
    constructor() {
        this.modal = null;
        this.createModal();
        this.setupEventListeners();
    }

    createModal() {
        const modalHTML = `
      <div class="modal-backdrop" id="uploadSummaryBackdrop" style="display: none;">
        <div class="modal-content summary-modal">
          <button class="modal-close" id="summaryCloseBtn">&times;</button>
          
          <div class="modal-section">
            <h2 class="modal-title">✅ Carga Exitosa</h2>
            <p class="modal-subtitle">Resumen de productos cargados</p>
            
            <div id="summaryContent" class="summary-content"></div>
            
            <div class="modal-footer">
              <button type="button" class="btn btn-primary" id="summaryOkBtn">
                Aceptar
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer.firstElementChild);

        this.modal = document.getElementById('uploadSummaryBackdrop');
    }

    setupEventListeners() {
        const closeBtn = document.getElementById('summaryCloseBtn');
        const okBtn = document.getElementById('summaryOkBtn');

        closeBtn.addEventListener('click', () => this.hide());
        okBtn.addEventListener('click', () => this.hide());

        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hide();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });
    }

    show(summary) {
        if (!summary) return;

        const content = this.generateSummaryHTML(summary);
        document.getElementById('summaryContent').innerHTML = content;

        this.modal.style.display = 'flex';
        this.isVisible = true;
        document.body.style.overflow = 'hidden';
    }

    hide() {
        this.modal.style.display = 'none';
        this.isVisible = false;
        document.body.style.overflow = '';
    }

    generateSummaryHTML(summary) {
        const formatPrice = (price) => `$${parseFloat(price).toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;

        return `
            <div class="summary-stats">
                <div class="stat-card">
                    <div class="stat-icon">📦</div>
                    <div class="stat-info">
                        <div class="stat-value">${summary.total}</div>
                        <div class="stat-label">Productos Cargados</div>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">💰</div>
                    <div class="stat-info">
                        <div class="stat-value">${formatPrice(summary.priceStats.total.avg)}</div>
                        <div class="stat-label">Precio Promedio</div>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">📊</div>
                    <div class="stat-info">
                        <div class="stat-value">${formatPrice(summary.priceStats.total.max)}</div>
                        <div class="stat-label">Precio Máximo</div>
                    </div>
                </div>
            </div>

            <div class="summary-section">
                <h3>💰 Precios Total</h3>
                <div class="price-stats">
                    <span><strong>Mínimo:</strong> ${formatPrice(summary.priceStats.total.min)}</span>
                    <span><strong>Máximo:</strong> ${formatPrice(summary.priceStats.total.max)}</span>
                    <span><strong>Promedio:</strong> ${formatPrice(summary.priceStats.total.avg)}</span>
                </div>
            </div>

            <div class="summary-section">
                <h3>📋 Muestra de Productos (primeros 5)</h3>
                <div class="product-list">
                    ${summary.sampleProducts.map(p => `
                        <div class="product-preview">
                            <div class="product-name">${p.producto}</div>
                            <div class="product-prices">
                                <span class="price-total">Precio: ${formatPrice(p.precio_total)}</span>
                            </div>
                        </div>
                    `).join('')}
                    ${summary.total > 5 ? `
                        <div class="more-products">
                            ... y ${summary.total - 5} productos más
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
}
