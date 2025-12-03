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

    // Registro de usuario
    async signUp(email, password, phone = null) {
        const signUpData = {
            email,
            password,
            options: {
                emailRedirectTo: window.location.origin
            }
        };

        // Add phone to user metadata if provided
        if (phone) {
            signUpData.options.data = {
                phone: phone
            };
        }

        const { data, error } = await supabase.auth.signUp(signUpData);
        handleSupabaseError(error);
        return data;
    },

    // Login con OAuth (Google)
    async signInWithOAuth(provider) {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: provider,
            options: {
                redirectTo: window.location.origin,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                },
            }
        });
        handleSupabaseError(error);
        return data;
    },

    // Recuperar contraseña
    async resetPasswordForEmail(email) {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin,
        });
        handleSupabaseError(error);
        return data;
    },

    // Actualizar contraseña (después de recuperación)
    async updatePassword(newPassword) {
        const { data, error } = await supabase.auth.updateUser({
            password: newPassword
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
