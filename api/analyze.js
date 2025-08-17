// Product Analysis API Endpoint
// Real OpenAI Vision API implementation for Vercel serverless functions

import OpenAI from 'openai';

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed. Use POST.' });
    }

    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ 
            error: 'OpenAI API key not configured',
            details: 'Please add OPENAI_API_KEY to your environment variables' 
        });
    }

    try {
        const { image_b64 } = req.body;

        if (!image_b64) {
            return res.status(400).json({ error: 'No image_b64 provided' });
        }

        // Validate base64 image format
        if (!image_b64.startsWith('data:image/')) {
            return res.status(400).json({ error: 'Invalid image format. Expected base64 data URL.' });
        }

        // Analyze product image using OpenAI Vision API
        const analysis = await analyzeProductImage(image_b64);

        return res.status(200).json({
            success: true,
            analysis
        });

    } catch (error) {
        console.error('Analysis error:', error);
        return res.status(500).json({ 
            error: 'Failed to analyze image',
            details: error.message 
        });
    }
}

async function analyzeProductImage(base64Image) {
    // Initialize OpenAI client
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    try {
        // Call OpenAI Vision API using the Responses API
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `Analyze this product image and extract the following information in JSON format:

{
  "product_type": "Specific product name/type",
  "features": ["3-5 key product features"],
  "target_audience": "Primary target audience description",
  "brand_positioning": {
    "tone": "premium" or "budget-friendly",
    "style": "bold" or "minimal",
    "description": "Brief positioning strategy description"
  }
}

Focus on:
- Accurate product identification
- Specific, marketable features
- Realistic target audience
- Appropriate brand positioning based on product appearance and quality cues`
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: base64Image
                            }
                        }
                    ]
                }
            ],
            max_tokens: 500,
            temperature: 0.3
        });

        // Parse the response
        const content = response.choices[0].message.content;
        
        // Extract JSON from the response (handle potential markdown formatting)
        let jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No valid JSON found in OpenAI response');
        }

        const analysisData = JSON.parse(jsonMatch[0]);

        // Transform to match our expected format
        return {
            productType: analysisData.product_type,
            keyFeatures: analysisData.features,
            targetAudience: analysisData.target_audience,
            brandPositioning: analysisData.brand_positioning
        };

    } catch (error) {
        console.error('OpenAI API error:', error);
        
        // Provide fallback error handling
        if (error.code === 'insufficient_quota') {
            throw new Error('OpenAI API quota exceeded. Please check your billing.');
        } else if (error.code === 'invalid_api_key') {
            throw new Error('Invalid OpenAI API key. Please check your environment variables.');
        } else {
            throw new Error(`OpenAI API error: ${error.message}`);
        }
    }
}
