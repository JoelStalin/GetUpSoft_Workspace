#!/bin/bash

# Smoke Tests for GetUpSoft Website Redesign
# Runs quick validation tests after deployment
# Usage: ./tests/smoke-tests.sh [URL]

set -e

URL="${1:-https://getupsoft.com}"
TIMEOUT=30
PASS=0
FAIL=0

echo "🔍 Running smoke tests on $URL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test 1: Homepage
echo -n "1. Testing homepage... "
if curl -f -s -m $TIMEOUT "$URL/redesign/" > /dev/null 2>&1; then
  echo "✅"
  ((PASS++))
else
  echo "❌"
  ((FAIL++))
fi

# Test 2: Products page
echo -n "2. Testing products page... "
if curl -f -s -m $TIMEOUT "$URL/redesign/products" > /dev/null 2>&1; then
  echo "✅"
  ((PASS++))
else
  echo "❌"
  ((FAIL++))
fi

# Test 3: Solutions page
echo -n "3. Testing solutions page... "
if curl -f -s -m $TIMEOUT "$URL/redesign/solutions" > /dev/null 2>&1; then
  echo "✅"
  ((PASS++))
else
  echo "❌"
  ((FAIL++))
fi

# Test 4: About page
echo -n "4. Testing about page... "
if curl -f -s -m $TIMEOUT "$URL/redesign/about" > /dev/null 2>&1; then
  echo "✅"
  ((PASS++))
else
  echo "❌"
  ((FAIL++))
fi

# Test 5: Contact form
echo -n "5. Testing contact form... "
if curl -f -s -m $TIMEOUT "$URL/redesign/contact" > /dev/null 2>&1; then
  echo "✅"
  ((PASS++))
else
  echo "❌"
  ((FAIL++))
fi

# Test 6: Diagnostic form
echo -n "6. Testing diagnostic form... "
if curl -f -s -m $TIMEOUT "$URL/redesign/diagnostic" > /dev/null 2>&1; then
  echo "✅"
  ((PASS++))
else
  echo "❌"
  ((FAIL++))
fi

# Test 7: Health endpoint (if running on port 3120)
echo -n "7. Testing health endpoint... "
if curl -f -s -m $TIMEOUT "http://localhost:3120/health" > /dev/null 2>&1; then
  echo "✅"
  ((PASS++))
else
  echo "⚠️  (local only)"
fi

# Test 8: Response time (should be <2s)
echo -n "8. Testing response time... "
START=$(date +%s%N)
curl -f -s -m $TIMEOUT "$URL/redesign/" > /dev/null 2>&1
END=$(date +%s%N)
DURATION=$(( ($END - $START) / 1000000 ))
if [ $DURATION -lt 2000 ]; then
  echo "✅ (${DURATION}ms)"
  ((PASS++))
elif [ $DURATION -lt 5000 ]; then
  echo "⚠️  (${DURATION}ms - acceptable)"
  ((PASS++))
else
  echo "❌ (${DURATION}ms - slow)"
  ((FAIL++))
fi

# Test 9: HTTP status codes
echo -n "9. Testing HTTP status codes... "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -m $TIMEOUT "$URL/redesign/")
if [ "$STATUS" = "200" ]; then
  echo "✅ (200 OK)"
  ((PASS++))
else
  echo "❌ ($STATUS)"
  ((FAIL++))
fi

# Test 10: Page contains expected content
echo -n "10. Testing page content... "
CONTENT=$(curl -s -m $TIMEOUT "$URL/redesign/" | grep -c "GetUpSoft" || true)
if [ $CONTENT -gt 0 ]; then
  echo "✅"
  ((PASS++))
else
  echo "❌ (content not found)"
  ((FAIL++))
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Results: ✅ $PASS passed, ❌ $FAIL failed"

if [ $FAIL -eq 0 ]; then
  echo "✅ All smoke tests passed!"
  exit 0
else
  echo "❌ Some tests failed"
  exit 1
fi
