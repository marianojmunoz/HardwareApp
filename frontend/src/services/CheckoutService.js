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
            // 1. Save order to database if user is authenticated and orderService is available
            if (this.orderService) {
                try {
                    const session = await authApi.getSession();
                    if (session && session.user) {
                        await this.orderService.createOrder(session.user.email, cartItems);
                    } else {
                        throw new Error('User not authenticated - order will not be saved to database');
                    }
                } catch (dbError) {
                    throw dbError;
                }
            }

            // 2. Generate Excel File
            this.generateExcelOrder(cartItems);

            // 3. Notify user about manual attachment
            // Using a small timeout to let the download start visually
            await new Promise(resolve => setTimeout(resolve, 500));

            const confirmed = window.confirm(
                'El archivo de tu pedido se ha descargado.\n\n' +
                'Por favor, adjúntalo manualmente en el chat de WhatsApp que se abrirá a continuación.\n\n' +
                '¿Abrir WhatsApp ahora?'
            );

            if (confirmed) {
                // 3. Open WhatsApp
                this.openWhatsApp(cartItems);
            }

            return true;
        } catch (error) {
            throw new Error('Error al procesar el pedido: ' + error.message);
        }
    }

    generateExcelOrder(cartItems) {
        // Prepare data for Excel
        const data = [];

        // Header
        data.push(['N°', 'Producto', 'Cantidad', 'Precio Unitario', 'Total']);

        let grandTotal = 0;

        // Rows
        cartItems.forEach((item, index) => {
            const unitPrice = parseFloat(item.product.precio_total);
            const subtotal = unitPrice * item.quantity;
            grandTotal += subtotal;

            data.push([
                index + 1,
                item.product.producto, // Description
                item.quantity,
                unitPrice,
                subtotal
            ]);
        });

        // Empty row
        data.push(['', '', '', '', '']);

        // Total Row
        data.push(['', '', '', 'TOTAL FINAL', grandTotal]);

        // Create Workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(data);

        // Formatting (basic column width)
        const wscols = [
            { wch: 5 },  // N°
            { wch: 50 }, // Product
            { wch: 10 }, // Qty
            { wch: 15 }, // Price
            { wch: 15 }  // Total
        ];
        ws['!cols'] = wscols;

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, "Pedido");

        // Generate filename with timestamp
        const date = new Date().toISOString().slice(0, 10);
        const filename = `Pedido_Hardware_${date}.xlsx`;

        // Write file and trigger download
        XLSX.writeFile(wb, filename);
    }

    openWhatsApp(cartItems) {
        const total = cartItems.reduce((sum, item) => sum + (item.product.precio_total * item.quantity), 0);
        const formattedTotal = formatPrice(total);

        // Build text summary
        let summaryText = '';
        cartItems.forEach(item => {
            const itemTotal = formatPrice(item.product.precio_total * item.quantity);
            summaryText += `• ${item.product.producto} (x${item.quantity}) - ${itemTotal}\n`;
        });

        const message = `Hola! 👋\n\nTe envío mi pedido:\n\n${summaryText}\n*Total Final: ${formattedTotal}*\n\n(También adjunto el Excel con el detalle completo).\n\nQuedo a la espera de la confirmación. Gracias!`;

        const encodedMessage = encodeURIComponent(message);
        const url = `https://wa.me/${this.whatsappNumber}?text=${encodedMessage}`;

        window.open(url, '_blank');
    }
}
