# Professional Page Design Workflow v2 - NVIDIA AI Integration Guide

## Overview

The **Professional Page Design Orchestrator v2** is an enhanced n8n workflow that integrates NVIDIA Build API language models with Orca's multi-agent orchestration system. It automates professional webpage design from brief to completion using cutting-edge LLMs.

**Key improvements over v1:**
- ✅ Integrated NVIDIA Build API models (Mistral Large 3, 675B)
- ✅ Local Ollama fallback (Llama 3.2 3B on getupsoft-lan)
- ✅ AI-powered research, architecture, copywriting, and testing
- ✅ Cloud and local model flexibility
- ✅ Metadata tracking of AI model usage

---

## Workflow Architecture

```
Project Intake
    ↓
Normalize Brief + AI Config
    ↓
┌─────────────────────────┐
│  Research Worker (LLM)  │ → Mistral Large 3
└─────────────────────────┘
    ↓
┌─────────────────────────────┐
│ Design Architecture (LLM)   │ → Mistral Large 3
└─────────────────────────────┘
    ↓
┌─────────────────────────────┐
│  Copywriting Worker (LLM)   │ → Mistral Large 3
└─────────────────────────────┘
    ↓
┌──────────────────────┐
│ QA Testing (LLM)     │ → Mistral Large 3
└──────────────────────┘
    ↓
Register Orca Blueprint v2
    ↓
Build Response
    ↓
Respond to Webhook
```

---

## AI Models Configuration

### Primary Model (Cloud)
- **Model:** `mistral-large-3-675b-instruct-2512`
- **Provider:** NVIDIA Build API
- **Endpoint:** `https://integrate.api.nvidia.com/v1`
- **Cost:** FREE (NVIDIA Build API free tier)
- **Quality:** Excellent (675B parameters)
- **Use case:** Primary LLM for all workflow steps

### Fallback Model (Local)
- **Model:** `llama3.2:3b-instruct-q4_K_M`
- **Provider:** Ollama on getupsoft-lan
- **Endpoint:** `http://getupsoft-lan:11434/v1`
- **Cost:** FREE (local inference)
- **Speed:** Faster (~100ms per token on 16GB RAM)
- **Use case:** Fallback if cloud API unavailable

### Alternative Models
You can swap in any of the 23+ available models:

```json
{
  "cloud_model": "qwen3-coder-480b-a35b-instruct",  // Code-focused
  "cloud_model": "llama-4-maverick-17b-128e-instruct",  // Reasoning
  "cloud_model": "deepseek-v4-pro",  // Specialized reasoning
  "fallback_model": "phi3:mini-4k-instruct-q4"  // Alternative local
}
```

See `MODELS_SETUP.md` for the complete list.

---

## Workflow Steps with AI Integration

### 1. **Normalize Brief + AI Config**
Parses input and sets up AI configuration:
- Extracts project, objective, audience, references
- Selects cloud model (default: Mistral Large 3)
- Selects fallback model (default: Llama 3.2 3B)
- Sets timeout and fallback strategy

**Input Example:**
```json
{
  "project": "portfolio-redesign",
  "objective": "Modern, professional portfolio showcasing design work",
  "audience": "hiring managers and creative leads",
  "references": ["https://github.com/davidhckh/portfolio-2025"],
  "languages": ["es", "en"]
}
```

### 2. **Research Worker (LLM)**
AI-powered research and analysis:
- **Goal:** Analyze project requirements and competitive landscape
- **AI Tasks:**
  - Market analysis
  - Competitive research
  - Audience insights
  - Trend analysis
- **Output:** Research findings, insights, recommendations

**AI Request to Orca:**
```bash
POST /api/automation-flow
{
  "goal": "Research and analyze the project requirements...",
  "systems": "web-research, competitive-analysis, market-insights",
  "context": "Project: portfolio-redesign. Objective: ...",
  "model": "mistral-large-3-675b-instruct-2512"
}
```

