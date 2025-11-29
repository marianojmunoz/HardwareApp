import { supabase, handleSupabaseError } from './supabaseClient.js';

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
        const { data, error } = await supabase
            .from('products')
            .insert(products)
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
