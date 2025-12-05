import express from 'express';
import cors from 'cors';
import scrapeRoutes from './routes/scrapeRoutes.js';

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/scrape', scrapeRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: err.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
    console.log(`Scraping API available at http://localhost:${PORT}/api/scrape`);
});

export default app;
