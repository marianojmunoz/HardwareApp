/**
 * LoginModal Class
 * Manages the login modal UI and file upload interface
 */
export class LoginModal {
    constructor(authManager, fileUploader, cartManager) {
        this.authManager = authManager;
        this.fileUploader = fileUploader;
        this.cartManager = cartManager; // Add cartManager to constructor
        this.modal = null;
        this.isVisible = false;

        this.createModal();
        this.setupEventListeners();
    }

    /**
     * Create the modal HTML structure
     */
    createModal() {
        const modalHTML = `
      <div class="modal-backdrop" id="loginModalBackdrop">
        <div class="modal-content">
          <button class="modal-close" id="modalCloseBtn">&times;</button>
          
          <!-- Login Form -->
          <div class="modal-section" id="loginSection">
            <h2 class="modal-title">🔐 Acceso de Administrador</h2>
            <p class="modal-subtitle">Ingresa tus credenciales para gestionar productos</p>
            
            <form id="loginForm" class="login-form">
              <div class="form-group">
                <label for="username">Usuario</label>
                <input 
                  type="text" 
                  id="username" 
                  name="username" 
                  class="form-input" 
                  placeholder="Ingresa tu usuario"
                  required
                  autocomplete="username"
                />
              </div>
              
              <div class="form-group">
                <label for="password">Contraseña</label>
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  class="form-input" 
                  placeholder="Ingresa tu contraseña"
                  required
                  autocomplete="current-password"
                />
              </div>
              
              <div class="error-message" id="loginError"></div>
              
              <button type="submit" class="btn btn-primary btn-block">
                Iniciar Sesión
              </button>
            </form>
          </div>
          
          <!-- Upload Form -->
          <div class="modal-section" id="uploadSection" style="display: none;">
            <h2 class="modal-title">📁 Cargar Productos</h2>
            <p class="modal-subtitle">Sube tu archivo Excel con los productos</p>
            
            <div class="upload-zone" id="modalUploadZone">
              <div class="upload-icon">📄</div>
              <h3 class="upload-text">Arrastra tu archivo Excel aquí</h3>
              <p class="upload-hint">o haz clic en el botón para seleccionar</p>
              <input type="file" id="modalFileInput" accept=".xlsx,.xls" style="display: none;" />
              <button type="button" class="btn btn-primary" id="modalSelectFileBtn">
                Seleccionar Archivo
              </button>
            </div>
            
            <div class="error-message" id="uploadError"></div>
            
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" id="logoutBtn">
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

        // Add modal to body
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer.firstElementChild);

        this.modal = document.getElementById('loginModalBackdrop');
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Close button
        const closeBtn = document.getElementById('modalCloseBtn');
        closeBtn.addEventListener('click', () => this.hide());

        // Click outside to close
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hide();
            }
        });

        // Login form
        const loginForm = document.getElementById('loginForm');
        loginForm.addEventListener('submit', (e) => this.handleLoginSubmit(e));

        // File upload
        const selectFileBtn = document.getElementById('modalSelectFileBtn');
        const fileInput = document.getElementById('modalFileInput');

        selectFileBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

        // Drag and drop
        const uploadZone = document.getElementById('modalUploadZone');
        uploadZone.addEventListener('dragover', (e) => this.handleDragOver(e));
        uploadZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        uploadZone.addEventListener('drop', (e) => this.handleDrop(e));

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        logoutBtn.addEventListener('click', () => this.handleLogout());

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });
    }

    /**
     * Handle login form submission
     * @param {Event} event 
     */
    handleLoginSubmit(event) {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const success = this.authManager.login(username, password);

        if (success) {
            this.clearError('loginError');
            this.showUploadForm();
            this.cartManager.handleLogin(); // Notify CartManager on successful login
        } else {
            this.displayError('loginError', 'Usuario o contraseña incorrectos');
        }
    }

    /**
     * Handle file selection
     * @param {Event} event 
     */
    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    /**
     * Handle drag over
     * @param {Event} event 
     */
    handleDragOver(event) {
        event.preventDefault();
        event.currentTarget.classList.add('drag-over');
    }

    /**
     * Handle drag leave
     * @param {Event} event 
     */
    handleDragLeave(event) {
        event.preventDefault();
        event.currentTarget.classList.remove('drag-over');
    }

    /**
     * Handle file drop
     * @param {Event} event 
     */
    handleDrop(event) {
        event.preventDefault();
        event.currentTarget.classList.remove('drag-over');

        const files = event.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    /**
     * Process uploaded file
     * @param {File} file 
     */
    async processFile(file) {
        this.clearError('uploadError');

        try {
            await this.fileUploader.processFile(file);
            // File processing success is handled by callback in main app
        } catch (error) {
            this.displayError('uploadError', 'Error al procesar el archivo');
        }
    }

    /**
     * Handle logout
     */
    handleLogout() {
        this.authManager.logout();
        this.showLoginForm();
        this.cartManager.handleLogin(); // Notify CartManager on logout
    }

    /**
     * Show the modal
     */
    show() {
        this.modal.style.display = 'flex';
        this.isVisible = true;

        // Check if already authenticated
        if (this.authManager.isAuthenticated()) {
            this.showUploadForm();
        } else {
            this.showLoginForm();
        }

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    /**
     * Hide the modal
     */
    hide() {
        this.modal.style.display = 'none';
        this.isVisible = false;

        // Reset forms
        document.getElementById('loginForm').reset();
        document.getElementById('modalFileInput').value = '';
        this.clearError('loginError');
        this.clearError('uploadError');

        // Restore body scroll
        document.body.style.overflow = '';
    }

    /**
     * Show login form
     */
    showLoginForm() {
        document.getElementById('loginSection').style.display = 'block';
        document.getElementById('uploadSection').style.display = 'none';
        this.clearError('loginError');
    }

    /**
     * Show upload form
     */
    showUploadForm() {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('uploadSection').style.display = 'block';
        this.clearError('uploadError');
    }

    /**
     * Display error message
     * @param {string} elementId 
     * @param {string} message 
     */
    displayError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    /**
     * Clear error message
     * @param {string} elementId 
     */
    clearError(elementId) {
        const errorElement = document.getElementById(elementId);
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }

    /**
     * Close modal after successful upload
     */
    closeAfterUpload() {
        setTimeout(() => {
            this.hide();
        }, 500);
    }
}
