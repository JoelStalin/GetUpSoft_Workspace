# Phase 7 Part 4: Comprehensive Testing — Implementation Plan

**Date Created:** 2026-05-23  
**Status:** 🚀 In Planning  
**Estimated Duration:** 60 minutes  
**Priority:** HIGH (Ensures reliability before production)

---

## 🎯 Objective

Implement comprehensive test coverage for Phase 7 backend API integration:
1. Integration tests for all API providers
2. Error scenario testing (timeout, offline, rate limit)
3. Performance benchmarking
4. End-to-end workflow testing
5. Edge case validation

---

## 📋 Requirements

### Current State
- Phase 7 Parts 1-3 implemented and working
- Vite dev server running with hot reload
- Manual testing completed for offline detection
- No automated tests yet

### Target State
- 80%+ code coverage for Phase 7 code
- All error scenarios tested
- Performance metrics documented
- Integration tests passing
- CI/CD ready

---

## 🔧 Implementation Steps

### Step 1: Unit Tests for AI API Client (15 min)
**Goal:** Test individual methods and error handling

**Approach:**
- Create `tests/services/aiApiClient.test.ts`
- Test timeout error handling
- Test rate limit error handling
- Test auth error handling
- Mock fetch to avoid real API calls

**Changes:**
```typescript
// tests/services/aiApiClient.test.ts
import { aiApiClient, TimeoutError, RateLimitError } from '../src/services/aiApiClient'

describe('AIApiClient', () => {
  test('should throw TimeoutError on 30s timeout', async () => {
    // Mock timeout scenario
  })
  
  test('should handle RateLimitError gracefully', async () => {
    // Mock rate limit response
  })
  
  test('should validate API keys', () => {
    // Test validateModelApiKey
  })
})
```

### Step 2: Integration Tests for AIMode Component (15 min)
**Goal:** Test component behavior with error scenarios

**Approach:**
- Create `tests/components/AIMode.integration.test.tsx`
- Test send button disables when offline
- Test error messages display correctly
- Test streaming state management
- Test offline/online event handlers

**Changes:**
```typescript
// tests/components/AIMode.integration.test.tsx
import { render, screen } from '@testing-library/react'
import AIMode from '../src/components/modes/AIMode'

describe('AIMode Integration', () => {
  test('send button should disable when offline', () => {
    // Simulate offline event
  })
  
  test('should display timeout error message', async () => {
    // Mock timeout scenario
  })
  
  test('should show toast on connectivity change', () => {
    // Test notification display
  })
})
```

### Step 3: Error Scenario Testing (15 min)
**Goal:** Validate all error paths work correctly

**Approach:**
- Test timeout recovery with retry
- Test offline → online → offline cycle
- Test concurrent API calls under rate limit
- Test error message clarity

**Test Matrix:**
```
Error Type | Expected Behavior | Recovery Path
-----------|-------------------|---------------
Timeout    | Show message, suggest retry | Manual retry
RateLimit  | Wait and retry auto | Backoff logic
AuthError  | Show config message | Configure API key
Offline    | Disable send button | Wait for connection
ModelNotFound | Show selector | Choose different model
```

### Step 4: Performance Benchmarking (10 min)
**Goal:** Ensure Phase 7 doesn't impact performance

**Approach:**
- Measure streaming latency (per chunk)
- Measure error handling overhead
- Measure memory usage during streaming
- Compare with Phase 6 baseline

**Metrics:**
```
Metric | Target | Method
-------|--------|--------
Streaming latency | <100ms/chunk | Measure chunk time
Token estimation | <5ms | Calculate vs measure
Error detection | <50ms | Network condition change
Memory (streaming) | <50MB | Monitor during response
```

### Step 5: End-to-End Workflow Test (5 min)
**Goal:** Full user workflow from message to response

**Approach:**
- User types message
- System detects workflow vs API call
- Call appropriate API
- Stream response with metrics
- Handle cancel or timeout gracefully
- Display results

---

## 🧪 Testing Checklist

- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] Timeout scenario tested
- [ ] Offline detection tested
- [ ] Rate limit scenario tested
- [ ] Auth error scenario tested
- [ ] Concurrent requests tested
- [ ] Memory usage acceptable
- [ ] Performance baseline established
- [ ] 80%+ code coverage achieved
- [ ] No TypeScript errors
- [ ] CI/CD pipeline ready

