const { createClient } = require('@supabase/supabase-js');
// const fetch = require('node-fetch'); // Not needed in Node 18+
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Missing Supabase credentials in .env file');
    console.error('   Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Check if a URL returns a valid response (200-299 status)
 */
async function checkUrl(url, timeout = 5000) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
            method: 'HEAD',
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        clearTimeout(timeoutId);

        return {
            valid: response.ok,
            status: response.status,
            statusText: response.statusText
        };
    } catch (error) {
        return {
            valid: false,
            status: 0,
            statusText: error.message
        };
    }
}

/**
 * Main function to check all product image URLs
 */
async function checkAllImageUrls() {
    console.log('🔍 Fetching all products from database...\n');

    // Get all products with image URLs
    const { data: products, error } = await supabase
        .from('products')
        .select('id, codigo, producto, image_url')
        .not('image_url', 'is', null)
        .neq('image_url', '');

    if (error) {
        console.error('❌ Error fetching products:', error.message);
        process.exit(1);
    }

    console.log(`📦 Found ${products.length} products with image URLs\n`);
    console.log('⏳ Checking URLs (this may take a while)...\n');

    const results = {
        valid: [],
        invalid: [],
        total: products.length
    };

    let checked = 0;

    // Check each URL
    for (const product of products) {
        checked++;
        process.stdout.write(`\rProgress: ${checked}/${results.total} (${Math.round(checked / results.total * 100)}%)`);

        const result = await checkUrl(product.image_url);

        if (result.valid) {
            results.valid.push({
                ...product,
                status: result.status
            });
        } else {
            results.invalid.push({
                ...product,
                status: result.status,
                error: result.statusText
            });
        }

        // Small delay to avoid overwhelming servers
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📊 RESULTS\n');
    console.log(`✅ Valid URLs:   ${results.valid.length} (${Math.round(results.valid.length / results.total * 100)}%)`);
    console.log(`❌ Invalid URLs: ${results.invalid.length} (${Math.round(results.invalid.length / results.total * 100)}%)`);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (results.invalid.length > 0) {
        console.log('❌ INVALID URLs:\n');
        results.invalid.forEach((product, index) => {
            console.log(`${index + 1}. [${product.codigo}] ${product.producto}`);
            console.log(`   URL: ${product.image_url}`);
            console.log(`   Status: ${product.status} - ${product.error}`);
            console.log('');
        });

        // Save invalid URLs to a file
        const reportPath = path.join(__dirname, '..', 'invalid-image-urls.json');
        fs.writeFileSync(reportPath, JSON.stringify(results.invalid, null, 2));
        console.log(`\n📄 Detailed report saved to: ${reportPath}\n`);
    } else {
        console.log('🎉 All image URLs are valid!\n');
    }

    return results;
}

// Run the script
checkAllImageUrls()
    .then(() => {
        console.log('✅ Check completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Fatal error:', error);
        process.exit(1);
    });
