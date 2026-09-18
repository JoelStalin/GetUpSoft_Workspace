# Phase 11: Code Review Standards & Guidelines

**Purpose:** Ensure consistent code quality during Phase 11 implementation  
**Audience:** Developers, Code Reviewers, QA  
**Effective:** 2026-05-27 (Phase 11 start)  
**Status:** MANDATORY

---

## Code Review Process

### PR Workflow

```
1. Developer creates PR with:
   - Descriptive title (<70 chars)
   - Detailed description
   - References to tests
   - Screenshots if UI changes
   
2. PR automatically:
   - Runs full test suite (347 Phase 10 + 73 Phase 11)
   - Checks TypeScript compilation
   - Analyzes bundle size impact
   - Runs linter
   
3. Code Review:
   - Minimum 2 approvals required
   - All CI checks must pass
   - No approved comments allowed
   
4. Merge:
   - Squash commits recommended
   - Include test results in merge message
   - Reference PR number
```

### Reviewer Responsibilities

**Primary Reviewer:**
- Deep technical review
- Check architecture alignment
- Verify test coverage
- Performance impact assessment
- Security review

**Secondary Reviewer:**
- Cross-check primary review
- Code style consistency
- Documentation completeness
- Regression risk assessment

### SLA for Reviews

- First review within: 2 hours
- Approval/changes within: 4 hours
- Emergency PRs: 30 minutes (paged)

---

## Mandatory Checks

### ✅ Tests

**MUST PASS:**
- [ ] New tests added for new code
- [ ] All Phase 11 tests passing (73/73)
- [ ] All Phase 10 tests passing (347/347)
- [ ] Test coverage >85% for new code
- [ ] No skipped/todo tests in PR

**REJECTION CRITERIA:**
```
❌ PR rejected if:
- Any test fails
- Coverage drops below 85%
- Skipped tests included (.skip, .todo)
- Testing edge cases missing
```

### ✅ TypeScript

**MUST PASS:**
- [ ] No TypeScript errors
- [ ] Strict mode enabled
- [ ] No `any` types (unless justified)
- [ ] All types exported in index
- [ ] No unused variables

**COMMAND:**
```bash
npm run type-check
```

**REJECTION CRITERIA:**
```
❌ PR rejected if:
- tsc reports errors
- Untyped third-party dependency
- Uses `any` without comment
- Type errors in tests
```

### ✅ Linting

**MUST PASS:**
- [ ] ESLint: 0 errors
- [ ] Prettier formatted
- [ ] No unused imports
- [ ] Consistent naming

**COMMANDS:**
```bash
npm run lint
npm run lint:fix
```

**REJECTION CRITERIA:**
```
❌ PR rejected if:
- ESLint errors
- Unformatted code
- Unused imports
```

### ✅ Bundle Size

**MUST PASS:**
- [ ] Bundle doesn't exceed limits
- [ ] No new bloat detected
- [ ] Tree-shaking working
- [ ] Code splitting applied

**TARGETS:**
- Initial: <200KB gzip (current tracking)
- Per-chunk: <150KB each
- Max increase per PR: +10KB gzip

**COMMANDS:**
```bash
npm run build -- --report
# Check dist/report.html
```

**REJECTION CRITERIA:**
```
❌ PR rejected if:
- Bundle size increases >10KB gzip
- No explanation for increase
- Large unused dependencies
```

### ✅ Performance

**MUST PASS:**
- [ ] Load time maintained
- [ ] Mode switching <600ms
- [ ] ML pipeline <400ms
- [ ] No regressions from Phase 10

**BENCHMARKING:**
```bash
npm test -- tests/phase11/step1.performance.test.ts
npm test -- tests/phase11/step4.enhancedML.test.ts
```

**REJECTION CRITERIA:**
```
❌ PR rejected if:
- Performance degrades >10%
- Load time exceeds 2.5s
- Mode switching >700ms
- ML pipeline >400ms
```

---

## Code Quality Checklist

### Architecture & Design

- [ ] Follows existing patterns (services, hooks, components)
- [ ] No duplicated code (DRY principle)
- [ ] Single responsibility per function
- [ ] Clear separation of concerns
- [ ] No circular dependencies

**REJECTION CRITERIA:**
```
❌ Not approved if:
- Architectural inconsistency
- Major code duplication
- Functions exceed 50 lines
- Circular imports detected
```

### Error Handling