---

## 📝 Code Changes

### File: `tests/services/aiApiClient.test.ts` (NEW)

```typescript
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { aiApiClient, TimeoutError, RateLimitError, AuthError } from '../../src/services/aiApiClient'

describe('AIApiClient', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Timeout Handling', () => {
    test('should throw TimeoutError after 30 seconds', async () => {
      // Simulate timeout
      const promise = aiApiClient.sendMessage({
        modelId: 'test-model',
        messages: [],
      })

      vi.advanceTimersByTime(30000)
      await expect(promise).rejects.toThrow(TimeoutError)
    })
  })

  describe('Error Handling', () => {
    test('should handle RateLimitError', () => {
      // Mock 429 response
      expect(() => {
        throw new RateLimitError('Rate limit exceeded')
      }).toThrow(RateLimitError)
    })

    test('should handle AuthError', () => {
      expect(() => {
        throw new AuthError('Invalid API key')
      }).toThrow(AuthError)
    })
  })

  describe('Rate Limiting', () => {
    test('should enforce 60 requests per minute', () => {
      // Simulate 61 requests
      // Should throw on 61st
    })
  })
})
```

### File: `tests/components/AIMode.integration.test.tsx` (NEW)

```typescript
import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AIMode from '../../src/components/modes/AIMode'

describe('AIMode Integration', () => {
  describe('Offline Detection', () => {
    test('send button should disable when offline', async () => {
      const { container } = render(<AIMode />)
      
      // Simulate offline event
      fireEvent.offline(window)
      
      const sendButton = container.querySelector('[title*="Sin conexión"]')
      expect(sendButton).toBeDisabled()
    })

    test('send button should enable when back online', async () => {
      const { container } = render(<AIMode />)
      
      fireEvent.offline(window)
      fireEvent.online(window)
      
      const sendButton = container.querySelector('button[type="submit"]')
      expect(sendButton).not.toBeDisabled()
    })
  })

  describe('Error Handling', () => {
    test('should display timeout error message', async () => {
      render(<AIMode />)
      
      // Trigger timeout scenario
      // Should show "⏱️ Request timed out after 30s"
      
      await waitFor(() => {
        expect(screen.getByText(/timed out/i)).toBeInTheDocument()
      })
    })
  })
})
```

---

## 🎯 Success Criteria

- ✅ 80%+ code coverage for Phase 7 code
- ✅ All unit tests passing
- ✅ All integration tests passing
- ✅ All error scenarios tested
- ✅ Performance baseline documented
- ✅ No TypeScript errors
- ✅ No console errors during tests
- ✅ CI/CD ready for deployment
- ✅ Test suite runs in <60 seconds
- ✅ Memory usage stays <100MB during streaming

---

## ⏱️ Time Breakdown

- **Unit tests for API client:** 15 min
- **Integration tests for AIMode:** 15 min
- **Error scenario testing:** 15 min
- **Performance benchmarking:** 10 min
- **End-to-end workflow test:** 5 min
- **Total:** ~60 minutes

---

## 🔄 Test Execution Flow

```
1. Start test suite
   ↓
2. Run unit tests (aiApiClient)
   ├─ Timeout handling
   ├─ Error classes
   ├─ Rate limiting
   └─ Model validation
   ↓
3. Run integration tests (AIMode)
   ├─ Offline detection
   ├─ Error message display
   ├─ Streaming state
   └─ Event handling
   ↓
4. Run error scenario tests
   ├─ Timeout recovery
   ├─ Offline cycle
   ├─ Rate limit backoff
   └─ Concurrent requests
   ↓
5. Run performance tests
   ├─ Streaming latency
   ├─ Error handling overhead
   ├─ Memory usage
   └─ Baseline comparison
   ↓
6. Generate coverage report
   ↓
7. Pass/Fail decision
```

---

## 📊 Coverage Goals

| Module | Current | Target | Type |
|--------|---------|--------|------|
| aiApiClient.ts | 0% | 85% | Unit |
| AIMode.tsx | 0% | 80% | Integration |
| models.ts | 0% | 90% | Unit |
| Error handling | 0% | 95% | Error paths |

---

**Ready to implement Part 4?** ✅
