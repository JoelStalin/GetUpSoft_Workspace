# Phase 7: Backend API Integration — Implementation Plan
**Date Created:** 2026-05-23  
**Status:** 🚀 In Planning  
**Estimated Duration:** 4-5 hours  
**Priority:** HIGH (Makes AI responses functional)

---

## 🎯 Objective

Connect ORCA chat to real AI APIs so that:
1. Chat sends user messages to NVIDIA, OpenAI, or other LLM providers
2. AI model selection actually changes which API is called
3. Responses stream in real-time instead of generic replies
4. Workflow generation gets smarter with actual LLM capabilities
5. System can handle different model capabilities and costs

---

## 📋 Requirements

### Current State
- Chat sends messages and receives generic responses
- AI model selector exists but doesn't affect responses
- Workflow automation works with local keyword matching
- No actual API calls made

### Target State
- Real LLM API integration working
- Model selector switches between APIs
- Streaming responses for better UX
- Error handling for API failures
- Cost tracking (optional)

---

## 🔧 Implementation Steps

### Step 1: API Configuration (45 min)
**Goal:** Set up API credentials and endpoints

```typescript
// apps/orca/workflow-editor/src/config/models.ts
interface ModelConfig {
  id: string
  name: string
  provider: 'nvidia' | 'openai' | 'anthropic'
  endpoint: string
  apiKey: string
  maxTokens: number
  costPerToken: number
}

const MODELS: Record<string, ModelConfig> = {
  'nvidia-llama': {
    id: 'nvidia-llama',
    name: 'NVIDIA Llama 2',
    provider: 'nvidia',
    endpoint: 'https://integrate.api.nvidia.com/v1/chat/completions',
    apiKey: process.env.NVIDIA_API_KEY || '',
    maxTokens: 2048,
    costPerToken: 0.00001,
  },
  'openai-gpt4': {
    id: 'openai-gpt4',
    name: 'OpenAI GPT-4',
    provider: 'openai',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    apiKey: process.env.OPENAI_API_KEY || '',
    maxTokens: 8000,
    costPerToken: 0.00003,
  },
  // ... more models
}
```

**Tasks:**
- [ ] Create `config/models.ts` with model configurations
- [ ] Add environment variable support (.env file)
- [ ] Implement configuration loading
- [ ] Validate API keys on startup
- [ ] Handle missing/invalid credentials

### Step 2: API Client Service (1.5 hours)
**Goal:** Create unified API client for all providers

```typescript
// apps/orca/workflow-editor/src/services/aiApiClient.ts
interface AIClientOptions {
  modelId: string
  messages: ChatMessage[]
  temperature?: number
  maxTokens?: number
  onStream?: (chunk: string) => void
}

class AIApiClient {
  async sendMessage(options: AIClientOptions): Promise<string>
  async streamMessage(options: AIClientOptions): Promise<AsyncIterable<string>>
  async validateApiKey(modelId: string): Promise<boolean>
}
```

**Tasks:**
- [ ] Create `AIApiClient` base class
- [ ] Implement NVIDIA API adapter
- [ ] Implement OpenAI API adapter
- [ ] Add streaming support
- [ ] Handle API errors gracefully
- [ ] Add retry logic for transient failures
- [ ] Rate limiting and quota handling

### Step 3: Chat Integration (1 hour)
**Goal:** Wire API client into chat

**Changes to `AIMode.tsx`:**
- [ ] Initialize API client on component mount
- [ ] Pass selected model to API client
- [ ] Stream responses to chat in real-time
- [ ] Show "typing" indicator while waiting
- [ ] Handle API errors with user-friendly messages
- [ ] Track response timing and costs

**Modified `sendMessage()` function:**
```typescript
const sendMessage = async (text?: string) => {
  // ... existing parser code ...
  
  // NEW: Call real API
  try {
    setIsTyping(true)
    const response = await aiClient.streamMessage({
      modelId: selectedModel,
      messages: [...chatHistory, userMsg],
      onStream: (chunk) => {
        // Update message in real-time
        updateLastAgentMessage((prev) => prev + chunk)
      },
    })
    
    // Save complete response
    const finalMsg: ChatMessage = {
      id: `a-${Date.now()}`,
      role: 'agent',
      content: response,
      timestamp: new Date().toISOString(),
    }
    setMessages((m) => [...m, finalMsg])
  } catch (error) {
    addToast(`API Error: ${error.message}`, 'error')
  } finally {
    setIsTyping(false)
  }
}
```

### Step 4: Streaming UI Enhancement (45 min)
**Goal:** Update UI to show streaming responses

**Changes:**
- [ ] Replace simulated delays with real streaming
- [ ] Show response appearing character-by-character
- [ ] Add cancel button during streaming
- [ ] Animate "typing" indicator
- [ ] Show estimated costs as response streams

```typescript
// Real-time cost calculation
const estimatedCost = response.length * modelCostPerToken
const costDisplay = `$${estimatedCost.toFixed(5)}`
```

### Step 5: Error Handling (45 min)
**Goal:** Robust error handling for API failures

