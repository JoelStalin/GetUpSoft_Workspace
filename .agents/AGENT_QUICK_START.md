# 🚀 Agent Quick Start (30 Seconds)

**You have 3 resources ready. Use them.**

---

## 📚 What You Have

### Memory (7.9 MB, Offline)
```bash
cd .agents/memory/

# Option 1: Quick lookup
grep -i "flexbox" web-documentation/w3schools/css.html

# Option 2: View index
cat web-documentation/INDEX.json

# Option 3: Search everything
grep -r "async" .
```

### ORCA Project (4 Modes, Production-Ready)
```bash
cd apps/orca/workflow-editor/

# Start dev server
npm run dev

# See structure
ls -la src/components/
```

### Documentation (All Phases)
```bash
# Check status
head -30 docs/CHANGE_TIMELINE.md

# View latest
cat docs/PHASE_3_COMPLETION_SUMMARY.md

# See validation
cat MEMORY_VALIDATION_SUMMARY.txt
```

---

## 🎯 Before You Start Any Task

1. **Read Project Rules (2 min)**
   ```bash
   cat CLAUDE.md
   ```

2. **Check Agent Config (1 min)**
   ```bash
   cat .agents/AGENT_MEMORY_CONFIG.json
   ```

3. **Know Current Phase (1 min)**
   ```bash
   head -50 docs/CHANGE_TIMELINE.md
   ```

4. **Access Memory (30 sec)**
   ```bash
   grep -r "your-question" .agents/memory/
   ```

**Total: ~5 minutes to be fully context-aware**

---

## 💡 Three Ways to Use Memory

### Fast: Grep Search
```bash
grep -i "promise\|async\|await" .agents/memory/web-documentation/w3schools/javascript.html
```

### Structured: JSON Index
```bash
jq '.w3schools.sections[]' .agents/memory/web-documentation/INDEX.json | grep -i react
```

### Complete: Read File
```bash
cat .agents/memory/web-documentation/w3schools/css.html | less
```

---

## 🏗️ ORCA in 30 Seconds

**4 Modes:**
- Workflow (node editor)
- Web Design (layout builder)
- Mobile Design (UI mockup)
- AI (agent prompting)

**Key Files:**
- `src/App.tsx` - Main entry
- `src/components/` - UI components
- `src/stores/useEditorStore.ts` - State
- `src/types/` - TypeScript defs

**Start Dev:**
```bash
npm run dev  # localhost:5175
```

---

## 📋 Task Checklist

### Every Task Starts With:
- [ ] Read CLAUDE.md (project rules)
- [ ] Check .agents/AGENT_MEMORY_CONFIG.json
- [ ] See docs/CHANGE_TIMELINE.md (phase status)
- [ ] Grep .agents/memory/ (if tech question)

### During Task:
- [ ] Use memory for answers (faster than web search)
- [ ] Follow ORCA structure in src/
- [ ] Update Zustand store patterns
- [ ] Test: npm run dev

### After Task:
- [ ] Commit: git add . && git commit -m "..."
- [ ] Push: git push origin main
- [ ] Update docs if major work
- [ ] Create checkpoint if phase work

---

## 🚨 Red Flags

| Issue | Fix |
|-------|-----|
| Can't grep memory | Check file exists: `ls .agents/memory/*/` |
| ORCA won't start | `cd apps/orca/workflow-editor && npm install && npm run dev` |
| Git confused | `git status && git log -3` |
| Don't know phase | `head -50 docs/CHANGE_TIMELINE.md` |
| Memory not working | `cat .agents/memory/*/INDEX.json` |

---

## 📍 Key Paths

```
MEMORY:           .agents/memory/
  ├─ w3schools/   (HTML, CSS, JS, Python, etc.)
  ├─ mdn/         (APIs, Security, Performance)
  ├─ openml/      (Benchmarks, Getting Started)
  └─ INDEX.json   (Use this!)

ORCA:             apps/orca/workflow-editor/
  ├─ src/         (Components, Stores, Utils)
  ├─ public/      (Static assets)
  └─ package.json (Dependencies)

DOCS:             docs/
  ├─ CHANGE_TIMELINE.md (Current phase!)
  ├─ PHASE_3_COMPLETION_SUMMARY.md
  └─ MEMORY_*.md  (Validation reports)
```

---

## 🎓 You're Ready!

✅ Memory configured  
✅ ORCA ready  
✅ Docs complete  
✅ Git working  

**Start Phase 4 or improve something today!**

---

**Agent Framework v1.0 | 2026-05-23 | Ready to Deploy**
