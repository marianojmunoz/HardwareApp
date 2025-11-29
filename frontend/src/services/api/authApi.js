import { supabase, handleSupabaseError } from './supabaseClient.js';

export const authApi = {
    // Login con email/password
    async signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        handleSupabaseError(error);
        return data;
    },

    // Logout
    async signOut() {
        const { error } = await supabase.auth.signOut();
        handleSupabaseError(error);
    },

    // Obtener usuario actual
    async getCurrentUser() {
        const { data: { user }, error } = await supabase.auth.getUser();
        handleSupabaseError(error);
        return user;
    },

    // Obtener sesión actual
    async getSession() {
        const { data: { session }, error } = await supabase.auth.getSession();
        handleSupabaseError(error);
        return session;
    },

    // Escuchar cambios de autenticación
    onAuthStateChange(callback) {
        return supabase.auth.onAuthStateChange((event, session) => {
            callback(event, session);
        });
    }
};
