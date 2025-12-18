// Vercel Serverless Function: POST /api/scrape/batch
export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Return error - Selenium not supported on Vercel
    return res.status(501).json({
        error: 'Image scraping not available',
        message: 'Selenium/ChromeDriver cannot run on Vercel serverless functions. This feature is only available when running locally with "npm run backend:dev".',
        suggestion: 'For production image scraping, consider using a service like Railway.app or Render.com for the backend.',
        localOnly: true
    });
}
