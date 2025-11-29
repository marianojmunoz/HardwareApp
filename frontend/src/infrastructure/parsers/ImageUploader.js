import { supabase } from '../../services/api/supabaseClient.js';

export class ImageUploader {
    constructor(bucketName = 'product-images') {
        this.bucketName = bucketName;
    }

    async upload(file, productCode) {
        if (!file) {
            throw new Error('No file provided');
        }

        // Validar tipo de archivo
        if (!this.validateImageType(file)) {
            throw new Error('Tipo de archivo inválido. Solo se permiten imágenes (JPG, PNG, WEBP)');
        }

        // Generar nombre único para el archivo
        const fileExt = file.name.split('.').pop();
        const fileName = `${productCode}-${Date.now()}.${fileExt}`;
        const filePath = fileName;

        // Subir archivo a Supabase Storage
        const { data, error } = await supabase.storage
            .from(this.bucketName)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (error) {
            throw new Error(`Error al subir imagen: ${error.message}`);
        }

        // Obtener URL pública
        const { data: { publicUrl } } = supabase.storage
            .from(this.bucketName)
            .getPublicUrl(filePath);

        return publicUrl;
    }

    async delete(imageUrl) {
        if (!imageUrl) return;

        try {
            // Extraer el path del archivo de la URL
            const urlParts = imageUrl.split('/');
            const fileName = urlParts[urlParts.length - 1];

            const { error } = await supabase.storage
                .from(this.bucketName)
                .remove([fileName]);

            if (error) {
                console.error('Error deleting image:', error);
            }
        } catch (error) {
            console.error('Error deleting image:', error);
        }
    }

    validateImageType(file) {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        return validTypes.includes(file.type);
    }
}
