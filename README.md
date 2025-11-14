# FlowCloser Agent

AI-powered closer agent specialized in digital presence sales (websites, PWAs, micro SaaS, webapps) with Instagram integration.

## 🚀 Features

- **Instagram Webhook Integration** - Receive and process messages from Instagram DMs
- **OAuth Authentication** - Instagram Business API authentication flow
- **LLM Fallback System** - Automatic fallback from `gpt-4o-mini` to `gemini-2.5-flash`
- **Railway Deployment Ready** - Pre-configured for Railway deployment
- **Express API Server** - RESTful API endpoints for agent interaction

## 📋 Prerequisites

- Node.js >= 18.0.0
- Railway account (for deployment)
- Instagram Business Account
- OpenAI API Key
- Google API Key (for Gemini fallback)
- IQAI API Key

## 🛠️ Installation

```bash
# Clone the repository
git clone https://github.com/kauntdewn1/flowcloser-agent.git
cd flowcloser-adk-ts

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your API keys
nano .env
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# IQAI API Key (required)
IQAI_API_KEY=your_iqai_api_key

# LLM Configuration
LLM_MODEL=gpt-4o-mini
LLM_MODEL_FALLBACK=gemini-2.5-flash

# API Keys
OPENAI_API_KEY=your_openai_api_key
GOOGLE_API_KEY=your_google_api_key

# Server Configuration
PORT=8042
WEBHOOK_VERIFY_TOKEN=flowcloser_webhook_neo

# Instagram OAuth
INSTAGRAM_APP_ID=your_instagram_app_id
INSTAGRAM_APP_SECRET=your_instagram_app_secret
INSTAGRAM_REDIRECT_URI=https://your-domain.up.railway.app/api/auth/instagram/callback
```

## 🚀 Development

```bash
# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🌐 API Endpoints

### Health Check
```
GET /health
```

### List Agents
```
GET /api/agents
```

### Send Message
```
POST /api/agents/flowcloser/message
Content-Type: application/json

{
  "message": "Hello, I need a professional website",
  "sessionId": "optional-session-id"
}
```

### Instagram Webhook (GET - Verification)
```
GET /api/webhooks/instagram?hub.mode=subscribe&hub.verify_token=YOUR_TOKEN&hub.challenge=CHALLENGE
```

### Instagram Webhook (POST - Messages)
```
POST /api/webhooks/instagram
```

### Instagram OAuth Callback
```
GET /api/auth/instagram/callback?code=AUTHORIZATION_CODE
```

## 🚂 Railway Deployment

1. **Install Railway CLI:**
```bash
npm install -g @railway/cli
```

2. **Login and Deploy:**
```bash
railway login
railway init
railway up
```

3. **Configure Environment Variables:**
   - Go to Railway Dashboard → Variables
   - Add all variables from `.env.example`

4. **Get your URL:**
```bash
railway domain
```

## 📱 Instagram Setup

1. **Create Facebook App:**
   - Go to https://developers.facebook.com/apps/create
   - Add Instagram product
   - Configure Instagram Messaging

2. **Webhook Configuration:**
   - Webhook URL: `https://your-domain.up.railway.app/api/webhooks/instagram`
   - Verify Token: `flowcloser_webhook_neo`
   - Subscribe to: `messages`

3. **OAuth Setup:**
   - Redirect URI: `https://your-domain.up.railway.app/api/auth/instagram/callback`
   - Get Page Access Token from Graph API Explorer

## 🧠 Agent Behavior

The FlowCloser agent follows a structured sales flow:

1. **Opening**: Direct DM greeting
2. **Diagnosis**: 3 key questions about the project
3. **Proposal**: Showcase flowoff.xyz
4. **Conversion**: Direct to WhatsApp for closing

The agent is designed to be:
- Strategic and emotional
- Direct and professional
- Non-corporate tone
- Conversion-focused

## 🔧 Tech Stack

- **TypeScript** - Type-safe development
- **Express.js** - Web server framework
- **@iqai/adk** - Agent Development Kit
- **Zod** - Schema validation
- **Railway** - Deployment platform

## 📝 License

MIT

## 🔗 Links

- **Railway Deployment**: https://flowcloser-agent-production.up.railway.app
- **GitHub Repository**: https://github.com/kauntdewn1/flowcloser-agent
