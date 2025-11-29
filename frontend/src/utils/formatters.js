// Formatear precio en pesos argentinos
// Formatear precio en pesos argentinos
export const formatPrice = (price) => {
    return `$${parseFloat(price).toLocaleString('es-AR', {
        maximumFractionDigits: 0
    })}`;
};

// Formatear label de campo
export const formatLabel = (key) => {
    const labels = {
        codigo: 'Código',
        producto: 'Producto',
        garantia: 'Garantía',
        precio_publico: 'Precio Público',
        precio_gremio: 'Precio Gremio',
        stock: 'Stock'
    };

    return labels[key] || key.charAt(0).toUpperCase() + key.slice(1);
};

// Formatear garantía
export const formatGarantia = (dias) => {
    if (!dias || dias === 0) return 'Sin garantía';
    if (dias === 1) return '1 día';
    if (dias < 30) return `${dias} días`;
    if (dias === 30) return '1 mes';
    if (dias < 365) {
        const meses = Math.floor(dias / 30);
        return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
    }
    const años = Math.floor(dias / 365);
    return `${años} ${años === 1 ? 'año' : 'años'}`;
};
