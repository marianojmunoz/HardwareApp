import { createClient } from '@supabase/supabase-js';
import ImageScraperService from '../backend/services/scraping/ImageScraperService.js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Missing Supabase credentials in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixBrokenImages() {
    console.log('🔧 Starting Broken Image Fixer...\n');

    // 1. Load invalid images list
    const reportPath = path.join(__dirname, '..', 'invalid-image-urls.json');

    if (!fs.existsSync(reportPath)) {
        console.error('❌ Error: invalid-image-urls.json not found. Run checkImageUrls.js first.');
        process.exit(1);
    }

    const invalidProducts = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    console.log(`📦 Loaded ${invalidProducts.length} products with broken images.`);

    if (invalidProducts.length === 0) {
        console.log('✅ No broken images to fix.');
        process.exit(0);
    }

    // 2. Initialize Scraper
    const scraper = new ImageScraperService();
    await scraper.createDriver();

    console.log('🚀 Scraper initialized with Google Fallback enabled.');
    console.log('⏳ Starting repair process...\n');

    let fixedCount = 0;
    let failedCount = 0;

    try {
        // 3. Process each product
        for (let i = 0; i < invalidProducts.length; i++) {
            const product = invalidProducts[i];
            console.log(`\n[${i + 1}/${invalidProducts.length}] Processing: ${product.producto}`);
            console.log(`   Old URL (Broken): ${product.image_url}`);

            // Clear the broken URL so the scraper treats it as "needs image"
            // But we want to pass the product object. 
            // The scrapeImages method checks: if (product.image_url && isValid) skip.
            // Since we know it's invalid, we can just pass it. 
            // BUT wait, scrapeImages logic I wrote:
            // "1. Check if existing image is valid... If isValid continue"
            // So if I pass the product AS IS, scrapeImages will check validity again (which is good double-check)
            // and finding it invalid, will proceed to search.

            // We'll process one by one to save progress immediately
            const result = await scraper.scrapeImages([product], (current, total, p, status) => {
                // Progress callback (optional logging)
            });

            const updatedProduct = result[0];
            const newUrl = updatedProduct.image_url;

            if (newUrl && newUrl !== product.image_url) {
                console.log(`   ✅ FIXED! New URL: ${newUrl}`);

                // Update DB
                const { error } = await supabase
                    .from('products')
                    .update({ image_url: newUrl })
                    .eq('id', product.id);

                if (error) {
                    console.error(`   ❌ DB Update Failed: ${error.message}`);
                    failedCount++;
                } else {
                    fixedCount++;
                }
            } else {
                console.log(`   ⚠️ Could not find a better image.`);

                // Optional: Clear the broken URL in DB so it doesn't look like it has an image?
                // For now, let's leave it or set to null?
                // User asked to "arreglar", if we can't fix, maybe null is better than broken?
                // Let's set to null if we couldn't find a valid one, so it shows as "no image" instead of broken icon.
                if (!newUrl) {
                    console.log(`   🗑️ Setting URL to NULL (removing broken link).`);
                    await supabase.from('products').update({ image_url: null }).eq('id', product.id);
                }
                failedCount++;
            }
        }

    } catch (error) {
        console.error('❌ Fatal Error:', error);
    } finally {
        await scraper.close();
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📊 REPAIR SUMMARY\n');
    console.log(`✅ Fixed:  ${fixedCount}`);
    console.log(`❌ Failed: ${failedCount}`);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

fixBrokenImages();
