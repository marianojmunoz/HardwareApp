/**
 * AuthManager Class
 * Manages admin authentication state and credential validation
 */
export class AuthManager {
    constructor() {
        this.storageKey = 'adminAuthToken';
        this.sessionKey = 'adminSession';

        // IMPORTANT: In production, these should be environment variables
        // and validated against a backend API
        this.credentials = {
            username: 'admin',
            password: 'admin123'
        };
    }

    /**
     * Attempt to log in with provided credentials
     * @param {string} username 
     * @param {string} password 
     * @returns {boolean} true if login successful, false otherwise
     */
    login(username, password) {
        if (username === this.credentials.username && password === this.credentials.password) {
            // Generate a simple token (in production, this would come from backend)
            const token = this.generateToken();

            // Store in sessionStorage (cleared when browser closes)
            sessionStorage.setItem(this.sessionKey, token);

            return true;
        }

        return false;
    }

    /**
     * Log out the current admin user
     */
    logout() {
        sessionStorage.removeItem(this.sessionKey);
    }

    /**
     * Check if admin is currently authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
        const token = sessionStorage.getItem(this.sessionKey);
        return token !== null && token !== undefined;
    }

    /**
     * Get the current authentication token
     * @returns {string|null}
     */
    getAuthToken() {
        return sessionStorage.getItem(this.sessionKey);
    }

    /**
     * Generate a simple authentication token
     * In production, this would be a JWT from the backend
     * @returns {string}
     */
    generateToken() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2);
        return `${timestamp}-${random}`;
    }

    /**
     * Get admin username (for display purposes)
     * @returns {string}
     */
    getUsername() {
        if (this.isAuthenticated()) {
            return this.credentials.username;
        }
        return null;
    }
}
