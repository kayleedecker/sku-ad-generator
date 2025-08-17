// Marketing Copy Generation API Endpoint
// This serverless function generates marketing copy based on product analysis

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

    try {
        const { analysis } = req.body;

        if (!analysis) {
            return res.status(400).json({ error: 'No analysis data provided' });
        }

        // Validate required analysis fields
        const requiredFields = ['productType', 'keyFeatures', 'targetAudience', 'brandPositioning'];
        for (const field of requiredFields) {
            if (!analysis[field]) {
                return res.status(400).json({ error: `Missing required field: ${field}` });
            }
        }

        // Generate marketing copy options
        const copyOptions = await generateMarketingCopy(analysis);

        return res.status(200).json({
            success: true,
            copyOptions
        });

    } catch (error) {
        console.error('Copy generation error:', error);
        return res.status(500).json({ 
            error: 'Failed to generate marketing copy',
            details: error.message 
        });
    }
}

async function generateMarketingCopy(analysis) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1200));

    // In a real implementation, you would call a language model API
    // Example with OpenAI GPT-4:
    /*
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "You are a marketing copywriter. Generate exactly 3 marketing copy options based on the product analysis. Each option should have a Headline (≤ 7 words) and Subhead (≤ 14 words). Format as JSON array."
                },
                {
                    role: "user",
                    content: `Product Analysis: ${JSON.stringify(analysis)}`
                }
            ],
            max_tokens: 400
        })
    });
    */

    // For demo purposes, generate intelligent copy based on the analysis
    const { productType, keyFeatures, targetAudience, brandPositioning } = analysis;
    
    // Extract positioning characteristics
    const isPremium = brandPositioning.tone === 'premium';
    const isBold = brandPositioning.style === 'bold';
    
    // Generate copy variations based on analysis
    const copyTemplates = generateCopyTemplates(productType, keyFeatures, targetAudience, isPremium, isBold);
    
    // Select 3 different copy options
    const selectedOptions = copyTemplates.slice(0, 3).map((template, index) => ({
        id: `copy_${index + 1}`,
        headline: template.headline,
        subhead: template.subhead,
        tone: template.tone,
        confidence: Math.floor(Math.random() * 15) + 85 // 85-99% confidence
    }));

    return selectedOptions;
}

function generateCopyTemplates(productType, keyFeatures, targetAudience, isPremium, isBold) {
    // Create dynamic copy based on product characteristics
    const firstFeature = keyFeatures[0] || 'innovative design';
    const secondFeature = keyFeatures[1] || 'superior quality';
    
    // Determine copy style based on positioning
    const premiumWords = ['Premium', 'Luxury', 'Elite', 'Exclusive', 'Professional'];
    const budgetWords = ['Smart', 'Affordable', 'Essential', 'Practical', 'Value'];
    const boldWords = ['Revolutionary', 'Game-Changing', 'Ultimate', 'Breakthrough'];
    const minimalWords = ['Simply', 'Effortlessly', 'Perfectly', 'Elegantly'];
    
    const styleWords = isPremium ? premiumWords : budgetWords;
    const toneWords = isBold ? boldWords : minimalWords;
    
    // Generate multiple copy options
    const templates = [
        {
            headline: `${toneWords[0]} ${productType.split(' ')[0]}`,
            subhead: `Experience ${firstFeature.toLowerCase()} like never before with our innovative solution`,
            tone: isPremium ? 'premium' : 'accessible'
        },
        {
            headline: `${styleWords[1]} ${productType.split(' ')[0]} Solution`,
            subhead: `Perfect for ${targetAudience.toLowerCase()} who demand ${secondFeature.toLowerCase()}`,
            tone: isBold ? 'confident' : 'friendly'
        },
        {
            headline: `Your ${styleWords[2]} ${productType.split(' ')[0]}`,
            subhead: `Combining ${firstFeature.toLowerCase()} with ${secondFeature.toLowerCase()} for maximum impact`,
            tone: 'balanced'
        },
        {
            headline: `${toneWords[1]} ${productType.split(' ')[0]} Experience`,
            subhead: `Designed specifically for ${targetAudience.toLowerCase()} seeking superior performance`,
            tone: isPremium ? 'sophisticated' : 'approachable'
        },
        {
            headline: `The ${styleWords[0]} Choice`,
            subhead: `${firstFeature} meets ${secondFeature.toLowerCase()} in this exceptional ${productType.toLowerCase()}`,
            tone: 'authoritative'
        }
    ];

    // Ensure headlines are ≤ 7 words and subheads are ≤ 14 words
    return templates.map(template => ({
        ...template,
        headline: truncateToWordLimit(template.headline, 7),
        subhead: truncateToWordLimit(template.subhead, 14)
    }));
}

function truncateToWordLimit(text, wordLimit) {
    const words = text.split(' ');
    if (words.length <= wordLimit) {
        return text;
    }
    return words.slice(0, wordLimit).join(' ');
}