### 3. **Design Architecture (LLM)**
AI-driven system design:
- **Goal:** Create design system, component hierarchy, design tokens
- **AI Tasks:**
  - Design system definition
  - Atomic design structure
  - Design tokens and variables
  - Responsive breakpoints
  - Color and typography systems
- **Output:** Design specification document

### 4. **Copywriting Worker (LLM)**
Professional content generation:
- **Goal:** Write headlines, copy, and persuasive content
- **AI Tasks:**
  - Headline writing
  - Section copy
  - Call-to-actions
  - SEO optimization
  - Tone/voice consistency
- **Output:** Website copy and content structure

### 5. **QA Testing (LLM)**
Quality assurance and validation:
- **Goal:** Verify design consistency, copy quality, performance
- **AI Tasks:**
  - Copy quality review
  - Design consistency check
  - Performance requirements validation
  - Accessibility review
  - Cross-browser compatibility check
- **Output:** QA report with findings and recommendations

### 6. **Register Orca Blueprint v2**
Persists workflow execution in Orca:
- Creates blueprint record with AI metadata
- Logs all models used
- Tracks execution steps
- Stores references and settings
- Enables progress tracking and resumption

---

## API Integration Points

All workflow steps call Orca API endpoints with the configured AI model:

```bash
# Base URL (from environment)
ORCA_BASE_URL=http://localhost:8015

# Automation Flow Endpoint
POST /api/automation-flow
{
  "goal": "...",
  "systems": "...",
  "context": "...",
  "model": "mistral-large-3-675b-instruct-2512"  # Or any model from models.json
}

# Test Flow Endpoint
POST /api/test-flow
{
  "project": "...",
  "context": "...",
  "model": "mistral-large-3-675b-instruct-2512"
}

# Blueprints Endpoint
POST /api/blueprints
{
  "user_id": "yoeli",
  "name": "...",
  "objective": "...",
  "status": "completed",
  "nodes": [...],
  "edges": [...],
  "settings": {
    "ai_provider": "nvidia-build-api",
    "cloud_model": "mistral-large-3-675b-instruct-2512",
    "fallback_model": "llama3.2-3b-local"
  }
}
```

---

## Environment Configuration

### Required Environment Variables
```bash
# Orca
ORCA_BASE_URL=http://localhost:8015
ORCA_PUBLIC_URL=https://orca.getupsoft.com

# NVIDIA Build API
NVIDIA_API_KEY=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

# Local Ollama (if using fallback)
LOCAL_LLM_API_KEY=ollama
LOCAL_LLM_BASE_URL=http://getupsoft-lan:11434/v1
AI_ORCHESTRATOR_CONFIG_PATH=config/models.json
```

### n8n Credentials Setup
1. **HTTP Request - NVIDIA API:**
   - Type: HTTP Header Auth
   - Header: `Authorization: Bearer $env.NVIDIA_API_KEY`

2. **HTTP Request - Orca API:**
   - Type: HTTP Header Auth (if Orca requires auth)
   - Or Basic Auth with credentials

---

## Usage Example

### 1. Import Workflow into n8n
```bash
# Copy the workflow file
cp n8n-professional-page-design-v2.workflow.json /path/to/n8n/data/

# Or import via n8n UI:
# Settings > Import > Select JSON file
```

### 2. Configure Credentials
- Set NVIDIA_API_KEY in n8n environment
- Set ORCA_BASE_URL pointing to Orca instance
- Verify Ollama is running on getupsoft-lan (if using fallback)

### 3. Trigger Workflow
```bash
# POST to the webhook
curl -X POST http://localhost:5678/webhook/orca/design-page-workflow \
  -H "Content-Type: application/json" \
  -d '{
    "project": "my-portfolio",
    "objective": "Showcase design and development projects",
    "audience": "tech recruiters",
    "references": ["https://example.com"],
    "languages": ["en"]
  }'
```

