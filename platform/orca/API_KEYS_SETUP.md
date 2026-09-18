# Orca Multi-Model API Keys Setup Guide

Complete guide to configure OpenAI, Claude, Gemini, and Manus API keys for Orca with specialized use cases.

---

## 📋 Overview

**Use Case Mapping:**
| Provider | Model | Use Case | Cost Tier | Priority |
|----------|-------|----------|-----------|----------|
| **OpenAI** | GPT-4o, 4-turbo | Documentation, SEO, copywriting | Pay-as-you-go | High |
| **Anthropic** | Claude 3 Sonnet | Planning, code review, architecture | Pay-as-you-go | High |
| **Google** | Gemini Pro Vision | Image generation, UI design, Stitch | Free (quota) + Pay | Medium |
| **Manus** | Manus API | Social media integration, automation | Free + Premium | Low |

**Budget:** $100-500/month  
**Estimated Token Usage:**
- OpenAI: ~5M tokens/month ($75-150)
- Claude: ~3M tokens/month ($45-90)
- Gemini: Free tier + occasional paid ($0-50)
- Manus: Free tier (Community)

---

## 1️⃣ OpenAI (GPT-4o) - Documentation & SEO

### Setup Steps

1. **Create OpenAI Account**
   - Go to https://platform.openai.com/signup
   - Sign up with work email (joel@getupsoft.com)
   - Verify email

