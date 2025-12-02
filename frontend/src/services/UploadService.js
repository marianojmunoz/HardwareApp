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

        await this.repository.deleteAll();

        const productsData = rawData
            .map(row => this.parser.mapToProduct(row))
            .filter(p => p.producto && p.producto.toString().trim() !== '');

        if (productsData.length === 0) {
            throw new Error('No se encontraron productos válidos en el archivo. Verifica que la columna PRODUCTO tenga datos.');
        }

        // Generate unique codes for all products
        const productsWithUniqueCodes = productsData.map((product, index) => ({
            ...product,
            codigo: this.generateUniqueCode(index)
        }));

        // Validar que tengan los campos requeridos
        const invalidProducts = productsWithUniqueCodes.filter(p =>
            !p.codigo || !p.precio_publico || !p.precio_gremio || !p.precio_total
        );

        if (invalidProducts.length > 0) {
            throw new Error(`Hay ${invalidProducts.length} productos con datos incompletos. Verifica que todas las filas tengan PUBLICO, GREMIO y TOTAL.`);
        }

        // Guardar en base de datos
        const products = await this.repository.createMany(productsWithUniqueCodes);

        return products;
    }

    /**
     * Generate summary information from uploaded products
     * @param {Array} products - Array of uploaded products
     * @returns {Object} Summary statistics and information
     */
    getUploadSummary(products) {
        if (!products || products.length === 0) {
            return null;
        }

        // Calculate statistics
        const total = products.length;

        // Price statistics
        const preciosPublico = products.map(p => p.precio_publico).filter(p => p > 0);
        const preciosGremio = products.map(p => p.precio_gremio).filter(p => p > 0);
        const preciosTotal = products.map(p => p.precio_total).filter(p => p > 0);

        const priceStats = {
            publico: {
                min: Math.min(...preciosPublico),
                max: Math.max(...preciosPublico),
                avg: (preciosPublico.reduce((a, b) => a + b, 0) / preciosPublico.length).toFixed(2)
            },
            gremio: {
                min: Math.min(...preciosGremio),
                max: Math.max(...preciosGremio),
                avg: (preciosGremio.reduce((a, b) => a + b, 0) / preciosGremio.length).toFixed(2)
            },
            total: {
                min: Math.min(...preciosTotal),
                max: Math.max(...preciosTotal),
                avg: (preciosTotal.reduce((a, b) => a + b, 0) / preciosTotal.length).toFixed(2)
            }
        };

        // Stock statistics
        const stockValues = products.map(p => p.stock || 0);
        const totalStock = stockValues.reduce((a, b) => a + b, 0);
        const withStock = products.filter(p => (p.stock || 0) > 0).length;
        const withoutStock = total - withStock;

        // Warranty statistics
        const warranties = products.map(p => p.garantia || 0).filter(g => g > 0);
        const avgWarranty = warranties.length > 0
            ? (warranties.reduce((a, b) => a + b, 0) / warranties.length).toFixed(1)
            : 0;

        // Sample products (first 5)
        const sampleProducts = products.slice(0, 5).map(p => ({
            codigo: p.codigo,
            producto: p.producto,
            precio_publico: p.precio_publico,
            precio_gremio: p.precio_gremio,
            precio_total: p.precio_total,
            stock: p.stock || 0
        }));

        return {
            total,
            priceStats,
            stock: {
                total: totalStock,
                withStock,
                withoutStock
            },
            avgWarranty,
            sampleProducts,
            timestamp: new Date().toISOString()
        };
    }
}
