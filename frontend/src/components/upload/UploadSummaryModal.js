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
        const { stats } = summary;

        return `
            <div class="summary-stats">
                <div class="stat-card stat-nuevos">
                    <div class="stat-icon">✅</div>
                    <div class="stat-info">
                        <div class="stat-value">${stats.nuevos}</div>
                        <div class="stat-label">Productos Nuevos</div>
                    </div>
                </div>

                <div class="stat-card stat-actualizados">
                    <div class="stat-icon">🔄</div>
                    <div class="stat-info">
                        <div class="stat-value">${stats.actualizados}</div>
                        <div class="stat-label">Precios Actualizados</div>
                    </div>
                </div>

                <div class="stat-card stat-omitidos">
                    <div class="stat-icon">⏭️</div>
                    <div class="stat-info">
                        <div class="stat-value">${stats.omitidos}</div>
                        <div class="stat-label">Omitidos</div>
                    </div>
                </div>
            </div>

            ${stats.errores.length > 0 ? `
                <div class="summary-section error-section">
                    <h3>⚠️ Errores</h3>
                    <div class="error-list">
                        ${stats.errores.slice(0, 5).map(err => `
                            <div class="error-item">
                                <strong>${err.producto}</strong>: ${err.error}
                            </div>
                        `).join('')}
                        ${stats.errores.length > 5 ? `
                            <div class="more-errors">... y ${stats.errores.length - 5} errores más</div>
                        ` : ''}
                    </div>
                </div>
            ` : ''}

            ${summary.insertedProducts && summary.insertedProducts.length > 0 ? `
                <div class="summary-section">
                    <h3>📋 Nuevos Productos Agregados (primeros 5)</h3>
                    <div class="product-list">
                        ${summary.insertedProducts.slice(0, 5).map(p => `
                            <div class="product-preview">
                                <div class="product-name">${p.producto}</div>
                                <div class="product-code">Código: ${p.codigo}</div>
                            </div>
                        `).join('')}
                        ${summary.insertedProducts.length > 5 ? `
                            <div class="more-products">
                                ... y ${summary.insertedProducts.length - 5} productos más
                            </div>
                        ` : ''}
                    </div>
                </div>
            ` : ''}
        `;
    }
}

