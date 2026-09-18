# Google OAuth Setup Guide for Orca

## 🎯 Overview

Orca now supports Google OAuth 2.0 for seamless user authentication. Users can register and login with their Google accounts in just one click.

---

## 📋 Prerequisites

1. A Google Cloud Project
2. OAuth 2.0 Client Credentials (Client ID and Secret)
3. Configured Redirect URI

---

## 🔧 Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Search for "Google+ API" in the search bar
   - Click on it and press "Enable"

---

## 🔐 Step 2: Create OAuth 2.0 Credentials

### 2.1 Go to Credentials Page
1. In Google Cloud Console, navigate to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**

### 2.2 Configure Consent Screen
If prompted, configure the OAuth consent screen:
- **User Type**: External (for testing)
- **App Name**: Orca
- **User Support Email**: your-email@example.com
- **Developer Contact**: your-email@example.com

### 2.3 Create OAuth 2.0 Client ID
1. Choose **Application type**: Web application
2. **Name**: Orca
3. **Authorized redirect URIs**: 
   - `http://localhost:8015/api/auth/google/callback` (development)
   - `https://your-domain.com/api/auth/google/callback` (production)
4. Click **Create**

### 2.4 Copy Credentials
You'll see a modal with:
- **Client ID**: `xxxxx.apps.googleusercontent.com`
- **Client Secret**: `xxxxx`

**Keep these safe!** ⚠️

---

## 📝 Step 3: Configure Orca

### 3.1 Create `.env` File

Create a `.env` file in the `apps/orca/` directory:

```bash
cd apps/orca
cp .env.example .env
```

### 3.2 Add Credentials to `.env`

Edit `.env` and add your Google OAuth credentials:

```env
GOOGLE_OAUTH_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
GOOGLE_OAUTH_CLIENT_SECRET=YOUR_CLIENT_SECRET
GOOGLE_OAUTH_REDIRECT_URI=http://localhost:8015/api/auth/google/callback
```

Replace:
- `YOUR_CLIENT_ID` with your actual Client ID
- `YOUR_CLIENT_SECRET` with your actual Client Secret

### 3.3 For Production

When deploying to production:

```env
GOOGLE_OAUTH_REDIRECT_URI=https://your-domain.com/api/auth/google/callback
```

Update your Google Cloud Console OAuth credentials with the new redirect URI.

---

## 🚀 Step 4: Start Orca

```bash
cd apps/orca
python src/ai_automation_orchestrator/webapp.py
```

The server will:
1. Load `.env` file
2. Initialize Google OAuth automatically
3. Make the Google login button available in the UI

---

## 🧪 Testing

### Manual Testing

1. Open **http://localhost:8015**
2. Click **"AI Providers & Auth"** button in sidebar
3. Click **"🔐 Login"** button
4. Click **"Sign in with Google"**
5. You'll be redirected to Google login
6. Grant permissions when prompted
7. You'll be logged into Orca automatically!

### Automated Testing

```python
import sys
sys.path.insert(0, 'src')
from ai_automation_orchestrator.webapp import create_app
from starlette.testclient import TestClient

app = create_app()
client = TestClient(app)

# Test Google OAuth start endpoint
response = client.get("/api/auth/google/start")
print(f"OAuth start: {response.status_code}")
data = response.json()
print(f"Auth URL: {data.get('url')}")  # Should contain Google auth URL
```

---

## 🔄 Authentication Flow

```
User clicks "Sign in with Google"
         ↓
Redirect to Google login page
         ↓
User enters credentials
         ↓
Google redirects to /api/auth/google/callback with authorization code
         ↓
Orca exchanges code for tokens (backend)
         ↓
Orca retrieves user info from Google
         ↓
Create/update user in Orca database
         ↓
Create session cookie
         ↓
User is logged in! ✅
```

---

## 📊 What Data Orca Stores

When a user logs in via Google, Orca stores:

- **Email** (from Google profile)
- **Name** (from Google profile)
- **Picture URL** (Google profile picture)
- **Google Sub ID** (unique Google identifier)
- **Email Verified** (status from Google)
- **Access Token** (for future API calls if needed)
- **Authenticated At** (timestamp)

All data is stored in `data/users.json` and associated with the user's Orca ID.

---

## 🔒 Security Features

✅ **CSRF Protection**: Uses state parameter for OAuth flow  
✅ **Secure Tokens**: Tokens stored securely with httponly cookies  
✅ **User Isolation**: Each user's data is isolated  
✅ **Email Verification**: Checks if Google verified the email  
✅ **Session Management**: 30-day session expiration  

### For Production

1. **Use HTTPS only**
2. **Rotate state tokens frequently**
3. **Store tokens encrypted** (use `cryptography` library)
4. **Use Redis** for state storage instead of in-memory
5. **Add rate limiting** on OAuth endpoints
6. **Implement audit logging** for auth events

---

## 🐛 Troubleshooting

### "Google OAuth not configured"
**Cause**: `.env` file not found or credentials missing
**Solution**: Create `.env` file with correct credentials

### "Redirect URI mismatch"
**Cause**: Redirect URI in `.env` doesn't match Google Console setting
**Solution**: Update both `.env` and Google Console to match

### "Invalid client"
**Cause**: Client ID or Secret is wrong
**Solution**: Copy credentials again from Google Console

### "User info not found"
**Cause**: Google account doesn't have email or name
**Solution**: Use a personal Google account with complete profile

### OAuth button not showing
**Cause**: Google OAuth not initialized (missing `.env`)
**Solution**: Create `.env` and restart server

---

## 📱 User Experience

### First-Time Login
1. User clicks Google button
2. Google login page opens
3. User grants permissions
4. **Account created automatically** with Google info
5. Redirected to AI Providers section
6. Ready to configure AI providers

### Returning User
1. User clicks Google button
2. Google recognizes the account
3. **No permissions needed** on return visits
4. Instantly logged in
5. Resumesfrom where they left off

---

## 🔐 Logout

Users can logout by clicking their name in the top-right and selecting "Logout"

The session cookie is invalidated and they're logged out.

---

## 🌍 Production Deployment

### Requirements

1. **SSL Certificate**: HTTPS required for Google OAuth
2. **Domain Name**: Configure in Google Cloud Console
3. **Environment Variables**: Set in production environment
4. **Database**: Migrate from JSON to PostgreSQL/MongoDB
5. **Redis**: For session storage
6. **Monitoring**: Add logging and alerts

### Deployment Checklist

- [ ] Add production domain to Google OAuth
- [ ] Configure HTTPS/SSL
- [ ] Set environment variables in production
- [ ] Use secure random state tokens
- [ ] Enable database encryption
- [ ] Add audit logging
- [ ] Set up monitoring
- [ ] Test full OAuth flow in production

---

## 📚 Additional Resources

- [Google OAuth 2.0 Docs](https://developers.google.com/identity/protocols/oauth2)
- [Google API Console](https://console.cloud.google.com)
- [OAuth 2.0 Security Best Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics)

---

## 🎓 Next Steps

After setting up Google OAuth:

1. ✅ Configure NVIDIA API key for cloud models
2. ✅ Configure Ollama for local models
3. ✅ Configure OpenAI, Anthropic, etc.
4. ✅ Create and run automation workflows
5. ✅ Monitor execution and logs

---

**Status**: ✅ Google OAuth Ready  
**Version**: 1.0  
**Last Updated**: 2026-05-20
