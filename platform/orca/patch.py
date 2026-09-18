import sys

with open('src/ai_automation_orchestrator/webapp.py', 'r', encoding='utf-8') as f:
    content = f.read()

target1 = 'from fastapi import FastAPI, HTTPException, Request'
replace1 = 'from fastapi import FastAPI, HTTPException, Request, BackgroundTasks'

if target1 in content:
    content = content.replace(target1, replace1)

target2 = 'from ai_automation_orchestrator.integrations.obsidian import export_job_to_obsidian'
replace2 = 'from ai_automation_orchestrator.integrations.obsidian import export_job_to_obsidian\nfrom ai_automation_orchestrator.integrations.notebooklm_integration import export_job_to_notebooklm_audio'

if target2 in content:
    content = content.replace(target2, replace2)

target3 = '''    @app.post("/api/workflows/interaction-script", status_code=202)
    def create_interaction_script(request: InteractionScriptRequest) -> dict[str, Any]:
        job = manager.submit_interaction_script(request)
        return job_to_dict(job)'''

replace3 = '''    @app.post("/api/workflows/interaction-script", status_code=202)
    def create_interaction_script(request: InteractionScriptRequest) -> dict[str, Any]:
        job = manager.submit_interaction_script(request)
        return job_to_dict(job)

    @app.post("/api/workflows/{job_id}/notebooklm/audio", status_code=202)
    async def generate_notebooklm_audio(job_id: str, background_tasks: BackgroundTasks) -> dict[str, Any]:
        job = workflow_store.get_job(job_id)
        if job is None:
            raise HTTPException(status_code=404, detail="Workflow not found.")
        
        background_tasks.add_task(export_job_to_notebooklm_audio, job)
        return {"status": "accepted", "message": "NotebookLM audio generation started."}'''

if target3 in content:
    content = content.replace(target3, replace3)
else:
    print('Target 3 not found')

with open('src/ai_automation_orchestrator/webapp.py', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated webapp.py')
