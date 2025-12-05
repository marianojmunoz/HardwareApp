export class ScrapingProgressModal {
    constructor() {
        this.modal = null;
        this.isVisible = false;
        this.createModal();
    }

    createModal() {
        const modalHTML = `
            <div id="scrapingProgressModal" class="modal" style="display: none;">
                <div class="modal-content scraping-modal">
                    <div class="modal-header">
                        <h2>🔍 Buscando Imágenes de Productos</h2>
                    </div>
                    <div class="modal-body">
                        <div class="progress-info">
                            <p class="progress-status" id="scrapingStatus">Iniciando búsqueda...</p>
                            <div class="progress-bar-container">
                                <div class="progress-bar" id="scrapingProgressBar">
                                    <div class="progress-fill" id="scrapingProgressFill" style="width: 0%"></div>
                                </div>
                                <span class="progress-percentage" id="scrapingPercentage">0%</span>
                            </div>
                            <div class="progress-details">
                                <p id="scrapingCount">0 / 0 productos procesados</p>
                                <p class="last-product" id="scrapingLastProduct"></p>
                            </div>
                            <div class="scraping-stats">
                                <div class="stat-item">
                                    <span class="stat-icon">✅</span>
                                    <span id="foundCount">0</span> encontradas
                                </div>
                                <div class="stat-item">
                                    <span class="stat-icon">❌</span>
                                    <span id="notFoundCount">0</span> no encontradas
                                </div>
                                <div class="stat-item">
                                    <span class="stat-icon">⏭️</span>
                                    <span id="skippedCount">0</span> omitidas
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Insert modal into DOM
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = modalHTML;
        this.modal = tempDiv.firstElementChild;
        document.body.appendChild(this.modal);

        // Add styles
        this.addStyles();
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #scrapingProgressModal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                z-index: 10000;
                justify-content: center;
                align-items: center;
            }

            #scrapingProgressModal.active {
                display: flex !important;
            }

            .scraping-modal {
                max-width: 500px;
                padding: 30px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            }

            .progress-info {
                text-align: center;
            }

            .progress-status {
                font-size: 16px;
                font-weight: 500;
                margin-bottom: 20px;
                color: #333;
            }

            .progress-bar-container {
                display: flex;
                align-items: center;
                gap: 15px;
                margin-bottom: 20px;
            }

            .progress-bar {
                flex: 1;
                height: 30px;
                background: #f0f0f0;
                border-radius: 15px;
                overflow: hidden;
                position: relative;
            }

            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #4CAF50, #45a049);
                border-radius: 15px;
                transition: width 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .progress-percentage {
                font-weight: bold;
                font-size: 18px;
                color: #333;
                min-width: 50px;
            }

            .progress-details {
                margin-top: 15px;
            }

            .progress-details p {
                margin: 5px 0;
                color: #666;
            }

            .last-product {
                font-style: italic;
                color: #888;
                font-size: 14px;
                min-height: 20px;
            }

            .scraping-stats {
                display: flex;
                justify-content: space-around;
                margin-top: 25px;
                padding-top: 20px;
                border-top: 1px solid #e0e0e0;
            }

            .stat-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 5px;
            }

            .stat-icon {
                font-size: 24px;
            }

            .stat-item span:last-child {
                font-size: 14px;
                color: #666;
            }
        `;
        document.head.appendChild(style);
    }

    show() {
        this.modal.classList.add('active');
        this.modal.style.display = 'flex';
        this.isVisible = true;
        this.reset();
    }

    hide() {
        this.modal.classList.remove('active');
        this.modal.style.display = 'none';
        this.isVisible = false;
    }

    reset() {
        this.updateProgress({
            current: 0,
            total: 0,
            percentage: 0,
            lastProduct: '',
            lastStatus: '',
            found: 0,
            notFound: 0,
            skipped: 0
        });
    }

    updateProgress(data) {
        const {
            current,
            total,
            percentage,
            lastProduct,
            lastStatus,
        } = data;

        // Update status text
        const statusEl = document.getElementById('scrapingStatus');
        if (current === 0) {
            statusEl.textContent = 'Iniciando carga de productos...';
        } else if (current === total && total > 0) {
            statusEl.textContent = '✅ ¡Carga completada!';
        } else {
            statusEl.textContent = `Procesando productos (${current}/${total})...`;
        }

        // Update progress bar
        const fillEl = document.getElementById('scrapingProgressFill');
        fillEl.style.width = `${percentage}%`;

        // Update percentage
        const percentageEl = document.getElementById('scrapingPercentage');
        percentageEl.textContent = `${percentage}%`;

        // Update count
        const countEl = document.getElementById('scrapingCount');
        countEl.textContent = `${current} / ${total} productos procesados`;

        // Update last product
        const lastProductEl = document.getElementById('scrapingLastProduct');
        if (lastProduct) {
            const statusIcon = lastStatus === 'found' ? '✅' : lastStatus === 'not_found' ? '❌' : '⏭️';
            lastProductEl.textContent = `${statusIcon} ${lastProduct}`;
        }

        // Update stats (if provided)
        if (data.found !== undefined) {
            document.getElementById('foundCount').textContent = data.found;
        }
        if (data.notFound !== undefined) {
            document.getElementById('notFoundCount').textContent = data.notFound;
        }
        if (data.skipped !== undefined) {
            document.getElementById('skippedCount').textContent = data.skipped;
        }
    }
}
