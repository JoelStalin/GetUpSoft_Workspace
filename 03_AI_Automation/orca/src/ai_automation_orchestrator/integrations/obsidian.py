import os
from pathlib import Path
import re
from typing import Any

from ai_automation_orchestrator.config import repository_root

def get_obsidian_vault_path() -> Path:
    # Try environment variable first
    configured_path = os.getenv("OBSIDIAN_VAULT_PATH")
    if configured_path:
        return Path(configured_path)
    
    # Default to the workspace's _Knowledge_Center
    # repository_root() points to GetUpSoft_Workspace/03_AI_Automation/orca
    # So we go up 2 levels to GetUpSoft_Workspace, then into _Knowledge_Center
    root = repository_root()
    workspace_root = root.parent.parent
    return workspace_root / "_Knowledge_Center"


def sanitize_filename(name: str) -> str:
    # Remove characters that are invalid in Windows or Obsidian filenames
    name = re.sub(r'[\\/*?:"<>|]', "", name)
    name = name.strip()
    return name if name else "Untitled_Workflow"


def export_job_to_obsidian(job: Any) -> None:
    """
    Exports a WorkflowJob to the configured Obsidian vault.
    Expects job to have: id, workflow_type, title, status, model_id, created_at, output_markdown
    """
    if not getattr(job, "output_markdown", None):
        return  # Nothing to export if there is no output markdown

    vault_path = get_obsidian_vault_path()
    # Export into a dedicated folder
    export_dir = vault_path / "Orca_Workflows" / job.workflow_type
    export_dir.mkdir(parents=True, exist_ok=True)
    
    filename = f"{sanitize_filename(job.title)} - {job.id[:8]}.md"
    file_path = export_dir / filename
    
    # Build YAML frontmatter
    frontmatter = f"""---
id: {job.id}
tags:
  - orca-workflow
  - {job.workflow_type}
model: {job.model_id}
status: {job.status}
created_at: {job.created_at}
---
"""
    
    content = frontmatter + "\n" + job.output_markdown
    
    # Write to file
    file_path.write_text(content, encoding="utf-8")
    print(f"Exported workflow {job.id} to Obsidian vault at {file_path}")