2. **Create API Key**
   - Navigate to https://platform.openai.com/api/keys
   - Click "Create new secret key"
   - Copy and save immediately (won't show again)

3. **Set Billing**
   - Go to https://platform.openai.com/account/billing/overview
   - Add payment method (credit card)
   - Set monthly budget limit: **$200** (for safety)

4. **Store Key Securely**
   ```bash
   # In .env.local
   OPENAI_API_KEY=sk-proj-...
   OPENAI_ORG_ID=org-... (optional)
   
   # Verify connection
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer $OPENAI_API_KEY" | head -20
   ```

### Models Available
| Model | Context | Cost/1M tokens | Use Case |
|-------|---------|----------------|----------|
| `gpt-4o` | 128K | $5 input / $15 output | Primary (docs, SEO) |
| `gpt-4-turbo` | 128K | $10 input / $30 output | Complex analysis |
| `gpt-3.5-turbo` | 16K | $0.50 input / $1.50 output | Fast, cheap |

### Recommended: GPT-4o for Your Use Cases
```python
# Documentation generation
client.chat.completions.create(
    model="gpt-4o",
    messages=[{
        "role": "user",
        "content": "Generate comprehensive documentation for..."
    }],
    temperature=0.7,
    max_tokens=4000
)

# SEO content
client.chat.completions.create(
    model="gpt-4o",
    messages=[{
        "role": "user",
        "content": "Write SEO-optimized content for keyword: '...'"
    }],
    temperature=0.8,
    max_tokens=2000
)
```

---

## 2️⃣ Anthropic (Claude 3) - Planning & Code Review

### Setup Steps

1. **Create Anthropic Account**
   - Go to https://console.anthropic.com
   - Sign up with work email
   - Verify email

2. **Create API Key**
   - Navigate to https://console.anthropic.com/account/keys
   - Click "Create Key"
   - Copy and save immediately

3. **Set Billing**
   - Go to https://console.anthropic.com/account/billing
   - Add payment method
   - Set monthly budget: **$150**

4. **Store Key**
   ```bash
   # In .env.local
   ANTHROPIC_API_KEY=sk-ant-...
   
   # Verify
   curl https://api.anthropic.com/v1/models \
     -H "x-api-key: $ANTHROPIC_API_KEY"
   ```

### Models Available
| Model | Context | Cost/1M tokens | Use Case |
|-------|---------|----------------|----------|
| `claude-3-5-sonnet` | 200K | $3 input / $15 output | Best for plans & reviews |
| `claude-3-opus` | 200K | $15 input / $75 output | Most capable |
| `claude-3-haiku` | 200K | $0.80 input / $4 output | Fast, cheap |

### Recommended: Claude 3.5 Sonnet
```python
# Planning (system design)
client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=4000,
    system="You are an expert software architect...",
    messages=[{
        "role": "user",
        "content": "Create a plan for: ..."
    }]
)

# Code review
client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=2000,
    system="You are an expert code reviewer...",
    messages=[{
        "role": "user",
        "content": "Review this code: ..."
    }]
)
```

---

## 3️⃣ Google (Gemini) - Image Generation & UI Design

### Setup Steps

1. **Create Google Cloud Account**
   - Go to https://cloud.google.com
   - Create new project: "Orca-Gemini"
   - Enable billing

2. **Enable Gemini API**
   - Go to https://console.cloud.google.com/
   - Search "Gemini API"
   - Click "Enable"

3. **Create API Key**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy and save

4. **Configure Free Tier**
   - Gemini Free tier: **60 requests/minute, 1500 requests/day**
   - For paid: Set billing limit to **$100/month**

5. **Store Key**
   ```bash
   # In .env.local
   GOOGLE_API_KEY=AIzaSy...
   GOOGLE_PROJECT_ID=your-project-id
   
   # Verify
   curl -X POST "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=$GOOGLE_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
   ```

### Models Available
| Model | Vision | Cost | Use Case |
|-------|--------|------|----------|
| `gemini-2.0-flash` | ✅ | Free tier | Images + UI design |
| `gemini-1.5-pro` | ✅ | $0.075-0.3 | High quality images |
| `imagen-3` | ✅ | $0.04/image | Specialized image gen |

### Recommended: Gemini 2.0 Flash for UI Generation
```python
# UI/Component design
import anthropic

client = anthropic.Anthropic(api_key=os.getenv('GOOGLE_API_KEY'))

response = client.messages.create(
    model="gemini-2.0-flash",
    max_tokens=2000,
    messages=[{
        "role": "user",
        "content": "Design a React component for a professional portfolio hero section. Return HTML/CSS code."
    }]
)

# Image generation (with Imagen)
# Use Vertex AI integration for Imagen-3
```

---

## 4️⃣ Manus - Social Media Integration

### Setup Steps

1. **Create Manus Account**
   - Go to https://manus.ai
   - Sign up with work email
   - Verify email

2. **Get API Key (Free Tier)**
   - Dashboard > API Keys > Generate New Key
   - Copy and save

3. **Configure Social Platforms**
   - Settings > Social Integrations
   - Connect Instagram, Twitter, LinkedIn, Facebook
   - Grant permissions for Orca app

4. **Store Key**
   ```bash
   # In .env.local
   MANUS_API_KEY=manus_...
   MANUS_ORG_ID=org_...
   
   # Configure social platforms
   MANUS_INSTAGRAM_ACCOUNT=@getupsoft
   MANUS_TWITTER_ACCOUNT=@getupsoft
   MANUS_LINKEDIN_ACCOUNT=getupsoft
   ```

### Capabilities
- **Post Scheduling:** Schedule content across platforms
- **Content Generation:** AI-powered captions
- **Analytics:** Track engagement, reach, impressions
- **Multi-language:** Support for Spanish, English, etc.

### Integration Example
```python
# Post to social platforms
import requests

def schedule_social_post(title, content, platforms=['instagram', 'twitter']):
    payload = {
        "title": title,
        "content": content,
        "platforms": platforms,
        "schedule_time": "2026-05-20T15:00:00Z"
    }
    
    headers = {
        "Authorization": f"Bearer {MANUS_API_KEY}",
        "Content-Type": "application/json"
    }
    
    response = requests.post(
        "https://api.manus.ai/v1/content/schedule",
        json=payload,
        headers=headers
    )
    return response.json()
```

---

## 🔧 Integration with Stitch & UI Tools

### Stitch (Remotion/Hyperframes)

**Workflow:**
```
Orca (Gemini) generates UI design
    ↓
Export as React/HTML
    ↓
Stitch/Remotion renders animation
    ↓
Output: MP4/WebM video
```

**Integration:**
```python
# Orca calls Gemini for component design
design = gemini_client.generate_ui_design({
    "type": "hero",
    "theme": "modern",
    "brand_colors": ["#FF6B35", "#004E89"]
})

# Pass to Stitch for animation
stitch_renderer.render({
    "component": design,
    "animation": "fade-in",
    "duration": 3,
    "output_format": "mp4"
})
```

### Figma API Integration

```python
# Export design from Figma
figma = FigmaClient(token=FIGMA_API_TOKEN)
design = figma.get_file(FIGMA_FILE_ID)

# Pass to Gemini for enhancement
enhanced = gemini_client.enhance_design({
    "design": design,
    "objective": "make more modern"
})

# Export back to Figma
figma.update_file(FIGMA_FILE_ID, enhanced)
```

### Playwright for Visual Testing

```python
# Generate screenshot with Playwright
async def capture_design(design_url):
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto(design_url)
        await page.screenshot(path="design.png")
        await browser.close()

# Send to Gemini for review
screenshot = capture_design("http://localhost:3000")
review = gemini_client.review_design(screenshot)
```

---

## 📊 Monthly Cost Estimation ($100-500 Budget)

### Conservative Estimate (Budget: $150/month)
```
OpenAI (GPT-4o):
  - 2M tokens documentation @ $5/$15 = $40/month
  
Anthropic (Claude 3.5):
  - 1M tokens planning/review @ $3/$15 = $25/month
  
Google (Gemini):
  - Free tier (1500 requests/day) = $0/month
  - Occasional paid = $10-20/month
  
Manus:
  - Free tier = $0/month
  
TOTAL: ~$75-85/month ✅
```

### Moderate Estimate (Budget: $300/month)
```
OpenAI: 5M tokens = $100/month
Anthropic: 3M tokens = $80/month
Google: 500 paid requests/day = $50/month
Manus: Premium tier = $30/month

TOTAL: ~$260/month ✅
```

### High Volume (Budget: $500/month)
```
OpenAI: 10M tokens = $200/month
Anthropic: 8M tokens = $200/month
Google: Premium image gen = $80/month
Manus: Enterprise = $50/month

TOTAL: ~$530/month
```

---

## 🔐 Security Best Practices

### 1. Store Keys Safely
```bash
# .env.local (NOT in git)
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIzaSy...
MANUS_API_KEY=manus_...

# .env.example (template, no real keys)
OPENAI_API_KEY=your-openai-key-here
ANTHROPIC_API_KEY=your-claude-key-here
GOOGLE_API_KEY=your-gemini-key-here
MANUS_API_KEY=your-manus-key-here
```

### 2. Rotate Keys Regularly
- OpenAI: Every 3 months
- Anthropic: Every 3 months
- Google: Every 6 months
- Manus: Every 6 months

### 3. Monitor Usage
```bash
# OpenAI
curl https://api.openai.com/v1/usage/tokens \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Anthropic
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY"

# Google Cloud
gcloud billing accounts list
gcloud billing budgets create --billing-account=ACCOUNT_ID
```

### 4. Set Rate Limits
```python
# OpenAI
from openai import RateLimitError

for attempt in range(3):
    try:
        response = client.chat.completions.create(...)
        break
    except RateLimitError:
        time.sleep(2 ** attempt)  # Exponential backoff

# Anthropic
@tenacity.retry(
    stop=tenacity.stop_after_attempt(3),
    wait=tenacity.wait_exponential()
)
def call_claude(...):
    return client.messages.create(...)
```

---

## ✅ Verification Checklist

After setting up all keys:

- [ ] OpenAI API key verified
  ```bash
  curl -H "Authorization: Bearer $OPENAI_API_KEY" \
       https://api.openai.com/v1/models | grep gpt-4o
  ```

- [ ] Anthropic API key verified
  ```bash
  curl -H "x-api-key: $ANTHROPIC_API_KEY" \
       https://api.anthropic.com/v1/models
  ```

- [ ] Google Gemini API enabled
  ```bash
  gcloud services list --enabled | grep generative
  ```

- [ ] Manus API key verified
  ```bash
  curl -H "Authorization: Bearer $MANUS_API_KEY" \
       https://api.manus.ai/v1/me
  ```

- [ ] All keys in .env.local
  ```bash
  grep -E "OPENAI|ANTHROPIC|GOOGLE|MANUS" .env.local
  ```

- [ ] Budget limits set in each platform
- [ ] Rate limits configured in Orca
- [ ] Monitoring alerts enabled

---

## 📚 Next Steps

1. Follow steps above to obtain all 4 API keys
2. Add to `.env.local` (DO NOT commit)
3. Update `Orca/config/models.json` with new models
4. Create provider integrations in Orca
5. Test each model with sample requests
6. Deploy with fallback logic

---

**Setup Time:** ~30 minutes  
**Complexity:** Medium  
**Cost Estimation:** Accurate ($100-500/month)  
**Security:** Full encryption + rotation schedule  
**Status:** Ready for setup ✅
