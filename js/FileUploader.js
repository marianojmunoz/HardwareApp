/**
 * FileUploader Class
 * Handles Excel file upload, validation, and parsing
 */
export class FileUploader {
    constructor(authManager) {
        this.authManager = authManager;
        this.uploadCallback = null;
        this.errorCallback = null;
    }

    /**
     * Process an Excel file
     * @param {File} file 
     */
    async processFile(file) {
        // Check authentication
        if (!this.canUpload()) {
            if (this.errorCallback) {
                this.errorCallback('No tienes permisos para subir archivos');
            }
            return;
        }

        // Validate file
        if (!this.validateFile(file)) {
            if (this.errorCallback) {
                this.errorCallback('Por favor, selecciona un archivo Excel válido (.xlsx o .xls)');
            }
            return;
        }

        try {
            const data = await this.readFile(file);
            const products = this.parseExcel(data);

            if (!products || products.length === 0) {
                if (this.errorCallback) {
                    this.errorCallback('El archivo Excel está vacío');
                }
                return;
            }

            if (this.uploadCallback) {
                this.uploadCallback(products);
            }

        } catch (error) {
            console.error('Error processing file:', error);
            if (this.errorCallback) {
                this.errorCallback('Error al procesar el archivo. Verifica que sea un archivo Excel válido.');
            }
        }
    }

    /**
     * Validate file type
     * @param {File} file 
     * @returns {boolean}
     */
    validateFile(file) {
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
        ];

        return validTypes.includes(file.type) || file.name.match(/\.(xlsx|xls)$/);
    }

    /**
     * Read file as ArrayBuffer
     * @param {File} file 
     * @returns {Promise<ArrayBuffer>}
     */
    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                resolve(e.target.result);
            };

            reader.onerror = () => {
                reject(new Error('Error al leer el archivo'));
            };

            reader.readAsArrayBuffer(file);
        });
    }

    /**
     * Parse Excel data using SheetJS
     * @param {ArrayBuffer} data 
     * @returns {Array}
     */
    parseExcel(data) {
        const uint8Array = new Uint8Array(data);
        const workbook = XLSX.read(uint8Array, { type: 'array' });

        // Get first sheet
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        return jsonData;
    }

    /**
     * Check if user can upload files
     * @returns {boolean}
     */
    canUpload() {
        return this.authManager.isAuthenticated();
    }

    /**
     * Register callback for successful upload
     * @param {Function} callback 
     */
    onUploadSuccess(callback) {
        this.uploadCallback = callback;
    }

    /**
     * Register callback for upload errors
     * @param {Function} callback 
     */
    onUploadError(callback) {
        this.errorCallback = callback;
    }
}
