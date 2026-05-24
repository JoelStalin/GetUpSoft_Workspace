# Phase 7 Part 2: Streaming UI Enhancement — Implementation Plan

**Date Created:** 2026-05-23  
**Status:** 🚀 In Planning  
**Estimated Duration:** 45 minutes  
**Priority:** HIGH (Improves UX during API calls)

---

## 🎯 Objective

Enhance the streaming response UI to show real-time metrics:
1. Token count as response streams
2. Cost calculation in real-time
3. Cancel/stop button to interrupt streaming
4. Loading animation improvements

---

## 📋 Requirements

### Current State
- API client streams response chunks
- UI updates message as chunks arrive
- Placeholder `▌` shows while waiting
- No token counting
- No cost display
- No way to cancel mid-stream

### Target State
- Token count appears as text streams
- Estimated cost updates live
- Cancel button enabled during streaming
- Smooth typing animation
- Response timing indicator
- Character count badge

---

## 🔧 Implementation Steps

### Step 1: Token Counting (15 min)
**Goal:** Display token count as response streams

**Approach:**
- Add `tokensUsed` to API response
- Calculate approximate tokens from response text (1 token ≈ 4 characters)
- Update message metadata with token count
- Display in footer: "123 tokens" with ⚡ icon

**Changes:**
```typescript
// aiApiClient.ts - already returns tokensUsed
interface APIResponse {
  content: string
  tokensUsed: number  // ← Already here
  cost: number
  finishReason: string
}

// AIMode.tsx - add token tracking
const [streamTokens, setStreamTokens] = useState(0)
const estimateTokens = (text: string) => Math.ceil(text.length / 4)
```

### Step 2: Real-Time Cost Calculation (15 min)
**Goal:** Show estimated cost as streaming

**Approach:**
- Get model cost from config
- Calculate: `tokens * costPerToken`
- Update live in message footer
- Format as USD: "$0.00012"

**Changes:**
```typescript
// AIMode.tsx
const model = getModel(selectedModel)
const estimatedCost = streamTokens * model.costPerToken
const costDisplay = `$${estimatedCost.toFixed(6)}`
```

### Step 3: Cancel/Stop Button (10 min)
**Goal:** Let user interrupt long responses

**Approach:**
- Add AbortController to fetch calls
- Create "Cancel" button visible during streaming
- Clicking aborts the response stream
- Shows "Response interrupted" message
- Cleans up streaming state

**Changes:**
```typescript
// aiApiClient.ts
constructor() {
  this.abortController = new AbortController()
}

// AIMode.tsx
const handleCancelStream = () => {
  abortController.abort()
  setIsTyping(false)
  // Add message: "Response interrupted"
}
```

### Step 4: Loading Animation Improvements (5 min)
**Goal:** Better visual feedback during streaming

**Approach:**
- Animate placeholder `▌` with pulsing effect
- Add dots animation: `.` → `..` → `...` → repeat
- Show response time: "4.2s"
- Smooth character-by-character typing

---

## 💻 Code Changes

### File: `src/services/aiApiClient.ts`

**Add AbortController:**
```typescript
export class AIApiClient {
  private abortController: AbortController

  async streamMessage(options: AIClientOptions): AsyncGenerator<string> {
    this.abortController = new AbortController()
    
    // Pass signal to fetch calls
    const response = await fetch(endpoint, {
      ...options,
      signal: this.abortController.signal,  // ← NEW
    })
  }

  cancel(): void {
    this.abortController.abort()
  }
}
```

### File: `src/components/modes/AIMode.tsx`

**Add streaming state:**
```typescript
const [streamTokens, setStreamTokens] = useState(0)
const [streamStartTime, setStreamStartTime] = useState<number | null>(null)
const [streamElapsed, setStreamElapsed] = useState(0)

// In sendMessage()
for await (const chunk of stream) {
  streamedContent += chunk
  const newTokens = estimateTokens(streamedContent)
  setStreamTokens(newTokens)
  
  // Update elapsed time
  if (streamStartTime) {
    setStreamElapsed(Date.now() - streamStartTime)
  }
  
  // Update message with footer
  updateMessageFooter(newTokens, estimatedCost, streamElapsed)
}
```

