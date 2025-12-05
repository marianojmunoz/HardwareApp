import { Builder, By, Key, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';

const URL_BASE = "http://190.183.223.6/gold/";

class ImageScraperService {
    constructor() {
        this.driver = null;
    }

    /**
     * Create and configure Chrome WebDriver
     */
    async createDriver() {
        const options = new chrome.Options();
        options.addArguments('--start-maximized');
        // Headless mode DISABLED for debugging/visual verification
        // options.addArguments('--headless=new'); 
        options.addArguments('--disable-gpu');
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');

        this.driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();

        return this.driver;
    }

    /**
     * Search for product image on http://190.183.223.6/gold/
     * @param {string} descripcion - Product description to search
     * @returns {Promise<string|null>} Image URL or null if not found
     */
    async buscarImagen(descripcion) {
        if (!this.driver) {
            throw new Error('Driver not initialized. Call createDriver() first.');
        }

        try {
            // Navigate to base URL
            await this.driver.get(URL_BASE);

            // Wait for search input (name="keywords")
            const inputBusqueda = await this.driver.wait(
                until.elementLocated(By.name('keywords')),
                10000
            );

            // Clear and type search term
            await inputBusqueda.clear();
            await inputBusqueda.sendKeys(descripcion);
            await inputBusqueda.sendKeys(Key.RETURN);

            // Wait for product image to appear
            const img = await this.driver.wait(
                until.elementLocated(
                    By.css('img.img-responsive.thumbnail.group.list-group-image')
                ),
                10000
            );

            const src = await img.getAttribute('src');
            return src;

        } catch (error) {
            console.log(`No image found for: ${descripcion}`);
            return null;
        }
    }

    /**
     * Verify if a URL is valid and accessible
     * @param {string} url 
     * @returns {Promise<boolean>}
     */
    async checkUrl(url) {
        if (!url) return false;
        try {
            const response = await fetch(url, { method: 'HEAD' });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    /**
     * Fallback: Search on Google Images
     * @param {string} query 
     * @returns {Promise<string|null>}
     */
    async scrapeGoogleImage(query) {
        try {
            // Navigate to Google Images
            await this.driver.get(`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`);

            // Wait a bit for page load
            try {
                await this.driver.wait(until.elementLocated(By.tagName('body')), 5000);
            } catch (e) { }

            await this.sleep(2000); // Extra wait for images to render

            // Strategy: Get ALL images and find the first "good" one
            const images = await this.driver.findElements(By.tagName('img'));

            for (const img of images) {
                try {
                    const src = await img.getAttribute('src');
                    const height = await img.getAttribute('height');
                    const width = await img.getAttribute('width');

                    // Skip empty srcs
                    if (!src) continue;

                    // Skip small icons/logos (heuristic)
                    if (height && parseInt(height) < 50) continue;
                    if (width && parseInt(width) < 50) continue;

                    // Skip Google logos and common UI elements
                    if (src.includes('google.com/images/branding')) continue;
                    if (src.includes('gstatic.com/ui')) continue;
                    if (src.includes('google.com/images/nav_logo')) continue;
                    if (src.includes('google.com/logos')) continue; // Skip Doodles

                    // Accept HTTP
                    if (src.startsWith('http')) {
                        return src;
                    }

                    // Accept Base64
                    if (src.startsWith('data:image')) {
                        return src;
                    }

                } catch (e) {
                    // Stale element or other error, continue to next
                }
            }

            return null;

        } catch (error) {
            console.error('  ❌ Google Error:', error.message);
            return null;
        }
    }

    /**
     * Scrape images for multiple products with progress callback
     * @param {Array} products - Array of product objects with 'producto' field
     * @param {Function} onProgress - Callback(current, total, lastProduct)
     * @returns {Promise<Array>} Products with image_url field populated
     */
    async scrapeImages(products, onProgress = null) {
        if (!this.driver) {
            await this.createDriver();
        }

        const total = products.length;
        const productsWithImages = [];

        for (let idx = 0; idx < total; idx++) {
            const product = products[idx];
            const descripcion = String(product.producto || '');

            // 1. Check if existing image is valid
            let isValid = false;
            if (product.image_url && product.image_url.trim() !== '') {
                isValid = await this.checkUrl(product.image_url);
            }

            if (isValid) {
                productsWithImages.push(product);
                if (onProgress) onProgress(idx + 1, total, product, 'skipped');
                continue;
            }

            // 2. If no valid image, try Primary Source (Gold)
            console.log(`[${idx + 1}/${total}] Searching image for: ${descripcion}`);
            let imageUrl = await this.buscarImagen(descripcion);

            // Validate Primary Source
            if (imageUrl && !(await this.checkUrl(imageUrl))) {
                console.log(`  ❌ Invalid URL from Primary: ${imageUrl}`);
                imageUrl = null;
            }

            // 3. If still no image, try Fallback (Google)
            if (!imageUrl) {
                console.log(`  ⚠️ Primary failed. Trying Google Images...`);
                imageUrl = await this.scrapeGoogleImage(descripcion);

                // Validate Fallback
                if (imageUrl && !(await this.checkUrl(imageUrl))) {
                    console.log(`  ❌ Invalid URL from Google: ${imageUrl}`);
                    imageUrl = null;
                }
            }

            const updatedProduct = {
                ...product,
                image_url: imageUrl
            };

            productsWithImages.push(updatedProduct);

            // Call progress callback
            if (onProgress) {
                onProgress(idx + 1, total, updatedProduct, imageUrl ? 'found' : 'not_found');
            }

            // Small delay
            await this.sleep(1000); // Increased delay for Google safety
        }

        return productsWithImages;
    }

    /**
     * Sleep utility
     * @param {number} ms - Milliseconds to sleep
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Close the WebDriver
     */
    async close() {
        if (this.driver) {
            await this.driver.quit();
            this.driver = null;
        }
    }
}

export default ImageScraperService;
