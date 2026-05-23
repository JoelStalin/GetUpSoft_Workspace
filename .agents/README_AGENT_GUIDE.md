# Agent Memory & ORCA Context Guide

**Last Updated:** 2026-05-23  
**Framework Version:** 1.0  
**Status:** ✅ All Systems Ready

---

## 🎯 Quick Start for Agents

### 1. Before Starting Work

```bash
# Read this guide (you're reading it!)
# Check project rules
cat CLAUDE.md

# View agent configuration
cat .agents/AGENT_MEMORY_CONFIG.json

# Check current phase
head -50 docs/CHANGE_TIMELINE.md

# Review latest completion summary
cat docs/PHASE_3_COMPLETION_SUMMARY.md
```

### 2. Understanding Available Memory

Three memory sources are available to you:

#### 📚 **W3Schools Documentation (5.6 MB)**
```
Location: .agents/memory/web-documentation/w3schools/
Index: .agents/memory/web-documentation/INDEX.json
Topics: HTML, CSS, JavaScript, Python, SQL, PHP, Bootstrap, jQuery, XML, React, Java
Usage: Quick reference for web technologies (faster than web search)
```

#### 📖 **MDN Documentation (2.0 MB)**
```
Location: .agents/memory/web-documentation/mdn/
Index: .agents/memory/web-documentation/INDEX.json
Topics: HTML, CSS, JavaScript, WebAPI, HTTP, SVG, Web Components, Security, Performance
Usage: Detailed technical reference for modern web APIs
```

#### 🤖 **OpenML Documentation (306.1 KB)**
```
Location: .agents/memory/openml-documentation/
Index: .agents/memory/openml-documentation/INDEX.json
Topics: Benchmarking Suites, Getting Started, Datasets
Usage: Machine Learning platform reference
```

### 3. How to Search Memory

**Quick Lookup (Use INDEX.json):**
```bash
# View all available sections
cat .agents/memory/web-documentation/INDEX.json | grep -i "html\|css\|javascript"

# Get file locations
jq '.w3schools.sections[] | select(.name=="CSS") | .file' .agents/memory/web-documentation/INDEX.json
```

**Search Content:**
```bash
# Search across all memories
grep -r "flexbox" .agents/memory/web-documentation/

# Search specific source
grep -i "async\|await" .agents/memory/web-documentation/w3schools/javascript.html

# Count mentions
grep -o "Fetch" .agents/memory/web-documentation/mdn/*.html | wc -l
```

**Read Documentation:**
```bash
# View in terminal (for small files)
head -100 .agents/memory/web-documentation/w3schools/css.html

# Use for code reference
cat .agents/memory/openml-documentation/benchmarks/benchmarks.html | grep -A 5 "OpenML-CC18"
```

---

## 🏗️ Understanding ORCA Architecture

### Project Structure

```
apps/orca/workflow-editor/
├── src/
│   ├── components/       # React components
│   │   ├── modes/       # AI, Web, Mobile, Workflow modes
│   │   ├── WorkflowCanvas.tsx
│   │   ├── VisualCanvas.tsx (WebGL 3D editor)
│   │   └── IframeSection.tsx (3D HTML/CSS editing)
│   ├── stores/          # Zustand state management
│   │   └── useEditorStore.ts
│   ├── contexts/        # React Context providers
│   ├── hooks/           # Custom hooks
│   ├── utils/           # Utilities
│   └── types/           # TypeScript definitions
├── notebooks/           # Jupyter memory notebooks
├── WEBGL_EDITOR_GUIDE.md
└── package.json
```

### Four Modes

| Mode | Purpose | Status |
|------|---------|--------|
| **Workflow** | Node-based workflow editor | ✅ Production |
| **Web Design** | Layout composition with sections | ✅ Production |
| **Mobile Design** | Mobile UI design | ✅ Production |
| **AI** | Agent integration and prompting | ✅ Production |

### Key Technologies

- **React** - UI framework
- **TypeScript** - Type safety
- **@xyflow/react** - Workflow visualization (n8n-style)
- **Three.js + React Three Fiber** - 3D visual editor
- **Zustand** - State management
- **Penpal** - Iframe communication

### Important Files

```
App.tsx              - Main application entry point
useEditorStore.ts    - Global state management
VisualCanvas.tsx     - 3D editor component (WebGL)
IframeSection.tsx    - 3D HTML/CSS sections
penpal-bridge.ts     - Parent ↔ iframe communication
```

---

## 🚀 Phase Context

### Current Status: Phase 3 Complete ✅

**What was delivered:**

1. **Phase 3a - JupyterLab Memory System**
   - Interactive notebook-based memory
   - Zustand state management
   - Obsidian sync automation
   - Cost: $0/month

