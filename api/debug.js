// Debug API Endpoint for troubleshooting Vercel deployment issues

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // Basic environment check
        const debugInfo = {
            timestamp: new Date().toISOString(),
            method: req.method,
            headers: req.headers,
            hasOpenAIKey: !!process.env.OPENAI_API_KEY,
            openAIKeyPrefix: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 7) + '...' : 'NOT_SET',
            nodeVersion: process.version,
            platform: process.platform,
            environment: process.env.NODE_ENV || 'development',
            vercelRegion: process.env.VERCEL_REGION || 'unknown',
            requestBody: req.body,
            requestBodyType: typeof req.body,
            requestBodyKeys: req.body ? Object.keys(req.body) : []
        };

        console.log('Debug info:', debugInfo);

        return res.status(200).json({
            success: true,
            debug: debugInfo,
            message: 'Debug endpoint working correctly'
        });

    } catch (error) {
        console.error('Debug endpoint error:', error);
        return res.status(500).json({
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
}
