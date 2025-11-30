export class LoginModal {
  constructor() {
    this.modal = null;
    this.onLoginCallback = null;
    this.onUploadCallback = null;
    this.createModal();
    this.setupEventListeners();
  }

  createModal() {
    const modalHTML = `
      <div class="modal-overlay" id="loginModalBackdrop">
        <div class="modal-content">
          <div class="modal-brand" style="text-align: center; margin-bottom: 1rem;">
            <h3 style="font-family: 'Outfit', sans-serif; color: var(--primary); margin: 0;">TechHardware</h3>
          </div>
          <button class="btn-close" id="modalCloseBtn">&times;</button>
          
          <!-- Login Form -->
          <div class="modal-section" id="loginSection">
            <h2 class="modal-title">🔐 Acceso de Administrador</h2>
            <p class="modal-subtitle">Ingresa tus credenciales para gestionar productos</p>
            
            <form id="loginForm" class="login-form">
              <div class="form-group">
                <label for="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  class="form-input" 
                  placeholder="admin@example.com"
                  required
                  autocomplete="email"
                />
              </div>
              
              <div class="form-group">
                <label for="password">Contraseña</label>
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  class="form-input" 
                  placeholder="••••••••"
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

    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer.firstElementChild);

    this.modal = document.getElementById('loginModalBackdrop');
  }

  setupEventListeners() {
    const closeBtn = document.getElementById('modalCloseBtn');
    closeBtn.addEventListener('click', () => this.hide());

    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.hide();
      }
    });

    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', (e) => this.handleLoginSubmit(e));

    const selectFileBtn = document.getElementById('modalSelectFileBtn');
    const fileInput = document.getElementById('modalFileInput');

    selectFileBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

    const uploadZone = document.getElementById('modalUploadZone');
    uploadZone.addEventListener('dragover', (e) => this.handleDragOver(e));
    uploadZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
    uploadZone.addEventListener('drop', (e) => this.handleDrop(e));

    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', () => this.handleLogout());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    });
  }

  handleLoginSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (this.onLoginCallback) {
      this.onLoginCallback(email, password);
    }
  }

  handleFileSelect(e) {
    const file = e.target.files[0];
    if (file && this.onUploadCallback) {
      this.onUploadCallback(file);
    }
  }

  handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  }

  handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
  }

  handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');

    const files = e.dataTransfer.files;
    if (files.length > 0 && this.onUploadCallback) {
      this.onUploadCallback(files[0]);
    }
  }

  handleLogout() {
    if (this.onLogoutCallback) {
      this.onLogoutCallback();
    }
  }

  show() {
    this.modal.classList.add('active');
    this.isVisible = true;
    document.body.style.overflow = 'hidden';
  }

  hide() {
    this.modal.classList.remove('active');
    this.isVisible = false;
    document.getElementById('loginForm').reset();
    document.getElementById('modalFileInput').value = '';
    this.clearError('loginError');
    this.clearError('uploadError');
    document.body.style.overflow = '';
  }

  showLoginForm() {
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('uploadSection').style.display = 'none';
    this.clearError('loginError');
  }

  showUploadForm() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('uploadSection').style.display = 'block';
    this.clearError('uploadError');
  }

  showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }

  clearError(elementId) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = '';
    errorElement.style.display = 'none';
  }

  onLogin(callback) {
    this.onLoginCallback = callback;
  }

  onUpload(callback) {
    this.onUploadCallback = callback;
  }

  onLogout(callback) {
    this.onLogoutCallback = callback;
  }

  closeAfterUpload() {
    setTimeout(() => {
      this.hide();
    }, 500);
  }
}
