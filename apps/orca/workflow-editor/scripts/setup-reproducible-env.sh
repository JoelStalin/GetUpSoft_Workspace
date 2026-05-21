#!/bin/bash
# Setup complete reproducible development environment for ORCA Workflow Editor

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="$PROJECT_ROOT/logs/setup-$TIMESTAMP.log"

mkdir -p "$PROJECT_ROOT/logs"

{
  echo "🔧 ORCA Workflow Editor - Reproducible Environment Setup"
  echo "=========================================================="
  echo "Project: $PROJECT_ROOT"
  echo "Timestamp: $TIMESTAMP"
  echo ""

  # 1. Check Node.js version
  echo "1️⃣  Checking Node.js..."
  NODE_VERSION=$(node -v)
  echo "   Node.js: $NODE_VERSION"

  # Extract version number for comparison
  NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1 | cut -dv -f2)
  if [ "$NODE_MAJOR" -lt 18 ]; then
    echo "   ⚠️  Warning: Node 18+ recommended (you have $NODE_MAJOR)"
  else
    echo "   ✅ Node version OK"
  fi

  NPM_VERSION=$(npm -v)
  echo "   npm: $NPM_VERSION"
  echo ""

  # 2. Install dependencies (reproducible with package-lock.json)
  echo "2️⃣  Installing dependencies..."
  if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
    npm ci  # Use package-lock.json for exact reproduction
    echo "   ✅ Dependencies installed"
  else
    echo "   ✅ Dependencies already installed"
  fi
  echo ""

  # 3. Setup environment variables
  echo "3️⃣  Setting up environment variables..."
  if [ ! -f "$PROJECT_ROOT/.env.local" ]; then
    if [ -f "$PROJECT_ROOT/.env.example" ]; then
      cp "$PROJECT_ROOT/.env.example" "$PROJECT_ROOT/.env.local"
      echo "   ✅ Created .env.local from template"
      echo "   ⚠️  Please configure .env.local with your API keys"
    else
      cat > "$PROJECT_ROOT/.env.local" << EOF
# ORCA Workflow Editor Environment Variables
VITE_API_BASE=http://localhost:8000/api
VITE_WEBSOCKET_URL=ws://localhost:8000/ws
VITE_MODE=development
EOF
      echo "   ✅ Created .env.local with defaults"
    fi
  else
    echo "   ✅ .env.local already exists"
  fi
  echo ""

  # 4. Create necessary directories
  echo "4️⃣  Creating test directories..."
  mkdir -p "$PROJECT_ROOT/tests/unit"
  mkdir -p "$PROJECT_ROOT/tests/integration"
  mkdir -p "$PROJECT_ROOT/tests/selenium"
  mkdir -p "$PROJECT_ROOT/tests/e2e"
  mkdir -p "$PROJECT_ROOT/tests/fixtures"
  mkdir -p "$PROJECT_ROOT/coverage"
  mkdir -p "$PROJECT_ROOT/test-results"
  mkdir -p "$PROJECT_ROOT/test-results/screenshots"
  mkdir -p "$PROJECT_ROOT/docs/phases"
  mkdir -p "$PROJECT_ROOT/logs"
  echo "   ✅ Directories created"
  echo ""

  # 5. Initialize progress tracking
  echo "5️⃣  Initializing progress tracking..."
  if [ ! -f "$PROJECT_ROOT/progress.json" ]; then
    echo "   ⚠️  progress.json not found - create it from template"
  else
    echo "   ✅ progress.json exists"
  fi
  echo ""

  # 6. Setup git hooks
  echo "6️⃣  Setting up git hooks..."
  mkdir -p "$PROJECT_ROOT/.git/hooks"

  # Pre-commit hook
  cat > "$PROJECT_ROOT/.git/hooks/pre-commit" << 'HOOK'
#!/bin/bash
set -e

echo "🔍 Running pre-commit checks..."

npm run typecheck || { echo "❌ TypeScript check failed"; exit 1; }
npm run lint || { echo "❌ Linting failed"; exit 1; }

echo "✅ Pre-commit checks passed"
HOOK

  chmod +x "$PROJECT_ROOT/.git/hooks/pre-commit"
  echo "   ✅ Git hooks installed"
  echo ""

  # 7. Verify setup
  echo "7️⃣  Verifying setup..."
  npm run typecheck && echo "   ✅ TypeScript check passed" || echo "   ⚠️  TypeScript check needs attention"
  npm run lint && echo "   ✅ Linting passed" || echo "   ⚠️  Linting needs attention"
  echo ""

  # 8. Display setup summary
  echo "=========================================================="
  echo "✅ Environment Setup Complete!"
  echo "=========================================================="
  echo ""
  echo "System Information:"
  echo "  Node.js: $NODE_VERSION"
  echo "  npm: $NPM_VERSION"
  echo "  OS: $(uname -s)"
  echo "  Architecture: $(uname -m)"
  echo ""
  echo "Directories Created:"
  echo "  - $PROJECT_ROOT/tests/"
  echo "  - $PROJECT_ROOT/coverage/"
  echo "  - $PROJECT_ROOT/logs/"
  echo "  - $PROJECT_ROOT/docs/phases/"
  echo ""
  echo "Next Steps:"
  echo "1. Review .env.local and configure API keys"
  echo "2. npm run dev      - Start development server"
  echo "3. npm run test     - Run all tests"
  echo "4. npm run build    - Build for production"
  echo ""
  echo "Useful Commands:"
  echo "  npm run typecheck - Run TypeScript type checking"
  echo "  npm run lint      - Run ESLint"
  echo "  npm run format    - Format code with Prettier"
  echo "  npm run test      - Run test suite"
  echo "  ./scripts/run-tests.sh 2 - Run Phase 2 tests"
  echo "  ./scripts/init-phase.sh 3 'Phase Name' - Initialize Phase 3"
  echo ""
  echo "Documentation:"
  echo "  - REPRODUCTION.md      - How to reproduce this setup"
  echo "  - complete_audit_and_plan.md - Full audit and plan"
  echo "  - nemo_integration_strategy.md - NeMo integration plan"
  echo ""
  echo "Log file: $LOG_FILE"
  echo ""

} 2>&1 | tee "$LOG_FILE"
