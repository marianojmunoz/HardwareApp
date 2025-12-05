import { productApi } from '../../services/api/productApi.js';
import { Product } from '../../domain/entities/Product.js';

export class SupabaseProductRepository {
    async getAll() {
        const data = await productApi.getAll();
        return data.map(p => new Product(p));
    }

    async search(term) {
        const data = await productApi.search(term);
        return data.map(p => new Product(p));
    }

    async create(productData) {
        const data = await productApi.create(productData);
        return new Product(data);
    }

    async createMany(productsData) {
        const data = await productApi.createMany(productsData);
        return data.map(p => new Product(p));
    }

    async update(id, updates) {
        const data = await productApi.update(id, updates);
        return new Product(data);
    }

    async delete(id) {
        return await productApi.delete(id);
    }

    async findByCodigoAndProducto(codigo, producto) {
        return await productApi.findByCodigoAndProducto(codigo, producto);
    }

    async updatePrices(id, prices) {
        const data = await productApi.updatePrices(id, prices);
        return new Product(data);
    }

    async deleteAll() {
        return await productApi.deleteAll();
    }
}
