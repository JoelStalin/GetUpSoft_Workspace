# OpenML Documentation Archive

This directory contains downloaded public documentation from OpenML.org.

## Contents

### Documentation Sections

- **Advanced** (0 files)

- **Api** (0 files)

- **Benchmarks** (1 files)
  - Benchmarks
- **Data** (0 files)

- **Experiments** (0 files)

- **Getting Started** (1 files)
  - Getting Started
- **Guides** (0 files)

- **Python Api** (0 files)


## Quick Start

### For Local Reference
1. Open HTML files directly in your browser
2. All documentation is self-contained
3. No internet required after download

### For Search & Integration
Use `INDEX.json` to programmatically access:
- File locations and URLs
- File sizes and categories
- Download timestamp
- Complete metadata

## OpenML Overview

OpenML is an open, collaborative platform for machine learning research:
- **Datasets:** Repository of datasets for benchmarking
- **Tasks:** Standardized machine learning tasks
- **Flows:** Pipeline definitions and workflows
- **Runs:** Experiment execution and results
- **API:** REST and Python interfaces
- **Community:** Shared benchmarks and evaluations

## Documentation Categories

1. **Getting Started** - Introduction and quick start guides
2. **Guides** - Language-specific guides (Python, R, Java)
3. **API** - REST API and authentication documentation
4. **Python API** - Python library reference and examples
5. **Benchmarks** - OpenML benchmark definitions and results
6. **Data** - Dataset management and upload procedures
7. **Experiments** - Tasks, runs, and result tracking
8. **Advanced** - SSL, batch uploads, data formats

## Usage

### Python Example
```python
import openml

# Fetch a dataset
dataset = openml.datasets.get_dataset(61)
X, y, categorical_indicator, attribute_names = dataset.get_data()

# List datasets
datasets = openml.datasets.list_datasets()

# Run an experiment
task = openml.tasks.get_task(119)
run = openml.runs.create_run(flow_id=123, task=task)
```

### R Example
```r
library(OpenML)

# Get a dataset
data <- getOMLDataSet(data.id = 61)

# List datasets
datasets <- listOMLDatasets()

# Create a run
run <- runTaskMLC(task.id = 119)
```

## API Quick Reference

### REST Endpoints
```
GET  /data/<data_id>                  - Get dataset
GET  /task/<task_id>                  - Get task
GET  /flow/<flow_id>                  - Get flow
GET  /run/<run_id>                    - Get run result
POST /run                             - Submit new run
```

### Python API
```python
openml.datasets.get_dataset(id)
openml.tasks.get_task(id)
openml.flows.get_flow(id)
openml.runs.create_run(flow_id, task)
openml.evaluations.list_evaluations(task_id)
```

## Integration with Claude Memory

Files are indexed in `.agents/memory/openml-documentation/`

Use `INDEX.json` for:
- Programmatic access to documentation
- Building knowledge graphs
- Creating documentation indices
- Cross-referencing with other memory systems

## File Organization

```
openml-documentation/
├── getting-started/
│   ├── getting_started.html
│   ├── about_openml.html
│   └── quick_start.html
├── guides/
│   ├── tutorials.html
│   ├── python_guide.html
│   ├── r_guide.html
│   └── java_guide.html
├── api/
│   ├── rest_api.html
│   ├── api_reference.html
│   ├── authentication.html
│   └── data_api.html
├── python-api/
├── benchmarks/
├── data/
├── experiments/
├── advanced/
├── INDEX.json     (Metadata and file listing)
└── README.md      (This file)
```

## References

- **Official Website:** https://www.openml.org
- **Documentation:** https://docs.openml.org
- **API Docs:** https://www.openml.org/api/v1
- **Python Package:** https://github.com/openml/openml-python
- **GitHub:** https://github.com/openml

## Last Updated

See `INDEX.json` for exact timestamp.

## Notes

- All documentation is public and freely available
- OpenML is open-source (Apache 2.0 license)
- Community-driven research platform
- Active development and updates

---

Generated: 2026-05-23T13:41:11.010674
Tool: Python requests + BeautifulSoup
Size: Complete documentation mirror