- [ ] All async operations have error handling
- [ ] User-facing errors have messages
- [ ] Logging captures context
- [ ] No silent failures
- [ ] Graceful degradation implemented

**EXAMPLES:**

```typescript
// ❌ DON'T
const data = await fetch('/api/data');

// ✅ DO
try {
  const response = await fetch('/api/data');
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  return await response.json();
} catch (error) {
  logger.error('Failed to fetch data', { error });
  return null;
}
```

### Security

- [ ] No hardcoded secrets/API keys
- [ ] Input validation on all user input
- [ ] Output encoding for HTML context
- [ ] CORS headers properly configured
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention verified

**REJECTION CRITERIA:**
```
❌ Blocked immediately if:
- Secrets in code
- SQL injection vulnerability
- XSS vulnerability
- Unvalidated user input
```

### Accessibility

- [ ] ARIA labels on interactive elements
- [ ] Keyboard navigation working
- [ ] Color contrast ≥4.5:1 (WCAG AA)
- [ ] Focus states visible
- [ ] Screen reader tested

**TESTING:**
```bash
# Run accessibility checks
npm run a11y

# Manual testing
- Tab through page
- Check color contrast
- Test with screen reader
```

### Documentation

- [ ] Complex logic has comments (WHY, not WHAT)
- [ ] JSDoc for public functions
- [ ] README updated if feature changes
- [ ] API docs updated
- [ ] Changelog entry added

**EXAMPLES:**

```typescript
// ❌ DON'T
const x = y + 5;  // Add 5 to y

// ✅ DO
// Bias correction factor applied per ARIMA standard
const adjustedValue = baselineValue + ARIMA_BIAS_CORRECTION;

/**
 * Calculates EMA with specified alpha factor.
 * @param data - Historical cost data sorted by timestamp
 * @param alpha - Smoothing factor (0-1, typically 0.2)
 * @returns EMA value for latest period
 */
export function calculateEMA(data: CostData[], alpha: number): number {
  // Implementation...
}
```

---

## Review Comment Types

### 1. MUST FIX (🔴)

**Block the PR.** Reviewer marks as "Request changes."

```
🔴 MUST FIX: Error handling missing for this async call
```

### 2. SHOULD FIX (🟡)

**Approve but suggest improvement.** Reviewer comments with suggestion.

```
🟡 SHOULD FIX: Consider extracting this to utility function for reuse
```

### 3. NICE TO HAVE (🟢)

**FYI/discussion only.** No approval impact.

```
🟢 NICE TO HAVE: This pattern also works with async/await
```

### 4. PRAISE (⭐)

**Acknowledge good work.**

```
⭐ Love the performance optimization here!
```

---

## Review Checklist Template

```markdown
## Code Review Checklist

### Functionality
- [ ] Matches PR description
- [ ] Solves the stated problem
- [ ] No side effects
- [ ] Backward compatible

### Quality
- [ ] Tests passing (73 Phase 11 + 347 Phase 10)
- [ ] TypeScript strict mode
- [ ] No linting errors
- [ ] Coverage >85%
- [ ] No console.log() (except dev)

### Performance
- [ ] Bundle size acceptable
- [ ] Load time maintained
- [ ] Algorithms efficient
- [ ] No memory leaks

### Security
- [ ] No hardcoded secrets
- [ ] Input validated
- [ ] CORS secure
- [ ] SQL injection prevented

### Documentation
- [ ] Code comments for complex logic
- [ ] JSDoc on public APIs
- [ ] README updated
- [ ] Changelog entry

### Architecture
- [ ] Follows project patterns
- [ ] No code duplication
- [ ] Clear dependencies
- [ ] Single responsibility

### Accessibility
- [ ] ARIA labels present
- [ ] Keyboard navigation working
- [ ] Color contrast verified
- [ ] Screen reader tested

## Verdict
- [ ] ✅ APPROVED
- [ ] 🟡 APPROVED WITH SUGGESTIONS
- [ ] ❌ REQUEST CHANGES
```

---

## Common Issues & How to Fix

### Issue: "Coverage is below 85%"

**What to do:**
1. Check coverage report: `npm test -- --coverage`
2. Add tests for uncovered lines
3. Focus on logic branches, not line coverage

**Example:**
```typescript
// Missing: error case test
if (!user) throw new Error('User not found');

// Add test
it('should throw error if user not found', () => {
  expect(() => getUser(null)).toThrow('User not found');
});
```

### Issue: "Bundle size increased >10KB"