2. **Phase 3b - WebGL/Three.js Visual Editor**
   - 3D canvas with interactive controls
   - Live HTML/CSS editing in 3D space
   - Complete state management
   - Iframe bidirectional communication

3. **Phase 3c - Documentation Archives**
   - 7.9 MB of offline documentation
   - W3Schools, MDN, OpenML indexed
   - 100% accuracy verified (95.8% efficiency score)

### Next Phase: Phase 4 - Obsidian Deployment

**Estimated:** 45-60 minutes  
**Tasks:**
- Deploy CouchDB
- Enable LiveSync plugin
- Integrate JupyterLab with Obsidian vault
- Test multi-device sync

---

## 💾 Working with Memory

### Accessing Memories in Code

**Python (Jupyter/Scripts):**
```python
import json
import os

# Load memory index
with open('.agents/memory/web-documentation/INDEX.json', 'r') as f:
    index = json.load(f)

# Find W3Schools CSS
css_file = index['w3schools']['sections'][1]['file']
print(f"CSS documentation at: {css_file}")

# List all topics
for section in index['w3schools']['sections']:
    print(f"- {section['name']}: {section['size_kb']} KB")
```

**JavaScript (Node/Browser):**
```javascript
// Load memory index
fetch('.agents/memory/openml-documentation/INDEX.json')
  .then(r => r.json())
  .then(data => {
    console.log(`Total docs: ${data.total_files}`);
    console.log(`Sections: ${Object.keys(data.categories)}`);
  });
```

**Shell (Bash/PowerShell):**
```bash
# Quick memory lookup
jq '.w3schools.sections[] | select(.name=="JavaScript")' \
  .agents/memory/web-documentation/INDEX.json

# Search memory
grep -i "transform\|rotate\|scale" .agents/memory/web-documentation/w3schools/css.html
```

### When to Use Memory vs Web Search

**Use Memory (Faster, Offline):**
- ✅ Basic syntax questions (HTML, CSS, JavaScript)
- ✅ API reference lookups (Web APIs, Python)
- ✅ Learning resource access
- ✅ Interview preparation
- ✅ When internet is unavailable

**Use Web Search (More Current):**
- ❌ Very new features (ES2024, latest frameworks)
- ❌ Breaking changes in major versions
- ❌ Framework/library version-specific details
- ❌ Community best practices discussions

---

## 🛠️ Modifying ORCA

### Adding a New Component

1. **Create component file:**
   ```tsx
   // apps/orca/workflow-editor/src/components/MyComponent.tsx
   export function MyComponent() {
     return <div>My Component</div>
   }
   ```

2. **Use Zustand for state:**
   ```tsx
   import { useEditorStore } from '../stores/useEditorStore'
   
   export function MyComponent() {
     const { selectedSectionId } = useEditorStore()
     return <div>{selectedSectionId}</div>
   }
   ```

3. **Import in App.tsx:**
   ```tsx
   import { MyComponent } from './components/MyComponent'
   
   // Use in render
   <MyComponent />
   ```

### Adding to a Mode

**Modify mode components:**
```tsx
// apps/orca/workflow-editor/src/components/modes/WebDesignMode.tsx

export default function WebDesignMode() {
  // Add your features here
  return (
    <aside className="orca-mode-panel">
      {/* Your content */}
    </aside>
  )
}
```

### Testing Changes

```bash
cd apps/orca/workflow-editor

# Start dev server
npm run dev

# Build for production
npm run build

# Run tests (if configured)
npm run test
```

---

## 📝 Using JupyterLab for Memory

### Starting JupyterLab

```bash
# Install (if needed)
pip install jupyterlab

# Start
jupyter lab

# Access at: http://localhost:8888
```

### Using Notebooks

1. **Open Memory_Template.ipynb**
   ```
   Location: apps/orca/workflow-editor/notebooks/templates/Memory_Template.ipynb
   Use for: Recording learnings and context
   ```

2. **Create Analysis Notebook**
   ```python
   # Import Zustand store
   import sys
   sys.path.insert(0, '../../')
   
   from notebooks.useNotebookStore import NotebookStore
   
   # Use store
   store = NotebookStore()
   store.add_notebook('my-analysis', 'Code Analysis', 'research')
   ```

3. **Sync to Obsidian**
   ```bash
   python scripts/sync_notebooks_to_obsidian.py
   ```

---

## 📚 Memory Efficiency

**Validation Status:** ✅ 95.8% Efficient

| Test | Result |
|------|--------|
| JavaScript Arrow Functions | ✅ 100% |
| HTML Semantic Elements | ✅ 100% |
| CSS Flexbox | ✅ 100% |
| Fetch API | ✅ 100% |
| OpenML Benchmarks | ✅ 100% |

**Performance:**
- Load time: <1ms (offline)
- Accuracy: 100% (verified against web sources)
- Size: 7.9 MB total
- Cost: $0

