export class UploadService {
    constructor(excelParser, productRepository) {
        this.parser = excelParser;
        this.repository = productRepository;
    }

    /**
     * Generate a unique product code
     * Format: HW-YYYYMMDD-HHMMSS-RRR (e.g., HW-20251127-103045-847)
     * @param {number} index - Index of the product in the batch
     * @returns {string} Unique code
     */
    generateUniqueCode(index) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
        const indexPart = String(index).padStart(4, '0');

        return `HW-${year}${month}${day}-${hours}${minutes}${seconds}-${random}${indexPart}`;
    }

    async uploadExcel(file) {
        // Validar archivo
        if (!this.parser.validate(file)) {
            throw new Error('Archivo inválido. Solo se permiten archivos .xlsx o .xls');
        }

        // Parsear Excel
        const rawData = await this.parser.parse(file);

        if (!rawData || rawData.length === 0) {
            throw new Error('El archivo está vacío');
        }

        const productsData = rawData
            .map(row => this.parser.mapToProduct(row))
            .filter(p => p.producto && p.producto.toString().trim() !== '');

        if (productsData.length === 0) {
            throw new Error('No se encontraron productos válidos en el archivo. Verifica que la columna PRODUCTO tenga datos.');
        }

        // Validar campos requeridos
        const invalidProducts = productsData.filter(p =>
            !p.precio_publico || !p.precio_gremio || !p.precio_total
        );

        if (invalidProducts.length > 0) {
            throw new Error(`Hay ${invalidProducts.length} productos con datos incompletos. Verifica que todas las filas tengan PUBLICO, GREMIO y TOTAL.`);
        }

        // Estadísticas de procesamiento
        const stats = {
            nuevos: 0,
            actualizados: 0,
            omitidos: 0,
            errores: []
        };

        const newProducts = [];

        // LÓGICA INTELIGENTE: Verificar cada producto
        for (let i = 0; i < productsData.length; i++) {
            const product = productsData[i];

            try {
                // Buscar si el producto ya existe (por codigo_arrobapc Y producto)
                const existingProduct = await this.repository.findByCodigoAndProducto(
                    product.codigo_arrobapc || product.codigo,
                    product.producto
                );

                if (existingProduct) {
                    // PRODUCTO EXISTE: Actualizar solo precios
                    await this.repository.updatePrices(existingProduct.id, {
                        precio_publico: product.precio_publico,
                        precio_total: product.precio_total,
                        precio_gremio: product.precio_gremio
                    });
                    stats.actualizados++;
                } else {
                    // PRODUCTO NO EXISTE: Agregar como nuevo automáticamente
                    const uniqueCode = this.generateUniqueCode(stats.nuevos);
                    newProducts.push({
                        ...product,
                        codigo: uniqueCode,
                        es_nuevo: 'SI' // Marcar automáticamente como nuevo
                    });
                    stats.nuevos++;
                }
            } catch (error) {
                stats.errores.push({
                    producto: product.producto,
                    error: error.message
                });
            }
        }

        // Insertar productos nuevos en batch
        let insertedProducts = [];
        if (newProducts.length > 0) {
            insertedProducts = await this.repository.createMany(newProducts);
        }

        return {
            stats,
            insertedProducts
        };
    }

    /**
     * Scrape images for products that don't have image_url
     * @param {Array} products - Array of products
     * @param {Function} onProgress - Progress callback
     * @returns {Promise<Array>} Products with scraped images
     */
    async scrapeProductImages(products, onProgress = null) {
        try {
            // Import scrapeApi dynamically
            const { scrapeApi } = await import('./api/scrapeApi.js');

            // Filter products that need scraping (no image_url)
            const productsNeedingScraping = products.filter(p => !p.image_url || p.image_url.trim() === '');

            if (productsNeedingScraping.length === 0) {
                // All products already have images
                return products;
            }

            // Start scraping job
            const jobId = `scrape-${Date.now()}`;
            console.log('Starting scraping job:', jobId);
            await scrapeApi.startBatch(productsNeedingScraping, jobId);

            // Track stats
            let found = 0;
            let notFound = 0;
            const skipped = products.length - productsNeedingScraping.length;

            // Poll for progress with timeout
            const results = await Promise.race([
                scrapeApi.pollUntilComplete(jobId, (progress) => {
                    console.log('Scraping progress:', progress);
                    // Count found/not found based on last status
                    if (progress.lastStatus === 'found') found++;
                    if (progress.lastStatus === 'not_found') notFound++;

                    if (onProgress) {
                        onProgress({
                            ...progress,
                            found,
                            notFound,
                            skipped
                        });
                    }
                }),
                // Timeout after 5 minutes
                new Promise((_, reject) => setTimeout(() => reject(new Error('Scraping timeout')), 300000))
            ]);

            // Clean up job
            await scrapeApi.deleteJob(jobId);

            // Merge results back into original products array
            const resultsMap = new Map(results.map(r => [r.producto, r]));
            return products.map(p => {
                const scrapedProduct = resultsMap.get(p.producto);
                return scrapedProduct || p;
            });
        } catch (error) {
            console.error('Scraping failed:', error);
            // Return products without images if scrap ing fails
            return products;
        }
    }

    /**
     * Generate summary information from uploaded products
     * @param {Object} uploadResult - Result from uploadExcel with stats and insertedProducts
     * @returns {Object} Summary statistics and information
     */
    getUploadSummary(uploadResult) {
        if (!uploadResult) {
            return null;
        }

        const { stats, insertedProducts } = uploadResult;

        return {
            stats,
            insertedProducts,
            timestamp: new Date().toISOString()
        };
    }
}