**Add cancel button:**
```typescript
<button
  onClick={handleCancelStream}
  disabled={!isTyping}
  style={{/* styling */}}
>
  <X size={14} /> Cancel
</button>
```

**Update message footer:**
```typescript
// Show in chat bubble:
// ⚡ 247 tokens | 💰 $0.00074 | ⏱️ 3.2s
<div style={{fontSize: '11px', color: 'var(--stitch-muted)', marginTop: '8px'}}>
  ⚡ {streamTokens} tokens | 💰 ${estimatedCost.toFixed(6)} | ⏱️ {(streamElapsed/1000).toFixed(1)}s
</div>
```

---

## 🎨 UI/UX Improvements

### Token Count Display
- Icon: ⚡ (energy/computation)
- Format: "247 tokens"
- Updated live as streaming
- Hidden until stream starts

### Cost Display
- Icon: 💰 (money)
- Format: "$0.00074" (6 decimals)
- Updated as tokens accumulate
- Shows actual model cost
- Helps users understand API usage

### Response Time
- Icon: ⏱️ (timer)
- Format: "4.2s"
- Useful for comparing models
- Visible in message footer

### Cancel Button
- Red styling when active (during streaming)
- Disabled when not streaming
- Shows X icon
- Text: "Cancel"
- Positioned next to send button

### Loading Animation
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.loading-indicator {
  animation: pulse 1s ease-in-out infinite;
}
```

---

## 📊 Implementation Details

### Token Estimation
Since most APIs don't return exact token count in streaming:
- **Formula:** `Math.ceil(text.length / 4)`
- **Reasoning:** Average English token ≈ 4 characters
- **Accuracy:** ±15% (close enough for UX purposes)
- **Alternative:** Could add tokenizer library for accuracy

### Cost Calculation
```typescript
const calculateCost = (tokens: number, costPerToken: number): string => {
  const totalCost = tokens * costPerToken
  // Format with appropriate decimals
  return `$${totalCost.toFixed(totalCost > 0.01 ? 2 : 6)}`
}
```

### Abort Strategy
```typescript
try {
  const stream = aiApiClient.streamMessage({...})
  for await (const chunk of stream) {
    // If abort was called, this loop stops
  }
} catch (error) {
  if (error.name === 'AbortError') {
    // Handle cancellation gracefully
    addToast('Response interrupted', 'info')
  }
}
```

---

## 🧪 Testing Checklist

- [ ] Token count updates as text streams
- [ ] Cost calculation is accurate
- [ ] Cancel button stops streaming immediately
- [ ] Response time displayed correctly
- [ ] Placeholder animation smooth
- [ ] No memory leaks from timers
- [ ] Abort signal properly handled
- [ ] Messages retain metadata after cancel
- [ ] Works with all 3 API providers
- [ ] Mobile responsive (footer doesn't overflow)

---

## 🎯 Success Criteria

- ✅ Token count visible and updating live
- ✅ Cost displayed in real-time
- ✅ Cancel button functional
- ✅ Response time accurate
- ✅ No TypeScript errors
- ✅ Performance: < 100ms UI updates
- ✅ Memory clean on stream end/cancel
- ✅ Seamless UX during streaming

---

## 📝 Files to Modify

1. `src/services/aiApiClient.ts` - Add abort controller
2. `src/components/modes/AIMode.tsx` - Add UI for metrics and cancel

---

## ⏱️ Time Breakdown

- **Planning:** 5 min (done)
- **Token counting:** 12 min
- **Cost display:** 10 min
- **Cancel button:** 8 min
- **Animation improvements:** 5 min
- **Testing:** 5 min
- **Total:** ~45 minutes

---

**Ready to implement Part 2?** ✅
