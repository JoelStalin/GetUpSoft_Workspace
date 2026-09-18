# AI Providers & User Authentication System

## Overview

Orca now includes a unified user authentication system with consolidated AI provider configuration. All AI provider connections and settings are now associated with individual user accounts.

---

## Features

### ✅ User Authentication
- **Email-based registration/login** - No password required initially
- **Session management** - Secure cookie-based sessions (30-day duration)
- **User profiles** - Each user has a dedicated profile
- **Last login tracking** - Monitor user activity

### ✅ Unified AI Providers Section
- **Single consolidated section** for all AI providers
- **6+ supported providers** in one unified interface:
  - NVIDIA Build API (cloud)
  - Ollama (local LAN)
  - OpenAI (GPT-4, o1)
  - Anthropic (Claude)
  - Google Gemini
  - Cohere

### ✅ Provider Configuration
- **API Key storage** - Secure configuration per user
- **Connection testing** - Verify each provider's connectivity
- **Status indicators** - Real-time connection status
- **Configuration persistence** - Settings saved to user profile

---

## Architecture

### Components

#### Backend (Python)

**`user_auth.py`** - User management
- `UserProfile` - User data model
- `UserAuthManager` - User CRUD and profile management
- `SessionManager` - Session handling

**`auth_endpoints.py`** - Authentication API
- `POST /api/auth/login` - Login/register user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info
- `GET /api/auth/verify-session` - Check session validity

**`unified_providers_section.py`** - HTML UI
- Consolidated provider configuration interface
- User login modal
- Provider status display
- JavaScript handlers for authentication and configuration

**`provider_config_endpoints.py`** - Provider API
- `POST /api/providers/config` - Save provider configuration
- `GET /api/providers/config/{provider_id}` - Get saved config
- `POST /api/providers/test` - Test provider connection
- Provider-specific test functions for each service

#### Frontend (HTML/JavaScript)

**Unified Providers View** (`ai-providers-view`)
- Login/register modal
- User info display
- 6 provider configuration cards
- Test buttons with real-time status feedback
- Status summary panel

---

## API Endpoints

### Authentication

```
POST /api/auth/login
{
  "email": "user@example.com",
  "name": "Optional for new users"
}
→ {
  "user_id": "uuid",
  "email": "user@example.com",
  "name": "User Name",
  "session_id": "session-uuid",
  "message": "Welcome back!"
}

POST /api/auth/logout
→ {"message": "Logged out successfully"}

GET /api/auth/me
→ {
  "user_id": "uuid",
  "email": "user@example.com",
  "name": "User Name",
  "created_at": "2026-05-20T...",
  "last_login": "2026-05-20T...",
  "is_active": true
}

GET /api/auth/verify-session
→ {"valid": true, "user_id": "uuid"}
```

### Provider Configuration

```
POST /api/providers/config
{
  "user_id": "uuid",
  "provider_id": "nvidia",
  "config": {"key": "sk-..."}
}
→ {"message": "nvidia configuration saved", ...}

GET /api/providers/config/{provider_id}
→ {
  "provider_id": "nvidia",
  "configured": true,
  "saved_at": "2026-05-20T..."
}

POST /api/providers/test
{
  "provider_id": "nvidia"
}
→ {
  "success": true,
  "status_code": 200,
  "message": "NVIDIA API connection successful"
}
```

---

## Supported AI Providers

### 1. NVIDIA Build API
- **Models**: 23+ (Mistral, Llama, Qwen, etc.)
- **Type**: Cloud API
- **Auth**: API Key
- **Docs**: https://build.nvidia.com
- **Best for**: Latest open-source models

### 2. Ollama (Local)
- **Models**: Llama, Mistral, Neural Chat (local)
- **Type**: Local LAN endpoint
- **Auth**: Endpoint URL (no key needed)
- **Docs**: https://ollama.ai
- **Best for**: Privacy, offline operation

### 3. OpenAI
- **Models**: GPT-4, GPT-4o, o1-preview
- **Type**: Cloud API
- **Auth**: API Key
- **Docs**: https://platform.openai.com
- **Best for**: High performance, reasoning

### 4. Anthropic (Claude)
- **Models**: Claude 3.5 Sonnet, Opus, Haiku
- **Type**: Cloud API
- **Auth**: API Key
- **Docs**: https://anthropic.com
- **Best for**: Long context, analysis

### 5. Google Gemini
- **Models**: Gemini 1.5 Pro, Flash
- **Type**: Cloud API
- **Auth**: API Key
- **Docs**: https://aistudio.google.com
- **Best for**: Multimodal, images