**What to do:**
1. Run `npm run build -- --report`
2. Check webpack analyzer for bloat
3. Find the culprit:
   - New dependency added?
   - Unused code included?
   - Component not code-split?

**Solutions:**
```typescript
// ❌ Before: Loads all dependencies upfront
import * as lodash from 'lodash';

// ✅ After: Lazy import what's needed
import { debounce } from 'lodash-es';

// ✅ Or: Code split lazy component
const HeavyComponent = React.lazy(() => import('./Heavy'));
```

### Issue: "Performance test failed: Load time >2.5s"

**What to do:**
1. Check what changed in the PR
2. Profile in DevTools:
   - Open Performance tab
   - Record page load
   - Find bottleneck
3. Optimize or revert change

### Issue: "TypeScript error: Variable has unknown type"

**What to do:**
1. Add explicit type annotation
2. OR understand why type inference fails
3. Avoid `any` without comment

```typescript
// ❌ DON'T
const data = response.json();

// ✅ DO
const data: CostData[] = await response.json();

// ✅ OR with justification
const data: any = require('./config'); // TODO: type this when migrating
```

---

## Special Review Cases

### Database Migrations

**ADDITIONAL CHECKS:**
- [ ] Migration reversible
- [ ] Data loss prevented
- [ ] Tested on production-like data
- [ ] Backfill tested
- [ ] Performance impact assessed

### API Changes

**ADDITIONAL CHECKS:**
- [ ] Backward compatible
- [ ] Deprecation path clear
- [ ] API docs updated
- [ ] Client code updated
- [ ] Migration guide provided

### ML Algorithm Changes

**ADDITIONAL CHECKS:**
- [ ] Accuracy verified
- [ ] Edge cases handled
- [ ] Performance benchmarked
- [ ] Tuning parameters documented
- [ ] Baseline comparison tested

### Security Fixes

**EXPEDITED REVIEW:**
- Page reviewer immediately
- 30-minute SLA
- Security team sign-off required
- May merge with single approval if critical

---

## Post-Merge Responsibilities

### Developer

- [ ] Monitor CI/CD pipeline
- [ ] Watch for post-merge test failures
- [ ] Be available for issues
- [ ] Update PR with results if needed

### Reviewer

- [ ] Verify deployed safely
- [ ] Check production metrics
- [ ] Watch for regressions
- [ ] Be available for rollback decision

---

## Review Excellence Examples

### ✅ Excellent Review Comment

```markdown
🔴 MUST FIX: The API call in useEffect could fail silently.

Currently:
```javascript
useEffect(() => {
  fetchData();
}, []);
```

Issue: If fetchData() throws, component breaks with no error message.

Suggestion:
```javascript
useEffect(() => {
  (async () => {
    try {
      await fetchData();
    } catch (error) {
      setError(error.message);
      logger.error('Failed to fetch', { error });
    }
  })();
}, []);
```

Alternatively, use React Query's error handling.

Test: Add test for error case:
```typescript
it('should handle fetch error', async () => {
  // Mock fetchData to throw
  // Verify error message displayed
});
```
```

### ❌ Poor Review Comment

```
Bad error handling
```

### ✅ Constructive Suggestion

```markdown
🟡 SHOULD FIX: This utility function could be reused elsewhere.

Consider moving `calculateCost()` to a shared utilities file since it's also used in the Analytics component.

No blocker though - this is just for future maintainability.
```

### ❌ Vague Criticism

```
This doesn't look right
```

---

## Escalation Path

**If reviewer and author disagree:**

1. Discuss in PR comments (technical discussion)
2. If unresolved after 4 comments, ping tech lead
3. Tech lead makes final decision
4. Document decision in PR

**If quality gate failing:**

1. PR author confirms CI passed locally
2. Reviewer reruns CI
3. If persists, escalate to DevOps
4. Tech lead decides: fix or waive

---

## Metrics

Track these to improve review process:

- Average review time (target: <4 hours)
- Approval rate (target: >90% on first pass)
- Regression rate from merged PRs (target: 0%)
- Comments per PR (target: 3-5)

---

## Review Training

**New reviewers must:**
1. Review this guide
2. Do 5 supervised reviews
3. Pass review test (quiz)
4. Get sign-off from tech lead

---

**Version:** 1.0  
**Created:** 2026-05-24  
**Author:** Claude Haiku 4.5  
**Effective:** 2026-05-27 (Phase 11 Start)
