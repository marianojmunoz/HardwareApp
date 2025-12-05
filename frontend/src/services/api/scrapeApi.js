// API client for scraping service
const BACKEND_URL = 'http://localhost:3001';

export const scrapeApi = {
    /**
     * Start a scraping job for batch of products
     * @param {Array} products - Products to scrape images for
     * @param {string} jobId - Optional custom job ID
     * @returns {Promise<{jobId: string, message: string, total: number}>}
     */
    async startBatch(products, jobId = null) {
        const response = await fetch(`${BACKEND_URL}/api/scrape/batch`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ products, jobId })
        });

        if (!response.ok) {
            throw new Error('Failed to start scraping job');
        }

        return await response.json();
    },

    /**
     * Get progress of a scraping job
     * @param {string} jobId - Job ID to check
     * @returns {Promise<{jobId, status, current, total, percentage, lastProduct, lastStatus, results}>}
     */
    async getProgress(jobId) {
        const response = await fetch(`${BACKEND_URL}/api/scrape/progress/${jobId}`);

        if (!response.ok) {
            throw new Error('Failed to get scraping progress');
        }

        return await response.json();
    },

    /**
     * Poll for job completion
     * @param {string} jobId - Job ID to monitor
     * @param {Function} onProgress - Callback for progress updates
     * @param {number} intervalMs - Polling interval in milliseconds
     * @returns {Promise<Array>} Completed results
     */
    async pollUntilComplete(jobId, onProgress = null, intervalMs = 1000) {
        return new Promise((resolve, reject) => {
            const interval = setInterval(async () => {
                try {
                    const progress = await this.getProgress(jobId);

                    if (onProgress) {
                        onProgress(progress);
                    }

                    if (progress.status === 'completed') {
                        clearInterval(interval);
                        resolve(progress.results);
                    } else if (progress.status === 'error') {
                        clearInterval(interval);
                        reject(new Error('Scraping job failed'));
                    }
                } catch (error) {
                    clearInterval(interval);
                    reject(error);
                }
            }, intervalMs);
        });
    },

    /**
     * Delete a completed job
     * @param {string} jobId - Job ID to delete
     */
    async deleteJob(jobId) {
        const response = await fetch(`${BACKEND_URL}/api/scrape/job/${jobId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete scraping job');
        }

        return await response.json();
    }
};
