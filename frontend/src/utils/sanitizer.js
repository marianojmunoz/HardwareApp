/**
 * HTML Sanitization Utility
 * Prevents XSS attacks by sanitizing user-generated content
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML string to prevent XSS
 * @param {string} dirty - Potentially unsafe HTML
 * @returns {string} - Safe HTML
 */
export function sanitizeHtml(dirty) {
    if (!dirty || typeof dirty !== 'string') {
        return '';
    }

    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br'],
        ALLOWED_ATTR: []
    });
}

/**
 * Sanitize plain text (removes all HTML tags)
 * @param {string} text - Potentially unsafe text
 * @returns {string} - Safe plain text
 */
export function sanitizeText(text) {
    if (!text || typeof text !== 'string') {
        return '';
    }

    return DOMPurify.sanitize(text, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: []
    });
}

/**
 * Escape HTML special characters
 * Useful for displaying user input as plain text
 * @param {string} str - String to escape
 * @returns {string} - Escaped string
 */
export function escapeHtml(str) {
    if (!str || typeof str !== 'string') {
        return '';
    }

    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Create safe text node (recommended over innerHTML)
 * @param {string} text - Text content
 * @returns {Text} - Text node
 */
export function createSafeTextNode(text) {
    return document.createTextNode(text || '');
}

/**
 * Safely set element text content
 * @param {HTMLElement} element - Target element
 * @param {string} text - Text to set
 */
export function setSafeText(element, text) {
    if (!element) return;
    element.textContent = text || '';
}

/**
 * Safely set element HTML (sanitized)
 * Use this instead of innerHTML when you need HTML
 * @param {HTMLElement} element - Target element
 * @param {string} html - HTML to set
 */
export function setSafeHtml(element, html) {
    if (!element) return;
    element.innerHTML = sanitizeHtml(html);
}