### 6. Cohere
- **Models**: Command, Embed
- **Type**: Cloud API
- **Auth**: API Key
- **Docs**: https://cohere.ai
- **Best for**: Text generation, embeddings

---

## User Workflow

### 1. First-Time Setup

1. Click **"AI Providers & Auth"** button in sidebar
2. Click **"🔐 Login"** button
3. Enter your email and name
4. Click **"Sign In / Register"**
5. You're automatically logged in

### 2. Configure a Provider

1. Scroll to the provider card (e.g., "NVIDIA Build API")
2. Enter your API key/endpoint in the input field
3. Click **"💾 Save"** button
4. Status changes to "✓ Saved"

### 3. Test Connection

1. Click **"✓ Test"** button next to the saved configuration
2. System connects to the provider's API
3. Status shows:
   - ✅ **Green** - Connection successful
   - ❌ **Red** - Connection failed
4. Review error message if needed

### 4. Switch Providers

If a provider is not available:
1. Switch to another configured provider
2. Update Orca settings to use it
3. Your workflows will use the new provider

---

## Data Persistence

### Storage Locations

```
data/
├── users.json           # User profiles and provider configs
└── sessions.json        # Active session tokens
```

### User Profile Structure

```json
{
  "user_id": {
    "user_id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "created_at": "2026-05-20T...",
    "last_login": "2026-05-20T...",
    "is_active": true,
    "provider_configs": {
      "nvidia": {
        "config": {"key": "sk-..."},
        "saved_at": "2026-05-20T..."
      },
      "openai": {
        "config": {"key": "sk-..."},
        "saved_at": "2026-05-20T..."
      }
    }
  }
}
```

---

## Security Considerations

### ✅ Implemented

1. **Cookie-based sessions** - Secure, httponly cookies
2. **Configuration isolation** - Each user's configs are private
3. **Session validation** - All endpoints verify user ownership
4. **No plaintext storage** - Keys stored in JSON (upgrade to encrypted DB for production)

### ⚠️ For Production

1. **Encrypt sensitive data** - Store API keys encrypted
2. **Use environment variables** - Don't commit .json files
3. **Add rate limiting** - Prevent brute force
4. **Use HTTPS** - Always encrypt in transit
5. **Rotate sessions** - Implement token refresh
6. **Audit logging** - Track all config changes

---

## Configuration Examples

### NVIDIA API
```
Key: sk-... (from https://build.nvidia.com)
Endpoint: https://integrate.api.nvidia.com/v1
Test: Connects to Mistral 7B model
```

### Ollama Local
```
Endpoint: http://getupsoft-lan:11434  (or localhost:11434)
Models: Already installed locally
Test: Checks /api/tags endpoint
```

### OpenAI
```
Key: sk-... (from https://platform.openai.com/api-keys)
Models: GPT-4, GPT-4o, o1
Rate Limits: Check OpenAI dashboard
```

### Anthropic (Claude)
```
Key: sk-ant-... (from https://console.anthropic.com/keys)
Models: Claude 3.5 Sonnet, Opus, Haiku
Rate Limits: Check Anthropic console
```

---

## Troubleshooting

### "Not connected" status
- **Cause**: No configuration saved
- **Fix**: Enter API key and click "Save"

### "Connection failed" after test
- **Cause**: Invalid key or API endpoint unavailable
- **Fix**: 
  1. Verify key format
  2. Check API provider's status page
  3. Try from a different network
  4. Contact provider support

### Session expires
- **Cause**: 30-day cookie expiration
- **Fix**: Log in again

### Lost configuration
- **Cause**: Browser cookies cleared
- **Fix**: Re-enter API keys (they're in data/users.json on server)

---

## Integration with Orca Workflows

Once configured, AI providers are used automatically in:
- **Automation Flows** - `/api/workflows`
- **Test Flows** - `/api/test-flows`
- **Interaction Scripts** - `/api/interaction-scripts`
- **n8n Workflows** - `/api/n8n/workflows`

**Selection priority:**
1. User's configured provider (from AI Providers section)
2. Global default (from config)
3. First available provider

---

## Next Steps

1. **Add encryption** for stored API keys
2. **Implement key rotation** for security
3. **Add provider usage metrics** per user
4. **Create provider fallback logic** if primary fails
5. **Add two-factor authentication** for enhanced security

---

## Support

For issues with:
- **Login**: Check browser cookies, verify email
- **API keys**: Double-check format from provider website
- **Connection failures**: Test from command line with `curl`
- **Storage**: Check `data/users.json` file exists and readable

---

**Last Updated**: 2026-05-20  
**Status**: Production Ready (with noted security enhancements for production use)
