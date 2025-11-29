export class ConfirmModal {
    constructor() {
        this.onConfirm = null;
        this.onCancel = null;
        this.createModal();
    }

    createModal() {
        const modal = document.createElement('div');
        modal.className = 'cart-modal-overlay'; // Reuse cart modal styles
        modal.id = 'confirmModal';
        modal.style.zIndex = '1002'; // Higher than edit modal
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-header">
                    <h3 class="modal-title" id="confirmModalTitle">Confirmar acción</h3>
                </div>
                <p id="confirmModalMessage" style="margin: 1rem 0; line-height: 1.6;"></p>
                <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                    <button class="btn-secondary" id="confirmModalCancelBtn" style="flex: 1;">Cancelar</button>
                    <button class="btn-primary" id="confirmModalOkBtn" style="flex: 1; background: var(--error);">Eliminar</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.modal = modal;

        // Event listeners
        const okBtn = modal.querySelector('#confirmModalOkBtn');
        const cancelBtn = modal.querySelector('#confirmModalCancelBtn');

        okBtn?.addEventListener('click', () => {
            if (this.onConfirm) {
                this.onConfirm();
            }
            this.hide();
        });

        cancelBtn?.addEventListener('click', () => {
            if (this.onCancel) {
                this.onCancel();
            }
            this.hide();
        });

        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                if (this.onCancel) {
                    this.onCancel();
                }
                this.hide();
            }
        });
    }

    show(title, message, confirmCallback, cancelCallback = null) {
        const titleEl = this.modal.querySelector('#confirmModalTitle');
        const messageEl = this.modal.querySelector('#confirmModalMessage');

        if (titleEl) titleEl.textContent = title;
        if (messageEl) messageEl.textContent = message;

        this.onConfirm = confirmCallback;
        this.onCancel = cancelCallback;

        this.modal.classList.add('active');
    }

    hide() {
        this.modal.classList.remove('active');
        this.onConfirm = null;
        this.onCancel = null;
    }
}
