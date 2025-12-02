import { ordersApi } from './api/ordersApi.js';

export class OrderService {
    constructor() {
        // Service initialized
    }

    /**
     * Create a new order from cart items
     * @param {string} userEmail - Email of the user placing the order
     * @param {Array} cartItems - Array of cart items with product and quantity
     * @returns {Promise<Object>} Created order with items
     */
    async createOrder(userEmail, cartItems) {
        if (!userEmail) {
            throw new Error('Se requiere un email de usuario para crear el pedido');
        }

        if (!cartItems || cartItems.length === 0) {
            throw new Error('El carrito está vacío');
        }

        // Calculate total
        const totalAmount = cartItems.reduce((sum, item) => {
            return sum + (parseFloat(item.product.precio_total) * item.quantity);
        }, 0);

        // Call API to create order
        const result = await ordersApi.createOrder({
            userEmail,
            items: cartItems,
            totalAmount
        });

        console.log('Order created successfully:', result.order.id);
        return result;
    }

    /**
     * Get all orders (admin only)
     * @returns {Promise<Array>} Array of all orders
     */
    async getAllOrders() {
        return await ordersApi.getAllOrders();
    }

    /**
     * Update order status (admin only)
     * @param {string} orderId - ID of the order to update
     * @param {string} newStatus - New status: 'pending', 'accepted', or 'rejected'
     * @returns {Promise<Object>} Updated order
     */
    async updateOrderStatus(orderId, newStatus) {
        if (!orderId) {
            throw new Error('ID de pedido requerido');
        }

        return await ordersApi.updateOrderStatus(orderId, newStatus);
    }

    /**
     * Get orders by user email
     * @param {string} userEmail - Email of the user
     * @returns {Promise<Array>} Array of orders for this user
     */
    async getOrdersByEmail(userEmail) {
        if (!userEmail) {
            throw new Error('Email de usuario requerido');
        }

        return await ordersApi.getOrdersByEmail(userEmail);
    }

    /**
     * Get count of pending orders
     * @returns {Promise<number>} Count of pending orders
     */
    async getPendingCount() {
        return await ordersApi.getPendingOrdersCount();
    }
}
