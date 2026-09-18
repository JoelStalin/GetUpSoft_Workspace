import os
from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel
from typing import List, Optional, Any
import uvicorn

# Import the TaskQueue from the Orca (Mark-XXXIX) agent
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "agents", "mark-xxxix"))
from agent.task_queue import get_queue, TaskPriority

app = FastAPI(title="Orca Central Workflow Engine")

# Security: Basic API Key check from env
ORCA_API_KEY = os.getenv("ORCA_API_KEY", "orca-secret-key-2026")

class TaskSubmission(BaseModel):
    goal: str
    project_id: str
    priority: Optional[str] = "NORMAL" # LOW, NORMAL, HIGH

class TaskStatusResponse(BaseModel):
    task_id: str
    project_id: str
    goal: str
    status: str
    result: Optional[Any] = None
    error: Optional[str] = ""

def verify_key(api_key: str = Header(None)):
    if api_key != ORCA_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid ORCA_API_KEY")

@app.post("/tasks", status_code=202)
async def submit_task(task: TaskSubmission, api_key: str = Header(None)):
    verify_key(api_key)
    
    priority_map = {
        "LOW": TaskPriority.LOW,
        "NORMAL": TaskPriority.NORMAL,
        "HIGH": TaskPriority.HIGH
    }
    
    prio = priority_map.get(task.priority.upper(), TaskPriority.NORMAL)
    
    queue = get_queue()
    task_id = queue.submit(
        goal=task.goal,
        project_id=task.project_id,
        priority=prio
    )
    
    return {"task_id": task_id, "status": "queued", "project_id": task.project_id}

@app.get("/tasks/{task_id}", response_model=TaskStatusResponse)
async def get_task_status(task_id: str, api_key: str = Header(None)):
    verify_key(api_key)
    
    queue = get_queue()
    status = queue.get_status(task_id)
    
    if not status:
        raise HTTPException(status_code=404, detail="Task not found")
        
    return status

@app.get("/tasks", response_model=List[dict])
async def list_all_tasks(api_key: str = Header(None)):
    verify_key(api_key)
    queue = get_queue()
    return queue.get_all_statuses()

if __name__ == "__main__":
    # Iniciar el servidor en el puerto 8015 (el puerto usado en la config de Nginx previa)
    uvicorn.run(app, host="0.0.0.0", port=8015)