### 4. Response
```json
{
  "status": "completed",
  "project": "my-portfolio",
  "workflow_version": "v2-nvidia-ai-powered",
  "ai_models_used": [
    "mistral-large-3-675b-instruct-2512",
    "llama3.2-3b-local"
  ],
  "workflow_steps_completed": [
    "research-worker-llm",
    "design-architecture-llm",
    "copywriting-llm",
    "qa-tester-llm",
    "memory-integration"
  ],
  "ai_configuration": {
    "primary_model": "mistral-large-3-675b-instruct-2512",
    "fallback_model": "llama3.2-3b-local",
    "provider": "NVIDIA Build API",
    "local_provider": "Ollama",
    "total_cost_estimated": "free"
  },
  "blueprint_registered": true,
  "timestamp": "2026-05-19T..."
}
```

---

## Model Selection by Use Case

| Use Case | Recommended Model | Alternative |
|----------|------------------|-------------|
| **Production** | `mistral-large-3-675b` | `llama-4-maverick-17b` |
| **Fast iteration** | `qwen3-coder` | `step-3-5-flash` |
| **Reasoning tasks** | `deepseek-v4-pro` | `llama-4-maverick-17b` |
| **Local/offline** | `llama3.2-3b-local` | `phi3:mini-local` |
| **Budget constrained** | `gemma-2-2b-it` | `nemotron-mini-4b` |

---

## Troubleshooting

### Model Timeout
**Error:** Request timeout after 120 seconds
**Solution:**
- Check NVIDIA API rate limits
- Reduce `max_tokens` in requests
- Use smaller fallback model

### Ollama Not Responding
**Error:** Cannot connect to `http://getupsoft-lan:11434`
**Solution:**
```bash
# Verify Ollama is running
ssh getupsoft-lan "curl http://localhost:11434/api/tags"

# Install if needed
bash scripts/install_local_llm_server.sh getupsoft-lan ollama 3b
```

### API Key Invalid
**Error:** 401 Unauthorized from NVIDIA API
**Solution:**
- Verify `NVIDIA_API_KEY` environment variable
- Check key hasn't expired (generate new one on NVIDIA Build dashboard)
- Ensure API key is set in n8n environment/credentials

### Workflow Not Creating Blueprint
**Error:** HTTP 500 from `/api/blueprints`
**Solution:**
- Verify Orca server is running (`http://localhost:8015`)
- Check `ORCA_BASE_URL` is correct
- Verify user_id is valid (default: `yoeli`)

---

## Performance Metrics

### Typical Execution Times
| Step | Duration | Model |
|------|----------|-------|
| Research Worker | 30-45s | Mistral Large 3 |
| Design Architecture | 25-35s | Mistral Large 3 |
| Copywriting | 20-30s | Mistral Large 3 |
| QA Testing | 15-25s | Mistral Large 3 |
| **Total** | **90-135s** | Cloud |
| **Total (Local)** | **180-240s** | Ollama 3B |

### Token Estimation
- **Research:** ~3000 tokens
- **Architecture:** ~4000 tokens
- **Copywriting:** ~4000 tokens
- **QA:** ~2000 tokens
- **Total:** ~13,000 tokens (free on NVIDIA Build API)

---

## Files Reference

| File | Purpose |
|------|---------|
| `n8n-professional-page-design-v2.workflow.json` | Main workflow definition |
| `INTEGRATION_GUIDE.md` | This file - usage and configuration |
| `../../MODELS_SETUP.md` | Models configuration and selection |
| `../../MODELS_TEST_REPORT.md` | Model testing results |
| `../../config/models.json` | Available cloud models (23 total) |
| `../../config/models.local-lan.json` | Local Ollama models |

---

## Next Steps

1. ✅ Import workflow into n8n
2. ✅ Configure NVIDIA API key
3. ✅ Test with sample project brief
4. ✅ Monitor Orca dashboard for results
5. ✅ Export design system outputs
6. ✅ Deploy to production

---

**Version:** 2.0 (NVIDIA AI Powered)  
**Created:** 2026-05-19  
**Updated by:** Claude Code  
**Integration Status:** ✅ Complete
