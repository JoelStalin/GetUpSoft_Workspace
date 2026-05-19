# Orca AI Providers - Frontend Configuration Guide

## Overview

The new **AI Providers** dashboard in Orca allows you to connect and manage paid AI model providers directly from the web interface. No more environment variables or file editing required.

## Accessing the AI Providers Dashboard

1. Open Orca: http://localhost:8015
2. Click the **AI Providers** button in the left sidebar (📋 icon)
3. You'll see the provider configuration dashboard

## Supported Providers

### 1. OpenAI (GPT-4o)
- **Use Case**: Documentation, SEO copywriting, technical content
- **Models**: GPT-4o, GPT-4 Turbo, GPT-3.5 Turbo
- **Cost**: $5 (input) / $15 (output) per 1M tokens
- **Setup**: 
  1. Go to https://platform.openai.com/api/keys
  2. Create a new API key
  3. Paste in the "API Key" field in Orca
  4. Click "Connect"

### 2. Claude 3.5 Sonnet (Anthropic)
- **Use Case**: Planning, code review, architecture decisions
- **Models**: Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku
- **Cost**: $3 (input) / $15 (output) per 1M tokens
- **Setup**:
  1. Go to https://console.anthropic.com/account/keys
  2. Create a new API key
  3. Paste in the "API Key" field in Orca
  4. Click "Connect"

### 3. Google Gemini
- **Use Case**: Image generation, UI design with Stitch/Figma
- **Models**: Gemini 2.0 Flash, Gemini 1.5 Pro, Imagen-3
- **Cost**: Free tier + Paid overflow
- **Setup**:
  1. Go to https://cloud.google.com
  2. Create a project and enable Gemini API
  3. Create an API key in Credentials
  4. Paste in the "API Key" field in Orca
  5. Click "Connect"

### 4. Manus AI
- **Use Case**: Social media automation, content scheduling
- **Models**: Social media integrations
- **Cost**: Free + Premium tiers
- **Setup**:
  1. Go to https://manus.ai
  2. Create account and generate API key
  3. Paste in the "API Key" field in Orca
  4. Click "Connect"

## Usage

### Connecting a Provider

1. **Find the provider card** you want to connect
2. **Paste your API key** in the password field (shown as dots for security)
3. **Click "Connect"** to save the credentials
4. **Optional: Click "Test"** to validate the connection

### Testing a Connection

- Click the **"Test"** button to validate your API key before saving
- You'll see a checkmark (✓) if valid or an error message if invalid
- No need to test before connecting - you can always test afterwards

### Disconnecting a Provider

- Click **"Clear"** to remove the credentials
- This will delete the API key from Orca's database
- You'll need to enter it again if you want to reconnect

### Viewing Connection Status

- **Green "CONNECTED ✓"** badge = Provider is configured and ready
- **Gray "DISCONNECTED"** badge = Provider needs setup
- The counter at the top shows "X / 4 CONNECTED"

## Task-Based Model Selection

The dashboard shows which provider is recommended for each task type:

| Task Type | Provider | Cost |
|-----------|----------|------|
| Documentation | OpenAI GPT-4o | $5-15 per M tokens |
| Planning & Code Review | Claude 3.5 Sonnet | $3-15 per M tokens |
| UI & Image Generation | Gemini 2.0 Flash | Free + Paid |
| Social Media | Manus AI | Free + Premium |

## Cost Estimation

### Conservative Budget ($75-85/month)
- Free tiers for most providers
- Limited usage of paid APIs
- Perfect for learning and testing

### Moderate Budget ($260/month)
- Regular usage of all providers
- Professional content generation
- Suitable for small teams

### Enterprise Budget ($530+/month)
- High-volume usage
- All features enabled
- Suitable for production environments

## Security Notes

- **Local Storage**: All API keys are stored locally in Orca's database, not in the cloud
- **Password Fields**: Keys are displayed as dots (password input) for security
- **Never Share**: Don't share your API keys with anyone
- **Rotation**: Change your API keys every 3-6 months
- **Environment**: Keys are also available via environment variables if you prefer that approach

## Workflow Integration

Once you connect a provider, it becomes available for:

1. **n8n Workflows**: Select the provider in workflow nodes
2. **Automation Flows**: Route tasks to specific providers
3. **Test Flows**: Use specific models for testing
4. **Professional Page Design**: Use paid models for quality output

### Example: Routing to Specific Models

```json
{
  "goal": "Generate professional documentation",
  "systems": "technical-documentation, code-examples",
  "context": "...",
  "model": "openai/gpt-4o"  // Use OpenAI instead of default
}
```

## Troubleshooting

### "API key is invalid"
- Double-check you copied the entire key (no extra spaces)
- Make sure you didn't expose your key anywhere
- Generate a new key and try again

### "Connection timeout"
- Check your internet connection
- Check if the provider's API is operational (check their status page)
- Try testing again in a few moments

### "Test passed but connection failed"
- Save the key even if test passed
- The test might have succeeded but saving might have failed
- Check browser console for errors

### "I forgot my API key"
- You can't retrieve it from Orca (for security reasons)
- Generate a new API key from the provider's dashboard
- Paste the new key and click "Connect"

## Best Practices

### 1. Use Environment Variables for Production
- For production deployments, use environment variables instead
- Example: `OPENAI_API_KEY=sk-proj-...`
- This is more secure than storing in the database

### 2. Set Budget Alerts
- Go to each provider's billing page
- Set monthly budget limits
- Enable email alerts for usage warnings

### 3. Monitor Usage
- Check each provider's dashboard periodically
- Review costs before they accumulate
- Optimize model selection based on task needs

### 4. Use Fallback Models
- Configure free NVIDIA Build API models as fallback
- If a paid API is unavailable or rate-limited, fallback automatically
- No interruption to your workflows

### 5. Test Before Full Deployment
- Always test providers with "Test" button first
- Run small workflows to verify output quality
- Check costs on test runs before scaling

## Next Steps

1. ✅ Obtain API keys for providers you need
2. ✅ Connect providers using this dashboard
3. ✅ Test each provider with "Test" button
4. ✅ Configure task routing in n8n workflows
5. ✅ Monitor costs and adjust as needed
6. ✅ Set up fallback to free models

## API Endpoints Reference

You can also manage providers programmatically via API:

### List Providers
```bash
GET /api/providers
```

### Get Provider Details
```bash
GET /api/providers/{provider}
```

### Validate API Key
```bash
POST /api/providers/{provider}/validate
Body: {"api_key": "sk-..."}
```

### Connect Provider
```bash
POST /api/providers/{provider}/connect
Body: {"api_key": "sk-..."}
```

### Disconnect Provider
```bash
DELETE /api/providers/{provider}/disconnect
```

### Get Status for All Providers
```bash
GET /api/providers/status?user_id=default
```

---

**Version**: 1.0  
**Last Updated**: 2026-05-19  
**Status**: Ready for Production ✅
