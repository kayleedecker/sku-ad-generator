# Static Site Ad Generator

A powerful static site application that generates product advertisements using AI-powered image analysis and marketing copy generation.

## Features

- **AI Product Analysis**: Upload product images and get detailed analysis using OpenAI GPT-4 Vision
- **Marketing Copy Generation**: Generate 3 marketing copy options based on product analysis
- **Ad Style Selection**: Choose between Studio and Nature backgrounds
- **Export Settings**: Configurable fidelity and quality settings
- **ADA Compliance**: Automatic WCAG contrast checks and text optimization
- **Ad Variations**: Generate multiple ad variations with different layouts

## Deployment on Vercel (Hobby Plan)

### 1. Prerequisites

- GitHub account
- Vercel account (free Hobby plan)
- OpenAI API account with credits

### 2. Deploy to Vercel

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/static-site-ad-generator.git
   git push -u origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "New Project"
   - Import your GitHub repository
   - Click "Deploy"

### 3. Configure Environment Variables

After deployment, you need to add your OpenAI API key:

1. **In Vercel Dashboard**:
   - Go to your project dashboard
   - Click on "Settings" tab
   - Click on "Environment Variables" in the left sidebar

2. **Add OpenAI API Key**:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: Your OpenAI API key (starts with `sk-`)
   - **Environment**: Select "Production", "Preview", and "Development"
   - Click "Save"

3. **Get OpenAI API Key**:
   - Go to [platform.openai.com](https://platform.openai.com)
   - Navigate to API Keys section
   - Create a new secret key
   - Copy the key (it starts with `sk-`)

### 4. Redeploy

After adding environment variables:
- Go to "Deployments" tab in Vercel
- Click the three dots on the latest deployment
- Click "Redeploy"

## How the Frontend Calls /api/analyze

The frontend makes a POST request to the `/api/analyze` endpoint:

```javascript
const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        image_b64: currentImageData // Base64 data URL (data:image/jpeg;base64,...)
    })
});

const data = await response.json();
if (data.success) {
    // Use data.analysis which contains:
    // - productType: string
    // - keyFeatures: string[]
    // - targetAudience: string
    // - brandPositioning: { tone, style, description }
}
```

## API Response Format

The `/api/analyze` endpoint returns:

```json
{
  "success": true,
  "analysis": {
    "productType": "Wireless Bluetooth Headphones",
    "keyFeatures": [
      "Active noise cancellation",
      "30-hour battery life",
      "Premium leather padding",
      "Quick charge technology"
    ],
    "targetAudience": "Music enthusiasts and commuters",
    "brandPositioning": {
      "tone": "premium",
      "style": "bold",
      "description": "Premium bold positioning - High-end audio experience for discerning listeners"
    }
  }
}
```

## Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env.local` file:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Visit `http://localhost:3000`

## Project Structure

```
├── api/
│   ├── analyze.js          # OpenAI Vision API endpoint
│   └── copy.js            # Marketing copy generation endpoint
├── index.html             # Main application
├── styles.css             # Dark theme styling
├── script.js              # Frontend logic
├── package.json           # Dependencies
├── vercel.json           # Vercel configuration
└── README.md             # This file
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for GPT-4 Vision | Yes |

## Troubleshooting

### Common Issues

1. **"OpenAI API key not configured"**:
   - Ensure `OPENAI_API_KEY` is set in Vercel environment variables
   - Redeploy after adding environment variables

2. **"OpenAI API quota exceeded"**:
   - Check your OpenAI billing and usage limits
   - Add credits to your OpenAI account

3. **"Invalid OpenAI API key"**:
   - Verify your API key is correct
   - Ensure the key has necessary permissions

### Local Development Issues

- If running locally, ensure `.env.local` file exists with your API key
- Use `npm run dev` instead of opening HTML file directly
- Check browser console for detailed error messages

## Cost Considerations

- OpenAI GPT-4 Vision API costs approximately $0.01-0.03 per image analysis
- Vercel Hobby plan is free for personal projects
- Monitor your OpenAI usage in the platform dashboard

## License

MIT License - see LICENSE file for details
