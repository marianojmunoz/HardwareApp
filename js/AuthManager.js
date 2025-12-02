/**
 * AuthManager Class
 * Manages admin authentication state and credential validation
 */
export class AuthManager {
    constructor() {
        this.storageKey = 'adminAuthToken';
        this.sessionKey = 'adminSession';
        this.userKey = 'currentUser';

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
     * @param {string} email - User's email for cart isolation
     * @returns {boolean} true if login successful, false otherwise
     */
    login(username, password, email = null) {
        if (username === this.credentials.username && password === this.credentials.password) {
            // Generate a simple token (in production, this would come from backend)
            const token = this.generateToken();

            // Create user object with email
            const user = {
                username: username,
                email: email || `${username}@admin.local`
            };

            // Store in sessionStorage (cleared when browser closes)
            sessionStorage.setItem(this.sessionKey, token);
            sessionStorage.setItem(this.userKey, JSON.stringify(user));

            return true;
        }

        return false;
    }

    /**
     * Log out the current admin user
     */
    logout() {
        sessionStorage.removeItem(this.sessionKey);
        sessionStorage.removeItem(this.userKey);
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
     * Get the current user object
     * @returns {Object|null} User object with username and email, or null if not authenticated
     */
    getCurrentUser() {
        if (!this.isAuthenticated()) {
            return null;
        }

        const userJson = sessionStorage.getItem(this.userKey);
        if (userJson) {
            try {
                return JSON.parse(userJson);
            } catch (error) {
                console.error('Error parsing user data:', error);
                return null;
            }
        }
        return null;
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
        const user = this.getCurrentUser();
        return user ? user.username : null;
    }
}
