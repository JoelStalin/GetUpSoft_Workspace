"""
JupyterLab Configuration for Memory System
Configures notebook defaults, extensions, and behavior
"""

# JupyterLab configuration
c.JupyterApp.answer_yes = True

# Notebook configuration
c.NotebookApp.notebook_dir = '/notebooks'
c.NotebookApp.ip = '127.0.0.1'
c.NotebookApp.port = 8888
c.NotebookApp.token = ''  # Disable token for local-only access
c.NotebookApp.password = ''  # Disable password

# Enable auto-save
c.FileContentsManager.save_script = True

# Set default cell type and execution behavior
c.ExecutePreprocessor.timeout = 60

# Configure Jupyter extensions
c.JupyterLab.extensions_in_dev_mode = True

# FUTURO: Add extension configurations for:
# - Real-time collaboration (JupyterHub)
# - Code completion enhancements
# - Variable explorer
# - Git integration
# - Markdown preview enhancements