**Scenarios to handle:**
- [ ] Invalid API key
- [ ] Rate limit exceeded
- [ ] Model not available
- [ ] Network timeout
- [ ] Malformed response
- [ ] Server error (5xx)
- [ ] Quota exceeded

**Error strategy:**
```typescript
try {
  // API call
} catch (error) {
  if (error instanceof RateLimitError) {
    // Wait and retry
  } else if (error instanceof AuthError) {
    // Show credential prompt
  } else if (error instanceof ModelNotFound) {
    // Offer alternative model
  } else {
    // Generic fallback response
  }
}
```

### Step 6: Testing (1 hour)
**Goal:** Verify API integration works correctly

**Test Cases:**
- [ ] NVIDIA API responds correctly
- [ ] OpenAI API responds correctly
- [ ] Streaming works smoothly
- [ ] Error handling graceful
- [ ] Model switching works
- [ ] Rate limits respected
- [ ] Costs calculated correctly
- [ ] Offline mode has fallback

---

## 📊 Implementation Details

### Model Provider Adapters

**NVIDIA API Adapter:**
```
Endpoint: https://integrate.api.nvidia.com/v1/chat/completions
Auth: Bearer token in header
Models: llama-2-70b, nemo, etc.
Streaming: Server-sent events (SSE)
Cost: ~$0.00001 per token
```

**OpenAI API Adapter:**
```
Endpoint: https://api.openai.com/v1/chat/completions
Auth: API key in header
Models: gpt-4, gpt-3.5-turbo, etc.
Streaming: Server-sent events (SSE)
Cost: ~$0.00003 per token (GPT-4)
```

### Environment Variables Required

```bash
# .env.local
NVIDIA_API_KEY=xxx
OPENAI_API_KEY=xxx
ANTHROPIC_API_KEY=xxx

# Optional
API_LOG_LEVEL=debug
ENABLE_COST_TRACKING=true
RATE_LIMIT_REQUESTS_PER_MINUTE=60
```

### Cost Tracking (Optional)

```typescript
interface ApiUsageStats {
  totalRequests: number
  totalTokens: number
  totalCost: number
  costByModel: Record<string, number>
  costByProvider: Record<string, number>
}
```

---

## 🎯 Success Criteria

- ✅ NVIDIA API integration working
- ✅ OpenAI API integration working
- ✅ Streaming responses in UI
- ✅ Model selector changes API behavior
- ✅ Error handling graceful
- ✅ No console errors
- ✅ Real-time cost display
- ✅ Fallback behavior when API unavailable
- ✅ Rate limiting respected
- ✅ Performance: <2s response time

---

## 🚀 Next Phase Options (Phase 8)

1. **Workflow Execution** - Actually run workflows, not just create them
2. **Advanced Chat Commands** - Slash commands (/create, /modify, /delete)
3. **Database Integration** - Persist conversations and workflows
4. **Testing Suite** - E2E and unit tests
5. **Mobile Optimization** - Responsive touch interface
6. **Production Deployment** - CI/CD and hosting

---

## 📝 Files to Create/Modify

### New Files
- `apps/orca/workflow-editor/src/config/models.ts` (API configuration)
- `apps/orca/workflow-editor/src/services/aiApiClient.ts` (API client)
- `apps/orca/workflow-editor/src/adapters/nvidiaAdapter.ts` (NVIDIA integration)
- `apps/orca/workflow-editor/src/adapters/openaiAdapter.ts` (OpenAI integration)
- `apps/orca/workflow-editor/.env.example` (Example env vars)

### Modified Files
- `apps/orca/workflow-editor/src/components/modes/AIMode.tsx` (Chat integration)
- `apps/orca/workflow-editor/src/utils/errorHandler.ts` (Better error handling)

**Estimated New Code:** ~800 lines

---

## ✅ Implementation Checklist

### Part 1: Configuration
- [ ] Create models.ts with API configs
- [ ] Add environment variable support
- [ ] Create .env.example file
- [ ] Implement config validation

### Part 2: API Client
- [ ] Create AIApiClient base class
- [ ] Implement NVIDIA adapter
- [ ] Implement OpenAI adapter
- [ ] Add streaming support
- [ ] Add error handling
- [ ] Add retry logic

### Part 3: Chat Integration
- [ ] Wire API client into AIMode.tsx
- [ ] Implement streaming UI updates
- [ ] Add cost display
- [ ] Handle model switching
- [ ] Add cancel/stop button

### Part 4: Testing & QA
- [ ] Test with real API keys
- [ ] Test error scenarios
- [ ] Test model switching
- [ ] Test streaming
- [ ] Test cost calculation
- [ ] QA audit for UI/UX
- [ ] Performance testing

### Part 5: Documentation
- [ ] Document API setup
- [ ] Document configuration
- [ ] Document cost tracking
- [ ] Update CHANGE_TIMELINE.md

---

**Ready to implement Phase 7?** ✅

This phase adds real AI intelligence to ORCA, making it a truly functional assistant for workflow automation. Chat responses will be powered by state-of-the-art LLMs rather than keyword matching.

