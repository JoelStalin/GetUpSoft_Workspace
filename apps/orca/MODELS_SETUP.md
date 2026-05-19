# Orca Models Setup Guide

Orca now supports **23+ models** from NVIDIA Build API (cloud) and local inference.

## Quick Start

### Cloud Models (Recommended for production)
All NVIDIA Build API models are **free** and work out-of-the-box:

```bash
# Set your NVIDIA API Key
export NVIDIA_API_KEY="your-key-here"

# Run Orca with cloud models (default)
python -m uvicorn ai_automation_orchestrator.webapp:app --reload
```

**Models included** (23 total):
- DeepSeek V4 Pro (default)
- Mistral Large 3 (675B)
- Qwen3 Coder (480B)
- Llama 4 Maverick (17B)
- Gemma 4 (31B)
- Phi-4 Multimodal
- And 17 more...

See `config/models.json` for full list.

---

### Local Models (CPU/LAN)
Run models locally on `getupsoft-lan` server using Ollama.

#### Step 1: Install Ollama on getupsoft-lan

```bash
# From your local machine with SSH access to getupsoft-lan:
bash scripts/install_local_llm_server.sh getupsoft-lan ollama 3b
```

This will:
- Install Ollama on the server
- Download 4 x 3B models (~8GB total):
  - `llama3.2:3b-instruct-q4_K_M`
  - `phi3:mini-4k-instruct-q4`
  - `gemma2:2b-instruct-q4_K_M`
  - `qwen2.5:3b-instruct-q4_K_M`

#### Step 2: Configure Orca for local models

```bash
# Set the config path to use local models
export AI_ORCHESTRATOR_CONFIG_PATH=config/models.local-lan.json

# Run Orca
python -m uvicorn ai_automation_orchestrator.webapp:app --reload
```

#### Step 3: Test

```bash
# Test the local Ollama endpoint
curl http://getupsoft-lan:11434/api/tags

# Test Orca with a local model
curl -X POST http://localhost:8000/api/test-flow \
  -H "Content-Type: application/json" \
  -d '{"project":"test","context":"test context","model":"llama3.2-3b-local"}'
```

---

## Configuration

### Cloud vs Local

**Cloud models** (`config/models.json`):
- ✅ Better quality
- ✅ No local hardware needed
- ✅ Free tier available
- ❌ Requires internet
- ❌ Latency depends on API

**Local models** (`config/models.local-lan.json`):
- ✅ Zero latency
- ✅ No internet required
- ✅ Privacy (data stays on LAN)
- ❌ Limited by local hardware
- ❌ CPU-only slower inference

With 16GB RAM on getupsoft-lan, 3B models work well (~100ms per token).

### Switching Configurations

```bash
# Use cloud (production, recommended)
export AI_ORCHESTRATOR_CONFIG_PATH=config/models.json

# Use local (testing, privacy)
export AI_ORCHESTRATOR_CONFIG_PATH=config/models.local-lan.json

# Or edit .env file
AI_ORCHESTRATOR_CONFIG_PATH=config/models.local-lan.json
```

---

## Advanced: vLLM Alternative

If you prefer vLLM instead of Ollama:

```bash
# Install vLLM alongside Ollama
bash scripts/install_local_llm_server.sh getupsoft-lan both 3b

# Or install only vLLM
bash scripts/install_local_llm_server.sh getupsoft-lan vllm
```

Update `config/models.local-lan.json` to point to vLLM:

```json
{
  "base_url": "http://getupsoft-lan:8000/v1"
}
```

---

## Model Selection Guide

### For Cloud (NVIDIA Build API)
Use any model in `config/models.json`. Recommend starting with:
- **`deepseek-v4-pro`** - Best reasoning (17B equivalent)
- **`mistral-large-3-675b-instruct-2512`** - Largest, best quality
- **`llama-4-maverick-17b-128e-instruct`** - Balanced

### For Local (Ollama on getupsoft-lan)

| Model | Size | RAM | Speed | Quality |
|-------|------|-----|-------|---------|
| `llama3.2:3b-instruct-q4_K_M` | 3B | 3GB | Fast | Good |
| `phi3:mini-4k-instruct-q4` | 3.8B | 2.2GB | Fast | Excellent |
| `gemma2:2b-instruct-q4_K_M` | 2B | 1.6GB | Very fast | Fair |
| `qwen2.5:3b-instruct-q4_K_M` | 3B | 2GB | Fast | Good |
| `llama2:7b-chat-q4_K_M` | 7B | 4GB | Slow* | Excellent |
| `mistral:7b-instruct-q4_K_M` | 7B | 4.4GB | Slow* | Excellent |

*With 16GB RAM, 7B models work but responses will be slower (~300-500ms per token on CPU).

---

## Troubleshooting

### Models not loading
```bash
# Check Orca config is valid
python3 -c "from ai_automation_orchestrator.config import load_config; cfg = load_config(); print(f'Loaded {len(cfg.models)} models')"
```

### Ollama connection error
```bash
# Verify Ollama is running on remote server
ssh getupsoft-lan "curl http://localhost:11434/api/tags | jq '.models[].name'"
```

### Slow inference
- Cloud: Check API rate limits
- Local: Check server CPU load (`ssh getupsoft-lan "top"`)
- Reduce `max_tokens` in request

---

## Files Reference

| File | Purpose |
|------|---------|
| `config/models.json` | Cloud NVIDIA Build models (23 models) |
| `config/models.local-lan.json` | Local Ollama/vLLM models (4 models) |
| `config/models.nvidia-free.generated.json` | Source list of all NVIDIA free models |
| `scripts/merge_nvidia_models.py` | Script to merge NVIDIA free models into config |
| `scripts/install_local_llm_server.sh` | Installation script for Ollama/vLLM |
| `.env.example` | Environment variables for configuration |
