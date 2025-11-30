export class AdminButton {
    constructor(buttonId) {
        this.button = document.getElementById(buttonId);
        if (!this.button) {
            throw new Error(`Button with id "${buttonId}" not found`);
        }
        this.clickCallback = null;
    }

    setupEventListeners() {
        this.button.addEventListener('click', () => {
            if (this.clickCallback) {
                this.clickCallback();
            }
        });
    }

    onClick(callback) {
        this.clickCallback = callback;
    }

    showLoggedIn(email) {
        this.button.innerHTML = `
      <span class="admin-icon">👤</span>
      <span>${email.split('@')[0]}</span>
    `;
        this.button.classList.add('logged-in');
    }

    showLoggedOut() {
        this.button.innerHTML = `
      <span class="admin-icon">🔐</span>
      <span>Login</span>
    `;
        this.button.classList.remove('logged-in');
    }

    show() {
        this.button.style.display = 'flex';
    }

    hide() {
        this.button.style.display = 'none';
    }
}
