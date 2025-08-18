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
        console.error('OpenAI API key not found in environment variables');
        return res.status(500).json({ 
            error: 'OpenAI API key not configured',
            details: 'Please add OPENAI_API_KEY to your environment variables' 
        });
    }

    console.log('OpenAI API key found, proceeding with analysis...');

    try {
        const { image_b64 } = req.body;

        console.log('Request body received:', { 
            hasImageB64: !!image_b64, 
            imageSize: image_b64?.length || 0,
            imagePrefix: image_b64?.substring(0, 50) || 'none'
        });

        if (!image_b64) {
            console.error('No image_b64 provided in request body');
            return res.status(400).json({ error: 'No image_b64 provided' });
        }

        // Validate base64 image format
        if (!image_b64.startsWith('data:image/')) {
            console.error('Invalid image format:', image_b64.substring(0, 50));
            return res.status(400).json({ error: 'Invalid image format. Expected base64 data URL.' });
        }

        // Analyze product image using OpenAI Vision API
        console.log('Starting OpenAI analysis...');
        const analysis = await analyzeProductImage(image_b64);
        console.log('OpenAI analysis completed successfully:', analysis);

        return res.status(200).json({
            success: true,
            analysis
        });

    } catch (error) {
        console.error('Analysis error:', error);
        console.error('Error stack:', error.stack);
        
        // Provide more specific error messages
        let errorMessage = 'Failed to analyze image';
        let statusCode = 500;
        
        if (error.message.includes('OpenAI API')) {
            errorMessage = error.message;
            statusCode = 503;
        } else if (error.message.includes('quota')) {
            errorMessage = 'OpenAI API quota exceeded';
            statusCode = 429;
        } else if (error.message.includes('invalid_api_key')) {
            errorMessage = 'Invalid OpenAI API key';
            statusCode = 401;
        }
        
        return res.status(statusCode).json({ 
            error: errorMessage,
            details: error.message,
            timestamp: new Date().toISOString()
        });
    }
}

async function analyzeProductImage(base64Image) {
    console.log('Initializing OpenAI client...');
    
    // Initialize OpenAI client
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });

    console.log('OpenAI client initialized, making API call...');

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

        console.log('OpenAI API call successful, processing response...');
        console.log('Response structure:', {
            choices: response.choices?.length || 0,
            hasContent: !!response.choices?.[0]?.message?.content
        });

        // Parse the response
        const content = response.choices[0].message.content;
        console.log('Raw OpenAI response content:', content);
        
        // Extract JSON from the response (handle potential markdown formatting)
        let jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error('No JSON found in response:', content);
            throw new Error('No valid JSON found in OpenAI response');
        }

        console.log('Extracted JSON string:', jsonMatch[0]);
        const analysisData = JSON.parse(jsonMatch[0]);
        console.log('Parsed analysis data:', analysisData);

        // Transform to match our expected format
        const result = {
            productType: analysisData.product_type,
            keyFeatures: analysisData.features,
            targetAudience: analysisData.target_audience,
            brandPositioning: analysisData.brand_positioning
        };
        
        console.log('Final transformed result:', result);
        return result;

    } catch (error) {
        console.error('OpenAI API error:', error);
        console.error('Error type:', error.constructor.name);
        console.error('Error code:', error.code);
        console.error('Error status:', error.status);
        
        // Provide fallback error handling
        if (error.code === 'insufficient_quota') {
            throw new Error('OpenAI API quota exceeded. Please check your billing.');
        } else if (error.code === 'invalid_api_key') {
            throw new Error('Invalid OpenAI API key. Please check your environment variables.');
        } else if (error.status === 401) {
            throw new Error('OpenAI API authentication failed. Check your API key.');
        } else if (error.status === 429) {
            throw new Error('OpenAI API rate limit exceeded. Please try again later.');
        } else {
            throw new Error(`OpenAI API error: ${error.message}`);
        }
    }
}
