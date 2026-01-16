import { formatPrice } from '../utils/formatters.js';
import { authApi } from './api/authApi.js';

export class CheckoutService {
    constructor(orderService = null) {
        this.whatsappNumber = '5493434803193'; // From index.html contact info
        this.orderService = orderService; // Will be injected from main.js
    }

    async processCheckout(cartItems) {
        if (!cartItems || cartItems.length === 0) {
            throw new Error('El carrito está vacío');
        }

        try {
            let userEmail = null;
            let userPhone = null;

            // 1. Save order to database if user is authenticated and orderService is available
            if (this.orderService) {
                try {
                    const session = await authApi.getSession();
                    if (session && session.user) {
                        userEmail = session.user.email;
                        userPhone = session.user.user_metadata?.phone || null;
                        await this.orderService.createOrder(session.user.email, cartItems);
                    } else {
                        throw new Error('User not authenticated - order will not be saved to database');
                    }
                } catch (dbError) {
                    throw dbError;
                }
            }

            // 2. Notify user about WhatsApp confirmation
            const confirmed = window.confirm(
                'Tu pedido ha sido procesado correctamente.\n\n' +
                '¿Deseas abrir WhatsApp para finalizar la coordinación del pedido con el vendedor?'
            );

            if (confirmed) {
                // 3. Open WhatsApp with user email and phone
                this.openWhatsApp(cartItems, userEmail, userPhone);
            }

            return true;
        } catch (error) {
            throw new Error('Error al procesar el pedido: ' + error.message);
        }
    }

    openWhatsApp(cartItems, userEmail = null, userPhone = null) {
        const total = cartItems.reduce((sum, item) => sum + (item.product.precio_total * item.quantity), 0);
        const formattedTotal = formatPrice(total);

        // Build text summary
        let summaryText = '';
        cartItems.forEach(item => {
            const itemTotal = formatPrice(item.product.precio_total * item.quantity);
            summaryText += `• ${item.product.producto} (x${item.quantity}) - ${itemTotal}\n`;
        });

        // Build contact info lines
        let contactInfo = '';
        if (userEmail || userPhone) {
            contactInfo = '\n*Datos de contacto:*\n';
            if (userEmail) contactInfo += `Email: ${userEmail}\n`;
            if (userPhone) contactInfo += `Teléfono: ${userPhone}\n`;
        }

        const message = `Hola! \n\nTe envío mi pedido:${contactInfo}\n*Productos:*\n${summaryText}\n*Total Final: ${formattedTotal}*\n\nQuedo a la espera de la confirmación. Gracias!`;

        const encodedMessage = encodeURIComponent(message);
        const url = `https://wa.me/${this.whatsappNumber}?text=${encodedMessage}`;

        window.open(url, '_blank');
    }
}
