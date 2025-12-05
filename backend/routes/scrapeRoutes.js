import express from 'express';
import ImageScraperService from '../services/scraping/ImageScraperService.js';

const router = express.Router();

// Store active scraping jobs
const activeJobs = new Map();

/**
 * POST /api/scrape/batch
 * Scrape images for batch of products
 * Body: { products: [...], jobId: string }
 */
router.post('/batch', async (req, res) => {
    const { products, jobId } = req.body;

    if (!products || !Array.isArray(products)) {
        return res.status(400).json({ error: 'Products array is required' });
    }

    const id = jobId || Date.now().toString();

    // Initialize job status
    activeJobs.set(id, {
        id,
        total: products.length,
        current: 0,
        status: 'processing',
        results: [],
        startedAt: new Date()
    });

    // Start scraping in background
    const scraper = new ImageScraperService();

    scraper.scrapeImages(products, (current, total, product, status) => {
        // Update job progress
        const job = activeJobs.get(id);
        if (job) {
            job.current = current;
            job.lastProduct = product.producto;
            job.lastStatus = status;
        }
    }).then(results => {
        const job = activeJobs.get(id);
        if (job) {
            job.status = 'completed';
            job.results = results;
            job.completedAt = new Date();
        }
    }).catch(error => {
        const job = activeJobs.get(id);
        if (job) {
            job.status = 'error';
            job.error = error.message;
        }
    }).finally(() => {
        scraper.close();
    });

    res.json({
        jobId: id,
        message: 'Scraping job started',
        total: products.length
    });
});

/**
 * GET /api/scrape/progress/:jobId
 * Get progress of a scraping job
 */
router.get('/progress/:jobId', (req, res) => {
    const { jobId } = req.params;
    const job = activeJobs.get(jobId);

    if (!job) {
        return res.status(404).json({ error: 'Job not found' });
    }

    res.json({
        jobId: job.id,
        status: job.status,
        current: job.current,
        total: job.total,
        percentage: Math.round((job.current / job.total) * 100),
        lastProduct: job.lastProduct,
        lastStatus: job.lastStatus,
        results: job.status === 'completed' ? job.results : null
    });
});

/**
 * DELETE /api/scrape/job/:jobId
 * Clean up completed job
 */
router.delete('/job/:jobId', (req, res) => {
    const { jobId } = req.params;
    activeJobs.delete(jobId);
    res.json({ message: 'Job deleted' });
});

export default router;
