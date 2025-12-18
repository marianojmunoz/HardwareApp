/**
 * Input Validation Utilities
 * Validates data before sending to database
 */

/**
 * Validation result object
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether validation passed
 * @property {string[]} errors - Array of error messages
 */

/**
 * Validate product data
 * @param {Object} product - Product data to validate
 * @returns {ValidationResult}
 */
export function validateProduct(product) {
    const errors = [];

    // Required fields
    if (!product.codigo || typeof product.codigo !== 'string' || product.codigo.trim() === '') {
        errors.push('Código es requerido');
    }

    if (!product.producto || typeof product.producto !== 'string' || product.producto.trim() === '') {
        errors.push('Nombre del producto es requerido');
    }

    // Price validation
    if (product.precio_publico !== undefined) {
        const precio = parseFloat(product.precio_publico);
        if (isNaN(precio) || precio < 0) {
            errors.push('Precio público debe ser un número mayor o igual a 0');
        }
    }

    if (product.precio_gremio !== undefined) {
        const precio = parseFloat(product.precio_gremio);
        if (isNaN(precio) || precio < 0) {
            errors.push('Precio gremio debe ser un número mayor o igual a 0');
        }
    }

    // Stock validation
    if (product.stock !== undefined) {
        const stock = parseInt(product.stock);
        if (isNaN(stock) || stock < 0) {
            errors.push('Stock debe ser un número entero mayor o igual a 0');
        }
    }

    // Garantia validation
    if (product.garantia !== undefined) {
        const garantia = parseInt(product.garantia);
        if (isNaN(garantia) || garantia < 0) {
            errors.push('Garantía debe ser un número entero mayor o igual a 0');
        }
    }

    // Image URL validation (if provided)
    if (product.image_url && product.image_url.trim() !== '') {
        try {
            new URL(product.image_url);
        } catch (e) {
            errors.push('URL de imagen inválida');
        }
    }

    // Product name length limit
    if (product.producto && product.producto.length > 500) {
        errors.push('Nombre del producto no puede exceder 500 caracteres');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Validate order data
 * @param {Object} order - Order data to validate
 * @returns {ValidationResult}
 */
export function validateOrder(order) {
    const errors = [];

    // Email validation
    if (!order.user_email || !isValidEmail(order.user_email)) {
        errors.push('Email inválido');
    }

    // Total amount validation
    if (!order.total_amount || isNaN(parseFloat(order.total_amount)) || parseFloat(order.total_amount) <= 0) {
        errors.push('Monto total debe ser mayor a 0');
    }

    // Items validation
    if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
        errors.push('La orden debe tener al menos un producto');
    }

    // Validate each item
    if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item, index) => {
            if (!item.product_name || item.product_name.trim() === '') {
                errors.push(`Item ${index + 1}: Nombre del producto es requerido`);
            }

            const quantity = parseInt(item.quantity);
            if (isNaN(quantity) || quantity <= 0) {
                errors.push(`Item ${index + 1}: Cantidad debe ser mayor a 0`);
            }

            const price = parseFloat(item.unit_price);
            if (isNaN(price) || price <= 0) {
                errors.push(`Item ${index + 1}: Precio unitario debe ser mayor a 0`);
            }

            const subtotal = parseFloat(item.subtotal);
            if (isNaN(subtotal) || subtotal <= 0) {
                errors.push(`Item ${index + 1}: Subtotal debe ser mayor a 0`);
            }

            // Verify subtotal calculation
            if (!isNaN(quantity) && !isNaN(price) && !isNaN(subtotal)) {
                const expectedSubtotal = quantity * price;
                if (Math.abs(expectedSubtotal - subtotal) > 0.01) {
                    errors.push(`Item ${index + 1}: Subtotal incorrecto`);
                }
            }
        });
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
export function isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Sanitize and validate string input
 * @param {string} input - Input to sanitize
 * @param {number} maxLength - Maximum allowed length
 * @returns {string}
 */
export function sanitizeString(input, maxLength = 1000) {
    if (!input || typeof input !== 'string') return '';

    // Trim whitespace
    let sanitized = input.trim();

    // Truncate to max length
    if (sanitized.length > maxLength) {
        sanitized = sanitized.substring(0, maxLength);
    }

    return sanitized;
}

/**
 * Validate and parse number
 * @param {any} value - Value to parse
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {number|null}
 */
export function parseValidNumber(value, min = -Infinity, max = Infinity) {
    const num = parseFloat(value);

    if (isNaN(num)) return null;
    if (num < min || num > max) return null;

    return num;
}
