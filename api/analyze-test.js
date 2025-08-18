// Simplified Test Version of Product Analysis API
// This version includes comprehensive error handling and fallback mechanisms

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

    console.log('=== ANALYZE TEST ENDPOINT CALLED ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Environment check:', {
        hasOpenAIKey: !!process.env.OPENAI_API_KEY,
        keyPrefix: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 7) + '...' : 'NOT_SET',
        nodeVersion: process.version,
        platform: process.platform
    });

    try {
        const { image_b64 } = req.body;

        console.log('Request validation:', {
            hasBody: !!req.body,
            hasImageB64: !!image_b64,
            imageSize: image_b64?.length || 0,
            imagePrefix: image_b64?.substring(0, 50) || 'none'
        });

        if (!image_b64) {
            console.error('No image_b64 provided');
            return res.status(400).json({ 
                error: 'No image_b64 provided',
                received: Object.keys(req.body || {})
            });
        }

        if (!image_b64.startsWith('data:image/')) {
            console.error('Invalid image format');
            return res.status(400).json({ 
                error: 'Invalid image format. Expected base64 data URL.',
                received: image_b64.substring(0, 50)
            });
        }

        // Check if OpenAI is available
        if (!process.env.OPENAI_API_KEY) {
            console.log('No OpenAI key, using fallback simulation');
            return res.status(200).json({
                success: true,
                analysis: {
                    productType: 'Test Product (Simulated)',
                    keyFeatures: ['Feature 1', 'Feature 2', 'Feature 3'],
                    targetAudience: 'Test audience',
                    brandPositioning: {
                        tone: 'premium',
                        style: 'minimal',
                        description: 'Simulated analysis - OpenAI key not configured'
                    }
                },
                note: 'This is a simulated response. Configure OPENAI_API_KEY for real analysis.'
            });
        }

        // Try OpenAI analysis
        console.log('Attempting OpenAI analysis...');
        
        try {
            // Dynamic import to handle potential module loading issues
            const { default: OpenAI } = await import('openai');
            
            const openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY,
            });

            console.log('OpenAI client created, making API call...');

            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: `Analyze this product image and return ONLY a JSON object with this exact structure:

{
  "product_type": "Specific product name",
  "features": ["feature1", "feature2", "feature3"],
  "target_audience": "Primary target audience",
  "brand_positioning": {
    "tone": "premium",
    "style": "minimal",
    "description": "Brief positioning description"
  }
}

Important: Return ONLY the JSON object, no markdown formatting, no explanations.`
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: image_b64
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 300,
                temperature: 0.1
            });

            console.log('OpenAI response received');
            
            const content = response.choices[0].message.content.trim();
            console.log('Raw response:', content);

            // Try to parse JSON directly first
            let analysisData;
            try {
                analysisData = JSON.parse(content);
            } catch (parseError) {
                console.log('Direct JSON parse failed, trying regex extraction...');
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    analysisData = JSON.parse(jsonMatch[0]);
                } else {
                    throw new Error('No valid JSON found in response');
                }
            }

            console.log('Parsed data:', analysisData);

            const result = {
                productType: analysisData.product_type,
                keyFeatures: analysisData.features,
                targetAudience: analysisData.target_audience,
                brandPositioning: analysisData.brand_positioning
            };

            console.log('Final result:', result);

            return res.status(200).json({
                success: true,
                analysis: result
            });

        } catch (openaiError) {
            console.error('OpenAI error:', openaiError);
            
            // Provide detailed error info but fall back to simulation
            return res.status(200).json({
                success: true,
                analysis: {
                    productType: 'Fallback Product Analysis',
                    keyFeatures: ['Premium quality', 'User-friendly design', 'Reliable performance'],
                    targetAudience: 'Quality-conscious consumers',
                    brandPositioning: {
                        tone: 'premium',
                        style: 'minimal',
                        description: 'Fallback analysis due to OpenAI error'
                    }
                },
                note: `OpenAI analysis failed: ${openaiError.message}. Using fallback simulation.`,
                error_details: {
                    message: openaiError.message,
                    code: openaiError.code,
                    status: openaiError.status
                }
            });
        }

    } catch (error) {
        console.error('General error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            details: error.message,
            timestamp: new Date().toISOString()
        });
    }
}
