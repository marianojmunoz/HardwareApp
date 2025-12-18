import { supabase, handleSupabaseError } from './supabaseClient.js';
import { validateOrder } from '../../utils/validators.js';

export const ordersApi = {
    // Crear una nueva orden con sus items
    async createOrder({ userEmail, items, totalAmount }) {
        try {
            // Validate order data
            const orderData = {
                user_email: userEmail,
                total_amount: totalAmount,
                items: items.map(item => ({
                    product_name: item.product.producto,
                    quantity: item.quantity,
                    unit_price: parseFloat(item.product.precio_total),
                    subtotal: parseFloat(item.product.precio_total) * item.quantity
                }))
            };

            const validation = validateOrder(orderData);
            if (!validation.valid) {
                throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
            }

            // 1. Crear la orden principal
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert([{
                    user_email: userEmail,
                    total_amount: totalAmount,
                    status: 'pending'
                }])
                .select()
                .single();

            handleSupabaseError(orderError);

            if (!order) {
                throw new Error('No se pudo crear la orden');
            }

            // 2. Crear los items de la orden
            const orderItems = orderData.items.map(item => ({
                order_id: order.id,
                product_name: item.product_name,
                quantity: item.quantity,
                unit_price: item.unit_price,
                subtotal: item.subtotal
            }));

            const { data: createdItems, error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems)
                .select();

            handleSupabaseError(itemsError);

            return {
                order,
                items: createdItems || []
            };
        } catch (error) {
            throw error;
        }
    },

    // Obtener todas las órdenes (para admin)
    async getAllOrders() {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items (
                    id,
                    product_name,
                    quantity,
                    unit_price,
                    subtotal
                )
            `)
            .order('created_at', { ascending: false });

        handleSupabaseError(error);
        return data || [];
    },

    // Actualizar el estado de una orden (solo admin)
    async updateOrderStatus(orderId, newStatus) {
        // Validar que el estado sea válido
        const validStatuses = ['pending', 'accepted', 'rejected'];
        if (!validStatuses.includes(newStatus)) {
            throw new Error(`Estado inválido: ${newStatus}`);
        }

        const { data, error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId)
            .select()
            .single();

        handleSupabaseError(error);
        return data;
    },

    // Obtener órdenes de un usuario específico
    async getOrdersByEmail(userEmail) {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items (
                    id,
                    product_name,
                    quantity,
                    unit_price,
                    subtotal
                )
            `)
            .eq('user_email', userEmail)
            .order('created_at', { ascending: false });

        handleSupabaseError(error);
        return data || [];
    },

    // Obtener cuenta de pedidos pendientes (para badge)
    async getPendingOrdersCount(userEmail = null) {
        let query = supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending');

        if (userEmail) {
            query = query.eq('user_email', userEmail);
        }

        const { count, error } = await query;

        handleSupabaseError(error);
        return count || 0;
    }
};
