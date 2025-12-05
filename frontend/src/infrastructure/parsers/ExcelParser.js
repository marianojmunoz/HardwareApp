export class ExcelParser {
    async parse(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(sheet);
                    resolve(jsonData);
                } catch (error) {
                    reject(new Error('Error parsing Excel file'));
                }
            };

            reader.onerror = () => reject(new Error('Error reading file'));
            reader.readAsArrayBuffer(file);
        });
    }

    validate(file) {
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
        ];
        return validTypes.includes(file.type) || /\.(xlsx|xls)$/i.test(file.name);
    }

    // Mapear columnas del Excel a formato de base de datos
    mapToProduct(excelRow) {
        // Helper para obtener valor ignorando espacios en blanco en las claves
        const getValue = (row, key) => {
            const normalizedKey = key.toLowerCase().trim();
            const foundKey = Object.keys(row).find(k => k.toLowerCase().trim() === normalizedKey);
            let value = foundKey ? row[foundKey] : undefined;

            if (typeof value === 'string') {
                value = value.trim();
            }

            return value;
        };

        const mappedProduct = {
            codigo: getValue(excelRow, 'CODIGO') || getValue(excelRow, 'codigo') || '',
            codigo_arrobapc: getValue(excelRow, 'CODIGO') || getValue(excelRow, 'codigo') || '',
            producto: getValue(excelRow, 'PRODUCTO') || getValue(excelRow, 'producto') || '',
            categoria: getValue(excelRow, 'CATEGORIA') || getValue(excelRow, 'Categoria') || getValue(excelRow, 'categoria') || '',
            sub_categoria: getValue(excelRow, 'SUB-CATEGORIA') || getValue(excelRow, 'sub-categoria') || getValue(excelRow, 'SUB CATEGORIA') || getValue(excelRow, 'sub categoria') || getValue(excelRow, 'SUBCATEGORIA') || getValue(excelRow, 'Subcategoria') || getValue(excelRow, 'subcategoria') || '',
            garantia: parseInt(getValue(excelRow, 'GARANTIA') || getValue(excelRow, 'garantia') || 0),
            precio_publico: parseFloat(getValue(excelRow, 'PUBLICO') || getValue(excelRow, 'publico') || 0),
            precio_total: parseFloat(getValue(excelRow, 'TOTAL') || getValue(excelRow, 'total') || 0),
            precio_gremio: parseFloat(getValue(excelRow, 'GREMIO') || getValue(excelRow, 'gremio') || 0),
            stock: parseInt(getValue(excelRow, 'STOCK') || getValue(excelRow, 'stock') || 0),
            image_url: getValue(excelRow, 'IMAGEN') || getValue(excelRow, 'imagen') || getValue(excelRow, 'IMAGE_URL') || getValue(excelRow, 'image_url') || getValue(excelRow, 'URL') || getValue(excelRow, 'url') || null,
            es_nuevo: getValue(excelRow, 'Es_Nuevo?') || getValue(excelRow, 'ES_NUEVO') || getValue(excelRow, 'es_nuevo') || getValue(excelRow, 'NUEVO') || 'NO'
        };


        return mappedProduct;
    }
}
