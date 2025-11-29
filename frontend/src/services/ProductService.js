export class ProductService {
    constructor(productRepository) {
        this.repository = productRepository;
    }

    async getAllProducts() {
        return await this.repository.getAll();
    }

    async searchProducts(term) {
        if (!term || term.trim() === '') {
            return await this.repository.getAll();
        }
        return await this.repository.search(term);
    }

    async createProduct(productData) {
        return await this.repository.create(productData);
    }

    async updateProduct(id, updates) {
        return await this.repository.update(id, updates);
    }

    async deleteProduct(id) {
        return await this.repository.delete(id);
    }
}
