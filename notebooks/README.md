# JupyterLab Memory System

Interactive notebook-based memory and knowledge base integrated with Obsidian.

## Quick Start

### 1. Start JupyterLab

```bash
jupyter lab --config=jupyter_config.py
```

JupyterLab will open at `http://localhost:8888`

### 2. Create a New Memory Entry

1. Navigate to `/notebooks/memory/`
2. Copy `Memory_Template.ipynb` as `my_memory_name.ipynb`
3. Edit the notebook with your content
4. Save and execute cells as needed

### 3. Sync to Obsidian

```bash
python scripts/sync_notebooks_to_obsidian.py
```

This converts all notebooks to Obsidian-compatible markdown with frontmatter.

## Directory Structure

```
notebooks/
├── README.md                              (This file)
├── jupyter_config.py                      (JupyterLab configuration)
├── useNotebookStore.ts                    (Zustand store for state)
│
├── templates/                             (Template notebooks)
│   ├── Memory_Template.ipynb              (Basic memory recording)
│   └── Code_Exploration.ipynb             (Code testing & analysis)
│
├── memory/                                (Personal memory entries)
│   └── (Your .ipynb files here)
│
├── analysis/                              (Data analysis notebooks)
│   └── (Your analysis .ipynb files here)
│
├── code/                                  (Code exploration)
│   └── (Your code .ipynb files here)
│
├── research/                              (Research notes)
│   └── (Your research .ipynb files here)
│
└── exports/                               (Markdown exports for Obsidian)
    └── (Auto-generated .md files)
```

## Features

### 📚 Memory Organization
- **Templates:** Pre-built notebook structures for different use cases
- **Categories:** memory, analysis, code, research
- **Metadata:** Track dates, tags, confidence levels, status

### 🔄 Sync Integration
- Convert notebooks to Obsidian markdown automatically
- Preserve metadata in YAML frontmatter
- Searchable in Obsidian vault
- Version controlled via Git

### 🧮 Computational Memory
- Run Python code directly in notebooks
- Create visualizations with matplotlib/plotly
- Analyze data with pandas/numpy
- Execute and test algorithms

### 📊 State Management
- Zustand store for notebook metadata
- LocalStorage persistence
- DevTools debugging
- Query operations (search, filter, sort)

## Usage Examples

### Example 1: Memory Entry

```python
# In Memory_Template.ipynb
import pandas as pd

# Record observations
data = {
    'concept': 'Async programming',
    'learned_date': '2026-05-23',
    'importance': 'high',
    'key_points': [
        'Use async/await for cleaner syntax',
        'Promises are the foundation',
        'Event loop manages execution'
    ]
}

df = pd.DataFrame([data])
print(df.to_html())
```

### Example 2: Code Exploration

```python
# In Code_Exploration.ipynb
def fibonacci(n):
    """Calculate fibonacci sequence"""
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Test
%timeit fibonacci(10)
```

### Example 3: Data Analysis

```python
# Analyze web documentation
import pandas as pd

docs_data = {
    'source': ['W3Schools', 'MDN', 'DevDocs'],
    'sections': [11, 10, 15],
    'size_mb': [5.6, 2.0, 1.5]
}

df = pd.DataFrame(docs_data)
df.plot(x='source', y='size_mb', kind='bar')
```

## Integration Points

### Zustand State Store

```typescript
import { useNotebookStore } from './useNotebookStore';

// Use in React components
const notebooks = useNotebookStore((state) => state.notebooks);
const addNotebook = useNotebookStore((state) => state.addNotebook);
```

### Obsidian Sync

Synced notebooks appear in: `.agents/memory/notebooks/`

With frontmatter:
```yaml
---
title: My Memory Entry
created: 2026-05-23T...
source: notebooks/memory/entry.ipynb
type: notebook
tags: [jupyter, memory]
---
```

### Git Tracking

Notebooks are version controlled:
```bash
git add notebooks/
git commit -m "feat: add memory entries and analysis"
```

## FUTURO: Planned Enhancements

- [ ] Real-time collaboration (JupyterHub)
- [ ] Memory graph visualization
- [ ] Semantic search across all notebooks
- [ ] Automated backups and snapshots
- [ ] CI/CD pipeline for notebook validation
- [ ] Custom exporters (PDF, HTML, RSS)
- [ ] Scheduled notebook execution (Papermill)
- [ ] Integration with external APIs
- [ ] Performance metrics and analytics
- [ ] Mobile-friendly markdown rendering

## Configuration

### JupyterLab Settings

Edit `jupyter_config.py` to customize:
- Port (default: 8888)
- Auto-save behavior
- Execution timeout
- Extension settings

### State Persistence

Notebook metadata is stored in localStorage via Zustand.
Clear cache if needed: `localStorage.clear()`

## Troubleshooting

### JupyterLab won't start
```bash
# Check installation
jupyter --version

# Reinstall if needed
pip install --upgrade jupyterlab
```

### Sync script fails
```bash
# Check nbconvert is installed
jupyter nbconvert --version

# Check paths are correct
python scripts/sync_notebooks_to_obsidian.py -v
```

### Obsidian doesn't find synced files
- Ensure `.agents/memory/notebooks/` is in your Obsidian vault
- Refresh Obsidian (Cmd+R on Mac, Ctrl+Shift+R on Windows)
- Check frontmatter formatting

## References

- [JupyterLab Documentation](https://jupyterlab.readthedocs.io/)
- [nbconvert Documentation](https://nbconvert.readthedocs.io/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Papermill Documentation](https://papermill.readthedocs.io/)

## Cost

- JupyterLab: **Free** (open-source)
- Notebooks: **Free** (local storage)
- Sync: **Free** (uses Git + Obsidian)
- Storage: **Free** (GitHub)

**Total: $0/month**

---

**Created:** 2026-05-23  
**Last Updated:** 2026-05-23  
**Status:** Phase 3a Complete
