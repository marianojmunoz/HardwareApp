export class LoginModal {
  constructor(authManager, fileUploader) {
    this.authManager = authManager;
    this.fileUploader = fileUploader;
    this.modal = null;
    this.onLoginCallback = null;
    this.onUploadCallback = null;
    this.onLogoutCallback = null;
    this.isVisible = false;
    this.createModal();
    this.setupEventListeners();
  }

  createModal() {
    const modalHTML = `
      <div class="modal-overlay" id="loginModalBackdrop">
        <div class="modal-content">
          <button class="btn-close" id="modalCloseBtn">&times;</button>
          
          <div class="modal-brand">
            <h3>TechHardware</h3>
          </div>

          <!-- Login Form -->
          <div class="modal-section" id="loginSection">
            <h2 class="modal-title">Welcome Back</h2>
            <p class="modal-subtitle">Welcome back! Please enter your details.</p>
            
            <form id="loginForm" class="login-form">
              <div class="form-group">
                <label for="email" class="form-label">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  class="form-input" 
                  placeholder="Enter your email"
                  required
                  autocomplete="email"
                />
              </div>
              
              <div class="form-group">
                <label for="password" class="form-label">Password</label>
                <div class="password-wrapper">
                  <input 
                    type="password" 
                    id="password" 
                    name="password" 
                    class="form-input" 
                    placeholder="••••••••"
                    required
                    autocomplete="current-password"
                  />
                  <button type="button" class="password-toggle" id="togglePassword" aria-label="Toggle password visibility">
                    <svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                </div>
              </div>
              
              <div class="form-options">
                <label class="checkbox-group">
                  <input type="checkbox" id="rememberMe">
                  <span>Remember for 30 days</span>
                </label>
                <a href="#" class="forgot-password" id="forgotPasswordLink">Forgot password?</a>
              </div>

              <div class="error-message" id="loginError"></div>
              
              <button type="submit" class="btn-block btn-primary">
                Sign In
              </button>

              <div class="divider">
                <span>or</span>
              </div>

              <div class="social-buttons">
                <button type="button" class="btn-block btn-google" id="googleSignInBtn">
                  <svg class="google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Sign in with Google
                </button>
                
                <button type="button" class="btn-block btn-secondary-outline" id="showSignUpBtn">
                  Create User
                </button>
              </div>
            </form>
          </div>

          <!-- Sign Up Form -->
          <div class="modal-section" id="signUpSection" style="display: none;">
            <h2 class="modal-title">Create Account</h2>
            <p class="modal-subtitle">Sign up to get started.</p>
            
            <form id="signUpForm" class="login-form">
              <div class="form-group">
                <label for="signupEmail" class="form-label">Email</label>
                <input 
                  type="email" 
                  id="signupEmail" 
                  class="form-input" 
                  placeholder="Enter your email"
                  required
                  autocomplete="email"
                />
              </div>
              
              <div class="form-group">
                <label for="signupPhone" class="form-label">Phone (WhatsApp)</label>
                <input 
                  type="tel" 
                  id="signupPhone" 
                  class="form-input" 
                  placeholder="54 343 4123456"
                  required
                  pattern="[0-9]{2}\s?[0-9]{3}\s?[0-9]{7}"
                  title="Enter phone in WhatsApp format: 54 343 4123456 (country code + area code + number)"
                />
              </div>
              
              <div class="form-group">
                <label for="signupPassword" class="form-label">Password</label>
                <div class="password-wrapper">
                  <input 
                    type="password" 
                    id="signupPassword" 
                    class="form-input" 
                    placeholder="Create a password"
                    required
                    autocomplete="new-password"
                  />
                  <button type="button" class="password-toggle" id="toggleSignupPassword" aria-label="Toggle password visibility">
                    <svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                </div>
              </div>

              <div class="error-message" id="signupError"></div>
              <div class="success-message" id="signupSuccess" style="display:none; color: green; text-align: center; margin-bottom: 1rem;">
                Account created! Please check your email to confirm.
              </div>
              
              <button type="submit" class="btn-block btn-primary">
                Sign Up
              </button>

              <div class="divider">
                <span>or</span>
              </div>

              <button type="button" class="btn-block btn-google" id="backToLoginFromSignupBtn" style="justify-content: center;">
                Back to Login
              </button>
            </form>
          </div>

          <!-- Password Recovery Form (Hidden by default) -->
          <div class="modal-section" id="recoverySection" style="display: none;">
             <h2 class="modal-title">Reset Password</h2>
             <p class="modal-subtitle">Enter your email to receive a reset link.</p>
             
             <form id="recoveryForm">
               <div class="form-group">
                 <label for="recoveryEmail" class="form-label">Email</label>
                 <input 
                   type="email" 
                   id="recoveryEmail" 
                   class="form-input" 
                   placeholder="Enter your email"
                   required
                 />
               </div>
               
               <div class="error-message" id="recoveryError"></div>
               <div class="success-message" id="recoverySuccess" style="display:none; color: green; text-align: center; margin-bottom: 1rem;">
                 Link sent! Check your email.
               </div>

               <button type="submit" class="btn-block btn-primary">
                 Send Reset Link
               </button>
               
               <button type="button" class="btn-block btn-google" id="backToLoginBtn" style="margin-top: 1rem; justify-content: center;">
                 Back to Login
               </button>
             </form>
          </div>
          
          <!-- Upload Form (Admin Only) -->
          <div class="modal-section" id="uploadSection" style="display: none;">
            <h2 class="modal-title">📁 Upload Products</h2>
            <p class="modal-subtitle">Upload your Excel file to update catalog</p>
            
            <div class="upload-zone" id="modalUploadZone">
              <div class="upload-icon">📄</div>
              <h3 class="upload-text">Drag & Drop Excel file</h3>
              <p class="upload-hint">or click to browse</p>
              <input type="file" id="modalFileInput" accept=".xlsx,.xls" style="display: none;" />
              <button type="button" class="btn-primary" id="modalSelectFileBtn" style="margin-top: 1rem; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer;">
                Select File
              </button>
            </div>
            
            <div class="error-message" id="uploadError"></div>
            
            <div class="modal-footer" style="margin-top: 2rem;">
              <button type="button" class="btn-block btn-google" id="logoutBtn" style="justify-content: center;">
                Sign Out
              </button>
            </div>
          </div>

          <!-- User Profile (Regular Users) -->
          <div class="modal-section" id="userProfileSection" style="display: none;">
            <h2 class="modal-title">User Profile</h2>
            <p class="modal-subtitle" id="userProfileEmail">Logged in</p>
            
            <div class="modal-footer" style="margin-top: 2rem;">
              <button type="button" class="btn-block btn-google" id="userLogoutBtn" style="justify-content: center;">
                Sign Out
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
    // Close Modal
    const closeBtn = document.getElementById('modalCloseBtn');
    if (closeBtn) closeBtn.addEventListener('click', () => this.hide());

    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.hide();
        }
      });
    }

    // Login Form Submit
    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.addEventListener('submit', (e) => this.handleLoginSubmit(e));

    // Password Toggle
    const togglePasswordBtn = document.getElementById('togglePassword');
    if (togglePasswordBtn) {
      togglePasswordBtn.addEventListener('click', () => this.togglePasswordVisibility('password', 'togglePassword'));
    }

    const toggleSignupPasswordBtn = document.getElementById('toggleSignupPassword');
    if (toggleSignupPasswordBtn) {
      toggleSignupPasswordBtn.addEventListener('click', () => this.togglePasswordVisibility('signupPassword', 'toggleSignupPassword'));
    }

    // Google Sign In
    const googleBtn = document.getElementById('googleSignInBtn');
    if (googleBtn) {
      googleBtn.addEventListener('click', () => this.handleGoogleSignIn());
    }

    // Sign Up Navigation
    const showSignUpBtn = document.getElementById('showSignUpBtn');
    if (showSignUpBtn) {
      showSignUpBtn.addEventListener('click', () => this.showSignUpForm());
    }

    const backToLoginFromSignupBtn = document.getElementById('backToLoginFromSignupBtn');
    if (backToLoginFromSignupBtn) {
      backToLoginFromSignupBtn.addEventListener('click', () => this.showLoginForm());
    }

    // Sign Up Form Submit
    const signUpForm = document.getElementById('signUpForm');
    if (signUpForm) {
      signUpForm.addEventListener('submit', (e) => this.handleSignUpSubmit(e));
    }

    // Forgot Password
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    if (forgotPasswordLink) {
      forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.showRecoveryForm();
      });
    }

    // Recovery Form
    const recoveryForm = document.getElementById('recoveryForm');
    if (recoveryForm) {
      recoveryForm.addEventListener('submit', (e) => this.handleRecoverySubmit(e));
    }

    const backToLoginBtn = document.getElementById('backToLoginBtn');
    if (backToLoginBtn) {
      backToLoginBtn.addEventListener('click', () => this.showLoginForm());
    }

    // Upload Form Events
    const selectFileBtn = document.getElementById('modalSelectFileBtn');
    const fileInput = document.getElementById('modalFileInput');

    if (selectFileBtn) {
      selectFileBtn.addEventListener('click', () => fileInput.click());
    }

    if (fileInput) {
      fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
    }

    const uploadZone = document.getElementById('modalUploadZone');
    if (uploadZone) {
      uploadZone.addEventListener('dragover', (e) => this.handleDragOver(e));
      uploadZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
      uploadZone.addEventListener('drop', (e) => this.handleDrop(e));
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.handleLogout());
    }

    const userLogoutBtn = document.getElementById('userLogoutBtn');
    if (userLogoutBtn) {
      userLogoutBtn.addEventListener('click', () => this.handleLogout());
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    });
  }

  async handleLoginSubmit(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (this.onLoginCallback) {

      this.onLoginCallback(email, password);
    } else {

    }
  }

  togglePasswordVisibility(inputId = 'password', toggleId = 'togglePassword') {
    const passwordInput = document.getElementById(inputId);
    const toggleBtn = document.getElementById(toggleId);

    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      toggleBtn.innerHTML = `
        <svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        </svg>
      `;
    } else {
      passwordInput.type = 'password';
      toggleBtn.innerHTML = `
        <svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      `;
    }
  }

  async handleGoogleSignIn() {
    try {
      const { authApi } = await import('../../services/api/authApi.js');
      await authApi.signInWithOAuth('google');
    } catch (error) {

      this.showError('loginError', error.message);
    }
  }

  async handleSignUpSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const phone = document.getElementById('signupPhone').value;

    // Validate and normalize phone number (remove spaces)
    const normalizedPhone = phone.replace(/\s/g, '');
    const phoneRegex = /^[0-9]{12}$/; // Should be 12 digits after removing spaces

    if (!phoneRegex.test(normalizedPhone)) {
      this.showError('signupError', 'Please enter a valid phone number in WhatsApp format: 54 343 4803193');
      return;
    }

    try {
      const { authApi } = await import('../../services/api/authApi.js');
      await authApi.signUp(email, password, normalizedPhone);

      document.getElementById('signupSuccess').style.display = 'block';
      this.clearError('signupError');

      document.getElementById('signUpForm').reset();

    } catch (error) {

      this.showError('signupError', error.message);
    }
  }

  async handleRecoverySubmit(e) {
    e.preventDefault();
    const email = document.getElementById('recoveryEmail').value;

    try {
      const { authApi } = await import('../../services/api/authApi.js');
      await authApi.resetPasswordForEmail(email);

      document.getElementById('recoverySuccess').style.display = 'block';
      this.clearError('recoveryError');

    } catch (error) {

      this.showError('recoveryError', error.message);
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

    // Reset forms
    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.reset();

    const recoveryForm = document.getElementById('recoveryForm');
    if (recoveryForm) recoveryForm.reset();

    const signUpForm = document.getElementById('signUpForm');
    if (signUpForm) signUpForm.reset();

    const fileInput = document.getElementById('modalFileInput');
    if (fileInput) fileInput.value = '';

    this.clearError('loginError');
    this.clearError('uploadError');
    this.clearError('recoveryError');
    this.clearError('signupError');

    const recoverySuccess = document.getElementById('recoverySuccess');
    if (recoverySuccess) recoverySuccess.style.display = 'none';

    const signupSuccess = document.getElementById('signupSuccess');
    if (signupSuccess) signupSuccess.style.display = 'none';

    document.body.style.overflow = '';

    // Reset to login view by default when closing
    this.showLoginForm();
  }

  showLoginForm() {
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('uploadSection').style.display = 'none';
    document.getElementById('recoverySection').style.display = 'none';
    document.getElementById('signUpSection').style.display = 'none';
    document.getElementById('userProfileSection').style.display = 'none';
    this.clearError('loginError');

    // Clear login form fields
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.reset();
    }
  }

  showUploadForm() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('uploadSection').style.display = 'block';
    document.getElementById('recoverySection').style.display = 'none';
    document.getElementById('signUpSection').style.display = 'none';
    document.getElementById('userProfileSection').style.display = 'none';
    this.clearError('uploadError');
  }

  showRecoveryForm() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('uploadSection').style.display = 'none';
    document.getElementById('recoverySection').style.display = 'block';
    document.getElementById('signUpSection').style.display = 'none';
    document.getElementById('userProfileSection').style.display = 'none';
    this.clearError('recoveryError');
  }

  showSignUpForm() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('uploadSection').style.display = 'none';
    document.getElementById('recoverySection').style.display = 'none';
    document.getElementById('signUpSection').style.display = 'block';
    document.getElementById('userProfileSection').style.display = 'none';
    this.clearError('signupError');
  }

  showUserProfile(email) {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('uploadSection').style.display = 'none';
    document.getElementById('recoverySection').style.display = 'none';
    document.getElementById('signUpSection').style.display = 'none';
    document.getElementById('userProfileSection').style.display = 'block';

    const emailEl = document.getElementById('userProfileEmail');
    if (emailEl) emailEl.textContent = `Logged in as ${email}`;
  }

  showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  }

  clearError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }
  }

  displayError(elementId, message) {
    this.showError(elementId, message);
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
