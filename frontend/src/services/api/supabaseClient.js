import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from '../../config/supabase.js';

export const supabase = createClient(
    supabaseConfig.url,
    supabaseConfig.anonKey
);

// Helper para manejar errores de Supabase
export const handleSupabaseError = (error) => {
    if (error) {
        throw new Error(error.message || 'Error en la operación');
    }
};
