import { supabase, handleSupabaseError } from './supabaseClient.js';
import { validateProduct } from '../../utils/validators.js';

export const productApi = {
    // Obtener todos los productos
    async getAll() {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });

        handleSupabaseError(error);
        return data || [];
    },

    // Buscar productos
    async search(searchTerm) {
        let query = supabase
            .from('products')
            .select('*');

        if (searchTerm) {
            query = query.or(`producto.ilike.%${searchTerm}%,codigo.ilike.%${searchTerm}%`);
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        handleSupabaseError(error);
        return data || [];
    },

    // Crear producto
    async create(product) {
        // Validate product data
        const validation = validateProduct(product);
        if (!validation.valid) {
            throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }

        const { data, error } = await supabase
            .from('products')
            .insert([product])
            .select()
            .single();

        handleSupabaseError(error);
        return data;
    },

    // Crear múltiples productos (desde Excel)
    async createMany(products) {
        // Validate all products
        const validProducts = [];
        const errors = [];

        products.forEach((product, index) => {
            const validation = validateProduct(product);
            if (validation.valid) {
                validProducts.push(product);
            } else {
                errors.push(`Product ${index + 1} (${product.producto || 'unknown'}): ${validation.errors.join(', ')}`);
            }
        });

        if (errors.length > 0) {
            console.warn('Some products failed validation:', errors);
        }

        if (validProducts.length === 0) {
            throw new Error('No valid products to insert');
        }

        const { data, error } = await supabase
            .from('products')
            .insert(validProducts)
            .select();

        handleSupabaseError(error);
        return data || [];
    },

    // Actualizar producto
    async update(id, updates) {
        const { data, error } = await supabase
            .from('products')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        handleSupabaseError(error);
        return data;
    },

    // Eliminar producto
    async delete(id) {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        handleSupabaseError(error);
        return true;
    },

    // Buscar producto por codigo_arrobapc Y nombre (para verificar duplicados)
    async findByCodigoAndProducto(codigo_arrobapc, producto) {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('codigo_arrobapc', codigo_arrobapc)
            .eq('producto', producto)
            .maybeSingle();

        handleSupabaseError(error);
        return data;
    },

    // Actualizar solo precios de un producto
    async updatePrices(id, prices) {
        const { precio_publico, precio_total, precio_gremio } = prices;

        const { data, error } = await supabase
            .from('products')
            .update({
                precio_publico,
                precio_total,
                precio_gremio,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        handleSupabaseError(error);
        return data;
    },

    // Eliminar TODOS los productos
    async deleteAll() {
        const { error } = await supabase
            .from('products')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Usar UUID válido para la comparación

        handleSupabaseError(error);
        return true;
    }
};
