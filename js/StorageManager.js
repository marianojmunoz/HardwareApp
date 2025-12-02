/**
 * StorageManager Class
 * Handles localStorage operations for product data persistence
 */
export class StorageManager {
    constructor(storageKey = 'hardwareProducts') {
        this.storageKey = storageKey;
    }

    /**
     * Save data to localStorage
     * @param {any} data - Data to save
     * @returns {boolean} true if successful, false otherwise
     */
    save(data) {
        try {
            const jsonString = JSON.stringify(data);
            localStorage.setItem(this.storageKey, jsonString);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Load data from localStorage
     * @returns {any|null} Parsed data or null if not found/error
     */
    load() {
        try {
            const jsonString = localStorage.getItem(this.storageKey);
            if (jsonString) {
                return JSON.parse(jsonString);
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Clear data from localStorage
     * @returns {boolean} true if successful
     */
    clear() {
        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Check if data exists in localStorage
     * @returns {boolean}
     */
    hasData() {
        return localStorage.getItem(this.storageKey) !== null;
    }
}
