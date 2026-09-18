import asyncio
from pathlib import Path
from typing import Any
from notebooklm import NotebookLMClient
from ai_automation_orchestrator.config import repository_root

async def export_job_to_notebooklm_audio(job: Any) -> str:
    """
    Takes a completed WorkflowJob, creates a notebook in NotebookLM,
    uploads its markdown output as a source, and generates an Audio Overview (podcast).
    Returns the path to the downloaded mp3.
    """
    if not getattr(job, "output_markdown", None):
        raise ValueError(f"Job {job.id} has no output markdown to process.")

    # Save the output temporarily to a file so we can upload it
    temp_file = Path(f"/tmp/orca_job_{job.id}.md")
    temp_file.parent.mkdir(parents=True, exist_ok=True)
    temp_file.write_text(job.output_markdown, encoding="utf-8")

    # This requires that 'notebooklm login' was run previously by the user
    async with await NotebookLMClient.from_storage() as client:
        # 1. Create Notebook
        nb_name = f"Orca Job: {job.title[:30]}"
        print(f"Creating NotebookLM project: {nb_name}")
        nb = await client.notebooks.create(nb_name)

        # 2. Upload source
        print(f"Uploading source file to NotebookLM...")
        await client.sources.add_file(nb.id, str(temp_file), wait=True)

        # 3. Generate Audio
        print(f"Generating Audio Overview...")
        status = await client.artifacts.generate_audio(nb.id, instructions="Deep dive into the workflow output, highlight the main action items.")
        await client.artifacts.wait_for_completion(nb.id, status.task_id)

        # 4. Download Audio
        output_dir = repository_root() / "data" / "podcasts"
        output_dir.mkdir(parents=True, exist_ok=True)
        output_path = output_dir / f"podcast_{job.id}.mp3"
        print(f"Downloading Audio to {output_path}...")
        await client.artifacts.download_audio(nb.id, str(output_path))
        
        return str(output_path)