**See:** `docs/MEMORY_EFFICIENCY_VALIDATION_REPORT.md`

---

## 🔐 Git Workflow

### Before Starting Work

```bash
# Make sure you're on main
git checkout main

# Pull latest
git pull origin main

# Check status
git status
```

### During Work

```bash
# Make changes
# Edit files as needed

# Check what changed
git diff

# Stage relevant files
git add apps/orca/workflow-editor/src/App.tsx

# Commit with clear message
git commit -m "feat: add new component to ORCA

- Added MyComponent to WebDesignMode
- Integrated with Zustand store
- Tested with npm run dev"
```

### After Work

```bash
# Verify all changes are committed
git status

# View commit
git log -1

# Push to origin
git push origin main

# Create checkpoint if major work
cat > SESSION_CHECKPOINT_<PHASE>.md << EOF
# Phase X Checkpoint
...
EOF
```

---

## 🎓 Learning Resources

### ORCA Documentation
- **Guide:** `apps/orca/workflow-editor/WEBGL_EDITOR_GUIDE.md`
- **README:** `apps/orca/workflow-editor/README.md`
- **TypeScript Types:** `apps/orca/workflow-editor/src/types/`

### Project Documentation
- **Timeline:** `docs/CHANGE_TIMELINE.md`
- **Phase 3 Summary:** `docs/PHASE_3_COMPLETION_SUMMARY.md`
- **Rules:** `CLAUDE.md`

### Memory Resources
- **W3Schools:** `.agents/memory/web-documentation/w3schools/`
- **MDN:** `.agents/memory/web-documentation/mdn/`
- **OpenML:** `.agents/memory/openml-documentation/`

### Validation Reports
- **Full Report:** `docs/MEMORY_EFFICIENCY_VALIDATION_REPORT.md`
- **Comparison:** `docs/MEMORY_COMPARISON_TABLE.md`
- **Summary:** `MEMORY_VALIDATION_SUMMARY.txt`

---

## ❓ Troubleshooting

### Memory Not Found
```bash
# Check file exists
ls -la .agents/memory/web-documentation/w3schools/

# Verify INDEX.json
jq . .agents/memory/web-documentation/INDEX.json

# Search for content
grep -r "your-keyword" .agents/memory/
```

### ORCA Dev Server Won't Start
```bash
# Check Node version
node --version  # Should be 18+

# Install dependencies
cd apps/orca/workflow-editor
npm install

# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Git Issues
```bash
# Check status
git status

# View recent commits
git log --oneline -5

# Force pull latest
git fetch origin
git reset --hard origin/main
```

---

## 📞 Quick Reference

| Need | Command/Location |
|------|------------------|
| View Memory Index | `jq . .agents/memory/*/INDEX.json` |
| Search Memory | `grep -r "keyword" .agents/memory/` |
| Read Memory | `cat .agents/memory/*/*/file.html` |
| Update Status | Edit `docs/CHANGE_TIMELINE.md` |
| Start ORCA Dev | `cd apps/orca/workflow-editor && npm run dev` |
| Start JupyterLab | `jupyter lab` |
| Sync Obsidian | `python scripts/sync_notebooks_to_obsidian.py` |
| Check Phase | `head -50 docs/CHANGE_TIMELINE.md` |
| Git Status | `git status && git log -1` |

---

## 📋 Agent Checklist

Before starting work:
- [ ] Read `CLAUDE.md` project rules
- [ ] Check `AGENT_MEMORY_CONFIG.json` (this directory)
- [ ] Review `.agents/memory/*/INDEX.json` for available docs
- [ ] Understand current phase from `CHANGE_TIMELINE.md`
- [ ] Check `PHASE_3_COMPLETION_SUMMARY.md` for latest context

During work:
- [ ] Use memory for technical questions (faster)
- [ ] Reference ORCA components in `src/components/`
- [ ] Follow Zustand store patterns
- [ ] Test with `npm run dev`
- [ ] Keep memory fresh (update if new docs found)

After work:
- [ ] Commit changes with descriptive messages
- [ ] Push to `origin/main`
- [ ] Update `CHANGE_TIMELINE.md` if major work
- [ ] Create checkpoint if phase-level work

---

## 🚀 You're Ready!

All systems are configured. You have:
- ✅ 7.9 MB of offline documentation
- ✅ Complete ORCA architecture understanding
- ✅ Zustand state management setup
- ✅ JupyterLab integration ready
- ✅ Git workflow configured
- ✅ Phase 3 complete, Phase 4 ready

**Start working on Phase 4 (Obsidian Deployment) or integrate WebGL into WebDesignMode!**

---

**Generated:** 2026-05-23  
**Version:** 1.0  
**Status:** ✅ Ready for Agent Use
