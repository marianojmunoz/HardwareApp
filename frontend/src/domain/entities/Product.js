export class Product {
    constructor(data) {
        this.id = data.id;
        this.codigo = data.codigo;
        this.producto = data.producto;
        this.categoria = data.categoria || '';
        this.sub_categoria = data.sub_categoria || '';
        this.garantia = data.garantia || 0;
        this.precio_publico = parseFloat(data.precio_publico);
        this.precio_gremio = parseFloat(data.precio_gremio);
        this.precio_total = parseFloat(data.precio_total) || 0;
        this.stock = parseInt(data.stock) || 0;
        this.image_url = data.image_url || null;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    // Métodos de negocio puros
    isAvailable() {
        return this.stock > 0;
    }

    matchesSearch(term) {
        if (!term) return true;

        const searchable = [
            this.codigo,
            this.producto,
            this.categoria,
            this.sub_categoria,
            String(this.precio_publico),
            String(this.precio_gremio),
            String(this.precio_total),
            String(this.garantia)
        ].join(' ').toLowerCase();

        return searchable.includes(term.toLowerCase());
    }

    hasImage() {
        return this.image_url !== null && this.image_url !== '';
    }

    getFormattedPricePublico() {
        return `$${this.precio_publico.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;
    }

    getFormattedPriceGremio() {
        return `$${this.precio_gremio.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;
    }

    getFormattedPriceTotal() {
        return `$${this.precio_total.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;
    }
}
