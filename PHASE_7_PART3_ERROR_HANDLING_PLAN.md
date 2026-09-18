# Phase 7 Part 3: Advanced Error Handling — Implementation Plan

**Date Created:** 2026-05-23  
**Status:** 🚀 In Planning  
**Estimated Duration:** 45 minutes  
**Priority:** HIGH (Improves reliability)

---

## 🎯 Objective

Implement advanced error scenarios handling:
1. Timeout detection and recovery
2. Fallback responses when APIs fail
3. Offline mode detection
4. Advanced retry strategy with user feedback

---

## 📋 Requirements

### Current State
- Basic error handling (AuthError, RateLimitError, ModelNotFoundError)
- Automatic 3x retry with exponential backoff
- Simple error messages to user

### Target State
- 30-second timeout with user notification
- Fallback response when all APIs fail
- Network connectivity detection
- Retry with alternative models
- Clear user guidance for each error type

---

## 🔧 Implementation Steps

### Step 1: Timeout Handling (10 min)
**Goal:** Detect and handle API timeouts gracefully

**Approach:**
- Add timeout parameter to fetch calls (30 seconds default)
- Create TimeoutError class
- Show message: "Request timed out after 30s. Try again?"
- Cancel pending request on timeout
- Update stream state properly

**Changes:**
```typescript
// aiApiClient.ts
private readonly apiTimeout = 30000 // 30 seconds

const controller = new AbortController()
const timeoutId = setTimeout(() => controller.abort(), this.apiTimeout)

try {
  // API call with signal
} finally {
  clearTimeout(timeoutId)
}

// Custom error class
export class TimeoutError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TimeoutError'
  }
}
```

### Step 2: Fallback Responses (10 min)
**Goal:** Provide fallback when all APIs fail

**Approach:**
- Detect all-API-fail condition
- Show helpful message to user
- Suggest retry or model switch
- Log failure for debugging

**Changes:**
```typescript
// AIMode.tsx - in error handler
catch (error) {
  if (/* all providers failed */) {
    agentResponseContent = `❌ All services temporarily unavailable. 
    Please try again in a moment or select a different model.`
  }
  // ... other error types
}
```

### Step 3: Offline Detection (10 min)
**Goal:** Detect network connectivity

**Approach:**
- Check navigator.onLine
- Show message: "No internet connection detected"
- Disable send button
- Re-enable when network returns

**Changes:**
```typescript
// AIMode.tsx
const [isOnline, setIsOnline] = useState(navigator.onLine)

useEffect(() => {
  window.addEventListener('online', () => setIsOnline(true))
  window.addEventListener('offline', () => setIsOnline(false))
  return () => {
    window.removeEventListener('online', ...)
    window.removeEventListener('offline', ...)
  }
}, [])

// In send button:
disabled={!isOnline || ...}
```

### Step 4: Advanced Retry Strategy (10 min)
**Goal:** Smart retry with alternative models

**Approach:**
- If primary model fails, try another model from same provider
- Or try different provider entirely
- Show retry progress to user
- Show which model is being retried

**Changes:**
```typescript
// sendMessage() - enhanced error handling
try {
  // Try primary model
} catch (error) {
  if (shouldRetry(error)) {
    // Try alternative model
    try {
      // Call with backup model
    } catch {
      // All failed
    }
  }
}
```

---

## 🎨 UI/UX Improvements

### Timeout Message
- Icon: ⏱️ 
- Message: "Request timed out after 30s"
- Action: "Try again" button
- Toast: "Request timed out"

### Fallback Message
- Icon: ❌
- Message: "All services temporarily unavailable"
- Action: "Select different model" or "Try again"
- Toast: "Services unavailable"

### Offline Message
- Icon: 🌐 (with X)
- Message: "No internet connection"
- Action: Disabled send, wait for connection
- Toast: "Connection restored" when back online

### Retry Progress
- Show: "Retrying with [ModelName]..."
- Update every retry attempt
- Show final attempt status

---

## 📝 Code Changes

### File: `src/services/aiApiClient.ts`

**Add timeout and advanced error handling:**
```typescript
export class TimeoutError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TimeoutError'
  }
}

export class AllProvidersFailedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AllProvidersFailedError'
  }
}

export class AIApiClient {
  private readonly apiTimeout = 30000 // 30 seconds

  async sendMessage(options: AIClientOptions): Promise<APIResponse> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.apiTimeout)

    try {
      // API call with abort signal
      const response = await fetch(endpoint, {
        ...options,
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw new TimeoutError('Request timed out after 30 seconds')
      }
      throw error
    }
  }
}
```

### File: `src/components/modes/AIMode.tsx`

**Add offline detection and advanced error handling:**
```typescript
const [isOnline, setIsOnline] = useState(navigator.onLine)

useEffect(() => {
  const handleOnline = () => setIsOnline(true)
  const handleOffline = () => setIsOnline(false)
  
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
  
  return () => {
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
  }
}, [])

// In error handling:
catch (error) {
  if (error instanceof TimeoutError) {
    errorMsg = '⏱️ Request timed out after 30s. Try again?'
  } else if (error instanceof AllProvidersFailedError) {
    errorMsg = '❌ All services unavailable. Try different model?'
  } else if (!isOnline) {
    errorMsg = '🌐 No internet connection. Check your network.'
  }
  // ... other errors
}

// Disable send if offline:
disabled={!isOnline || !editor?.getText().trim() || isTyping}
```

---

## 🧪 Testing Checklist

- [ ] Timeout error after 30s
- [ ] Message shows timeout clearly
- [ ] Retry works after timeout
- [ ] Offline detection works
- [ ] Send button disabled when offline
- [ ] Toast shows on connectivity change
- [ ] Fallback message shown when all fail
- [ ] Retry with alternative model works
- [ ] No TypeScript errors
- [ ] UI responsive during all scenarios

---

## 🎯 Success Criteria

- ✅ Timeout handled gracefully after 30s
- ✅ User notified of all error types
- ✅ Offline detection working
- ✅ Fallback responses available
- ✅ Clear recovery instructions
- ✅ No TypeScript errors
- ✅ Performance: <100ms error handling
- ✅ All error paths tested

---

## 📊 Implementation Details

### Timeout Strategy
```typescript
const timeout = 30000 // 30 seconds
const controller = new AbortController()
setTimeout(() => controller.abort(), timeout)
```

### Error Priority
1. **Timeout** - Most urgent (30s wait)
2. **Offline** - Clear action (check network)
3. **AllProvidersFailed** - Fallback available (try another model)
4. **AuthError** - User action needed (add API key)
5. **RateLimitError** - Wait and retry
6. **ModelNotFoundError** - Choose different model
7. **NetworkError** - Automatic retry

### Retry Logic
```
Primary model fails
  ↓
Try model 2 from same provider
  ↓
Try model from different provider
  ↓
All failed → Show fallback message
```

---

## ⏱️ Time Breakdown

- **Timeout handling:** 10 min
- **Fallback responses:** 10 min
- **Offline detection:** 10 min
- **Advanced retry:** 10 min
- **Testing:** 5 min
- **Total:** ~45 minutes

---

**Ready to implement Part 3?** ✅
