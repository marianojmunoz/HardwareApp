import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const BUCKET_NAME = 'product-images';

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Faltan credenciales de Supabase en el archivo .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateImages() {
    console.log('🚀 Iniciando migración de imágenes a Supabase Storage...\n');

    try {
        // 1. Obtener productos que tienen image_url externa
        // Filtramos los que NO contienen 'supabase.co' para evitar duplicar trabajo
        const { data: products, error: fetchError } = await supabase
            .from('products')
            .select('id, producto, image_url, codigo_arrobapc')
            .not('image_url', 'is', null)
            .not('image_url', 'ilike', '%supabase.co%');

        if (fetchError) throw fetchError;

        console.log(`📦 Encontrados ${products.length} productos con imágenes externas para migrar.\n`);

        if (products.length === 0) {
            console.log('✅ Todas las imágenes ya están en Supabase o no hay imágenes para migrar.');
            return;
        }

        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            const currentUrl = product.image_url;
            console.log(`[${i + 1}/${products.length}] Procesando: ${product.producto}`);

            try {
                // 2. Descargar la imagen
                const response = await fetch(currentUrl, { timeout: 10000 });
                if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

                const buffer = await response.arrayBuffer();
                const contentType = response.headers.get('content-type') || 'image/jpeg';

                // Determinar extensión basada en content-type
                let ext = 'jpg';
                if (contentType.includes('png')) ext = 'png';
                else if (contentType.includes('webp')) ext = 'webp';
                else if (contentType.includes('gif')) ext = 'gif';

                // 3. Generar nombre de archivo único
                const timestamp = Date.now();
                const sanitizedCode = (product.codigo_arrobapc || product.id).replace(/[^a-z0-9]/gi, '_');
                const fileName = `${sanitizedCode}-${timestamp}.${ext}`;

                // 4. Subir a Supabase Storage
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from(BUCKET_NAME)
                    .upload(fileName, buffer, {
                        contentType: contentType,
                        cacheControl: '3600',
                        upsert: true
                    });

                if (uploadError) throw uploadError;

                // 5. Obtener URL pública
                const { data: { publicUrl } } = supabase.storage
                    .from(BUCKET_NAME)
                    .getPublicUrl(fileName);

                // 6. Actualizar registro en la base de datos
                const { error: updateError } = await supabase
                    .from('products')
                    .update({ image_url: publicUrl })
                    .eq('id', product.id);

                if (updateError) throw updateError;

                console.log(`   ✅ Migrada con éxito -> ${fileName}`);
                successCount++;

            } catch (error) {
                console.error(`   ❌ Error al migrar: ${error.message}`);
                failCount++;
            }
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 RESUMEN DE MIGRACIÓN');
        console.log(`✅ Éxito:  ${successCount}`);
        console.log(`❌ Fallos: ${failCount}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    } catch (error) {
        console.error('❌ Error fatal durante la migración:', error.message);
    }
}

migrateImages();
