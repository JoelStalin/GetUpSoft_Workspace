from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor
from functools import partial
from html import escape
import os
import json
from pathlib import Path
from typing import Any, Callable

from fastapi import FastAPI, HTTPException, Request, BackgroundTasks, BackgroundTasks
from fastapi.responses import HTMLResponse, Response
from pydantic import BaseModel, Field
import uvicorn

from ai_automation_orchestrator.client_plugin import build_clap_plugin_zip
from ai_automation_orchestrator.config import load_config
from ai_automation_orchestrator.design_pages import generate_professional_page
from ai_automation_orchestrator.generators.automation_flows import build_automation_flow_messages
from ai_automation_orchestrator.generators.interaction_scripts import build_interaction_script_messages
from ai_automation_orchestrator.generators.test_flows import build_test_flow_messages
from ai_automation_orchestrator.jobs import WorkflowJob, WorkflowStore
from ai_automation_orchestrator.pipeline import PipelineOrchestrator, PipelineRun, PipelineStore
from ai_automation_orchestrator.rowboat import RowboatClient, extract_output_text, load_rowboat_settings
from ai_automation_orchestrator.service import OrchestratorService
from ai_automation_orchestrator.user_credentials import CredentialStore, SUPPORTED_PROVIDERS
from ai_automation_orchestrator.workflow_blueprints import WorkflowBlueprint, WorkflowBlueprintStore
from ai_automation_orchestrator.integrations.obsidian import export_job_to_obsidian
from ai_automation_orchestrator.integrations.notebooklm_integration import export_job_to_notebooklm_audio
from ai_automation_orchestrator.integrations.hermes_integration import run_hermes_autonomous_workflow
from ai_automation_orchestrator.provider_endpoints import register_provider_endpoints
from ai_automation_orchestrator.providers_dashboard_section import get_providers_section_html
from ai_automation_orchestrator.jarvis_endpoints import register_jarvis_endpoints
from ai_automation_orchestrator.workspace_endpoints import register_workspace_endpoints


class TestFlowRequest(BaseModel):
    project: str = Field(min_length=1)
    context: str = Field(min_length=1)
    model: str | None = None


class AutomationFlowRequest(BaseModel):
    goal: str = Field(min_length=1)
    systems: str = Field(min_length=1)
    context: str = Field(min_length=1)
    model: str | None = None


class InteractionScriptRequest(BaseModel):
    audience: str = Field(min_length=1)
    objective: str = Field(min_length=1)
    tone: str = Field(min_length=1)
    context: str = Field(min_length=1)
    model: str | None = None


class RowboatChatRequest(BaseModel):
    message: str = Field(min_length=1)
    conversation_id: str | None = None
    mock_tools: dict[str, str] | None = None


class WorkflowBlueprintRequest(BaseModel):
    id: str | None = None
    user_id: str = Field(default="default", min_length=1)
    name: str = Field(min_length=1)
    objective: str = Field(min_length=1)
    status: str = "draft"
    nodes: list[dict[str, Any]] = Field(default_factory=list)
    edges: list[dict[str, Any]] = Field(default_factory=list)
    settings: dict[str, Any] = Field(default_factory=dict)


class BlueprintRunRequest(BaseModel):
    user_id: str = Field(default="default", min_length=1)
    model: str | None = None


class CredentialWriteRequest(BaseModel):
    user_id: str | None = Field(default=None)
    values: dict[str, str] = Field(default_factory=dict)


class WorkflowManager:
    def __init__(
        self,
        service: OrchestratorService,
        store: WorkflowStore,
        executor: ThreadPoolExecutor | None = None,
    ) -> None:
        self.service = service
        self.store = store
        self.executor = executor or ThreadPoolExecutor(max_workers=4)

    def submit_test_flow(self, request: TestFlowRequest) -> WorkflowJob:
        input_payload = request.model_dump()
        model_id = request.model or self.service.config.default_model
        job = self.store.create_job("test-flow", request.project, model_id, input_payload)
        self.executor.submit(self._run_job, job.id, model_id, build_test_flow_messages, request.project, request.context)
        return job

    def submit_automation_flow(self, request: AutomationFlowRequest) -> WorkflowJob:
        input_payload = request.model_dump()
        model_id = request.model or self.service.config.default_model
        job = self.store.create_job("automation-flow", request.goal, model_id, input_payload)
        self.executor.submit(
            self._run_job,
            job.id,
            model_id,
            build_automation_flow_messages,
            request.goal,
            request.systems,
            request.context,
        )
        return job

    def submit_interaction_script(self, request: InteractionScriptRequest) -> WorkflowJob:
        input_payload = request.model_dump()
        model_id = request.model or self.service.config.default_model
        job = self.store.create_job("interaction-script", request.objective, model_id, input_payload)
        self.executor.submit(
            self._run_job,
            job.id,
            model_id,
            build_interaction_script_messages,
            request.audience,
            request.objective,
            request.tone,
            request.context,
        )
        return job

    def submit_professional_page_design(
        self,
        *,
        blueprint: WorkflowBlueprint,
        model_id: str,
    ) -> WorkflowJob:
        input_payload = {
            "blueprint_id": blueprint.id,
            "objective": blueprint.objective,
            "nodes": blueprint.nodes,
            "edges": blueprint.edges,
            "settings": blueprint.settings,
        }
        title = str(blueprint.settings.get("project") or blueprint.name)
        job = self.store.create_job("professional-page-design", title, model_id, input_payload)
        self.executor.submit(self._run_professional_page_design, job.id, blueprint.objective, blueprint.settings)
        return job

    def _run_job(
        self,
        job_id: str,
        model_id: str,
        builder: Callable[..., list[dict[str, str]]],
        *builder_args: str,
    ) -> None:
        self.store.mark_running(job_id)
        try:
            messages = builder(*builder_args)
            output = self.service.generate(messages=messages, model_id=model_id)
            self.store.mark_completed(job_id, output)
            completed_job = self.store.get_job(job_id)
            if completed_job:
                self.executor.submit(export_job_to_obsidian, completed_job)
        except Exception as exc:
            self.store.mark_failed(job_id, str(exc))

    def _run_professional_page_design(
        self,
        job_id: str,
        objective: str,
        settings: dict[str, Any],
    ) -> None:
        self.store.mark_running(job_id)
        try:
            result = generate_professional_page(settings, objective)
            self.store.mark_completed(job_id, result.summary_markdown)
            completed_job = self.store.get_job(job_id)
            if completed_job:
                self.executor.submit(export_job_to_obsidian, completed_job)
        except Exception as exc:
            self.store.mark_failed(job_id, str(exc))


def job_to_dict(job: WorkflowJob) -> dict[str, Any]:
    return {
        "id": job.id,
        "workflow_type": job.workflow_type,
        "title": job.title,
        "status": job.status,
        "model_id": job.model_id,
        "input_payload": job.input_payload,
        "output_markdown": job.output_markdown,
        "error_message": job.error_message,
        "created_at": job.created_at,
        "updated_at": job.updated_at,
        "started_at": job.started_at,
        "completed_at": job.completed_at,
    }


def blueprint_to_dict(blueprint: WorkflowBlueprint) -> dict[str, Any]:
    return {
        "id": blueprint.id,
        "user_id": blueprint.user_id,
        "name": blueprint.name,
        "objective": blueprint.objective,
        "status": blueprint.status,
        "nodes": blueprint.nodes,
        "edges": blueprint.edges,
        "settings": blueprint.settings,
        "created_at": blueprint.created_at,
        "updated_at": blueprint.updated_at,
    }


def create_dashboard_html(app_name: str) -> str:
    safe_name = escape(app_name)
    return """<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>ORCA | Orchestrator</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700;900&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
  <style>
    :root {
      color-scheme: dark;
      --bg: #050505;
      --panel: rgba(20, 20, 20, 0.7);
      --border: rgba(255, 255, 255, 0.08);
      --text: #ffffff;
      --muted: #888;
      --accent: #ff0038; /* Nothing Red */
      --glass: rgba(255, 255, 255, 0.02);
      --radius: 24px;
    }
    * { box-sizing: border-box; }
    body { 
      margin: 0; 
      min-height: 100vh; 
      background: var(--bg); 
      color: var(--text); 
      font-family: 'Inter', sans-serif; 
      overflow: hidden;
      letter-spacing: -0.01em;
    }
    
    /* Background Pattern */
    .bg-grid {
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background-image: radial-gradient(rgba(255,255,255,0.05) 1px, transparent 0);
      background-size: 32px 32px;
      z-index: -1;
    }

    .intro-overlay {
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background: #000;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
    }
    .intro-logo {
      font-family: 'Space Mono', monospace;
      font-weight: 700;
      font-size: 8vw;
      letter-spacing: 0.5em;
      color: #fff;
      opacity: 0;
    }

    .shell { 
      height: 100vh; 
      display: grid; 
      grid-template-columns: 80px 1fr;
      opacity: 0;
    }
    
    .sidebar { 
      border-right: 1px solid var(--border); 
      background: rgba(0,0,0,0.8); 
      display: flex; 
      flex-direction: column; 
      align-items: center;
      padding: 30px 0;
      gap: 30px;
      z-index: 100;
    }
    .brand-icon {
      width: 40px;
      height: 40px;
      background: var(--accent);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 20px;
      cursor: pointer;
    }
    .nav-icons {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .nav-btn {
      width: 48px;
      height: 48px;
      border: none;
      background: transparent;
      color: var(--muted);
      cursor: pointer;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .nav-btn:hover { background: var(--glass); color: #fff; }
    .nav-btn.active { background: var(--glass); color: var(--accent); border: 1px solid var(--border); }

    .main { 
      position: relative;
      display: flex; 
      flex-direction: column; 
      height: 100vh;
      overflow: hidden;
    }

    /* Main Chat focused by default */
    .view-container {
      flex: 1;
      position: relative;
      padding: 40px;
      display: flex;
      flex-direction: column;
      gap: 30px;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    }

    .chat-hero {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 20px;
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      backdrop-filter: blur(40px);
      box-shadow: 0 50px 100px rgba(0,0,0,0.5);
      position: relative;
      overflow: hidden;
    }
    .chat-hero::before {
        content: "";
        position: absolute;
        top: 0; left: 0; width: 100%; height: 4px;
        background: linear-gradient(90deg, transparent, var(--accent), transparent);
        opacity: 0.5;
    }

    .chat-messages {
      flex: 1;
      padding: 40px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .chat-messages::-webkit-scrollbar { width: 4px; }
    .chat-messages::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }

    .msg {
      max-width: 80%;
      padding: 20px 24px;
      border-radius: 20px;
      font-size: 15px;
      line-height: 1.6;
      animation: msgReveal 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }
    @keyframes msgReveal {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .msg.system { background: var(--glass); border: 1px solid var(--border); color: #ccc; }
    .msg.user { background: #fff; color: #000; align-self: flex-end; font-weight: 500; }
    .msg.orca { border-left: 4px solid var(--accent); background: rgba(255,255,255,0.03); }

    .chat-input-area {
      padding: 30px;
      border-top: 1px solid var(--border);
      background: rgba(0,0,0,0.2);
      display: flex;
      gap: 15px;
      align-items: center;
    }
    .orca-input {
      flex: 1;
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 18px 24px;
      color: #fff;
      font-size: 16px;
      outline: none;
      transition: border-color 0.3s;
    }
    .orca-input:focus { border-color: var(--accent); }

    .btn-exec {
      background: var(--accent);
      color: #fff;
      border: none;
      border-radius: 16px;
      padding: 0 30px;
      height: 58px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      cursor: pointer;
      box-shadow: 0 10px 20px rgba(255, 0, 56, 0.2);
    }

    /* Floating Stats Bar */
    .floating-stats {
        position: absolute;
        top: 20px;
        right: 40px;
        display: flex;
        gap: 15px;
        z-index: 10;
    }
    .stat-pill {
        background: rgba(0,0,0,0.6);
        border: 1px solid var(--border);
        padding: 8px 16px;
        border-radius: 999px;
        font-size: 10px;
        text-transform: uppercase;
        font-weight: 700;
        letter-spacing: 0.1em;
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .dot { width: 6px; height: 6px; border-radius: 50%; background: #444; }
    .dot.live { background: #00ff00; box-shadow: 0 0 10px #00ff00; }

    /* Views */
    .view { display: none; height: 100%; overflow-y: auto; }
    .view.active { display: flex; flex-direction: column; }

    /* Workbench Grid */
    .workbench-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 24px;
    }
    .card {
        background: var(--panel);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        padding: 30px;
        transition: transform 0.3s;
    }
    .card:hover { transform: translateY(-5px); }
    .card h3 { margin: 0 0 20px 0; font-size: 14px; text-transform: uppercase; color: var(--muted); letter-spacing: 0.2em; }

    /* Dot Matrix Animation */
    #matrix-canvas {
        position: fixed;
        top: 0; left: 0; width: 100%; height: 100%;
        z-index: -1;
        opacity: 0.15;
    }

    @media (max-width: 768px) {
        .shell { grid-template-columns: 1fr; }
        .sidebar { display: none; }
        .view-container { padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="bg-grid"></div>
  <canvas id="matrix-canvas"></canvas>

  <div class="intro-overlay">
    <div class="intro-logo">ORCA</div>
    <div style="font-family: 'Space Mono'; font-size: 10px; color: var(--muted); margin-top: 20px; letter-spacing: 0.5em;">SYSTEM INITIALIZING...</div>
  </div>

  <div class="shell">
    <aside class="sidebar">
      <div class="brand-icon">O</div>
      <nav class="nav-icons">
        <button class="nav-btn active" data-target="chat-view" title="Chat">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        </button>
        <button class="nav-btn" data-target="workflow-view" title="Blueprints">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
        </button>
        <button class="nav-btn" data-target="vault-view" title="Vault">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 7v10c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V7M20 7l-8-4-8 4M20 7l-8 4-8-4m16 0V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2"></path></svg>
        </button>
        <button class="nav-btn" data-target="providers-view" title="AI Providers">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline><path d="M9 15h2M9 11h6"></path></svg>
        </button>
        <button class="nav-btn" data-target="config-view" title="Kernel">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
        </button>
      </nav>
    </aside>

    <main class="main">
      <div class="floating-stats">
        <div class="stat-pill"><span class="dot live"></span> System: Online</div>
        <div class="stat-pill">Model: <span id="active-model">Gemma 7B</span></div>
      </div>

      <div class="view-container">
        
        <!-- CHAT VIEW (Default) -->
        <section id="chat-view" class="view active">
          <div class="chat-hero">
            <div id="chat-log" class="chat-messages">
                <div class="msg orca">
                    <strong>ORCA</strong><br>
                    Welcome, Operator. I am ready to orchestrate your autonomous workflows. 
                    What is our objective today?
                </div>
            </div>
            <div class="chat-input-area">
              <input id="chat-input" class="orca-input" placeholder="Type a command or objective..." autocomplete="off" />
              <button id="send-chat" class="btn-exec">Execute</button>
            </div>
          </div>
        </section>

        <!-- WORKFLOW VIEW -->
        <section id="workflow-view" class="view">
          <header style="margin-bottom: 20px;">
            <h2 style="font-family: 'Space Mono'; font-weight: 700; font-size: 32px;">BLUEPRINTS</h2>
          </header>
          <div class="workbench-grid">
            <div class="card">
              <h3>Create Blueprint</h3>
              <div style="display:flex; flex-direction:column; gap:15px">
                <input id="bp-name" class="orca-input" placeholder="Workflow Name" style="padding:12px 16px; font-size:14px" />
                <textarea id="bp-prompt" class="orca-input" placeholder="Objective..." style="height:120px; padding:12px 16px; font-size:14px"></textarea>
                <button id="save-bp" class="btn-exec" style="height:48px">Commit Blueprint</button>
              </div>
            </div>
            <div class="card">
              <h3>Active Blueprints</h3>
              <div id="bp-list" style="display:flex; flex-direction:column; gap:10px">
                <!-- Blueprints here -->
              </div>
            </div>
          </div>
        </section>

        <!-- VAULT VIEW -->
        <section id="vault-view" class="view">
            <header style="margin-bottom: 20px;">
              <h2 style="font-family: 'Space Mono'; font-weight: 700; font-size: 32px;">KNOWLEDGE VAULT</h2>
            </header>
            <div class="workbench-grid">
              <div class="card">
                <h3>Obsidian</h3>
                <p style="color:var(--muted); font-size:12px">Connected to Local Vault</p>
                <button class="nav-btn" style="width:100%; margin-top:10px; border:1px solid var(--border)">Sync Now</button>
              </div>
              <div class="card">
                <h3>NotebookLM</h3>
                <p style="color:var(--muted); font-size:12px">Integration Ready</p>
                <button class="nav-btn" style="width:100%; margin-top:10px; border:1px solid var(--border)">Generate Audio</button>
              </div>
            </div>
        </section>

        <!-- CONFIG VIEW -->
        <section id="config-view" class="view">
            <header style="margin-bottom: 20px;">
              <h2 style="font-family: 'Space Mono'; font-weight: 700; font-size: 32px;">KERNEL</h2>
            </header>
            <div class="card">
              <h3>Credentials</h3>
              <div style="display:flex; flex-direction:column; gap:10px">
                <div style="display:flex; justify-content:space-between; align-items:center; padding:15px; border-bottom:1px solid var(--border)">
                    <span>OpenAI API</span>
                    <button class="badge">Connected</button>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; padding:15px; border-bottom:1px solid var(--border)">
                    <span>NVIDIA Cloud</span>
                    <button class="badge" style="border-color:var(--accent); color:var(--accent)">Required</button>
                </div>
              </div>
            </div>
        </section>

        """ + get_providers_section_html() + """

      </div>
    </main>
  </div>

  <script>
    // --- INTRO ANIMATION ---
    const tl = gsap.timeline();
    tl.to(".intro-logo", { opacity: 1, duration: 1.5, ease: "power4.out" })
      .to(".intro-logo", { letterSpacing: "1em", duration: 1, ease: "power2.inOut" }, "-=0.5")
      .to(".intro-overlay", { y: "-100%", duration: 1, ease: "power4.inOut" })
      .to(".shell", { opacity: 1, duration: 1 }, "-=0.5");

    // --- MATRIX BACKGROUND ---
    const canvas = document.getElementById('matrix-canvas');
    const ctx = canvas.getContext('2d');
    let w, h, columns;
    const size = 16;
    const drops = [];

    function initMatrix() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
        columns = Math.floor(w / size);
        for (let i = 0; i < columns; i++) drops[i] = 1;
    }

    function drawMatrix() {
        ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "#333";
        ctx.font = size + "px monospace";
        for (let i = 0; i < drops.length; i++) {
            const text = String.fromCharCode(Math.random() * 128);
            ctx.fillText(text, i * size, drops[i] * size);
            if (drops[i] * size > h && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
    }
    initMatrix();
    setInterval(drawMatrix, 50);
    window.addEventListener('resize', initMatrix);

    // --- NAVIGATION ---
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.target;
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            document.querySelectorAll('.view').forEach(v => {
                if (v.id === target) {
                    v.classList.add('active');
                    gsap.fromTo(v, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 });
                } else {
                    v.classList.remove('active');
                }
            });
        });
    });

    // --- CHAT LOGIC ---
    const chatLog = document.getElementById('chat-log');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-chat');

    function addMessage(text, role = 'orca') {
        const div = document.createElement('div');
        div.className = `msg ${role}`;
        div.innerHTML = `<strong>${role.toUpperCase()}</strong><br>${text}`;
        chatLog.appendChild(div);
        chatLog.scrollTop = chatLog.scrollHeight;
        
        anime({
            targets: div,
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 800,
            easing: 'easeOutQuart'
        });
    }

    async function executeCommand() {
        const val = chatInput.value.trim();
        if(!val) return;
        chatInput.value = '';
        addMessage(val, 'user');

        try {
            const res = await fetch('/api/rowboat/chat', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({message: val})
            });
            const data = await res.json();
            addMessage(data.output_text || "Command accepted. Processing...", 'orca');
        } catch(e) {
            addMessage("Kernel Error: Unable to reach orchestration engine.", 'orca');
        }
    }

    sendBtn.addEventListener('click', executeCommand);
    chatInput.addEventListener('keypress', e => { if(e.key === 'Enter') executeCommand(); });

  </script>
</body>
</html>\"\"\"
              <thead><tr><th>Estado</th><th>Tipo</th><th>Titulo</th><th>Modelo</th></tr></thead>
              <tbody id="workflow-table"></tbody>
            </table>
            <pre id="run-detail">Selecciona una ejecucion.</pre>
          </div>
        </section>
      </section>
    </main>
  </div>
  <script>
    const defaultNodes = [
      {id: "trigger", type: "Trigger", label: "Inicio", x: 32, y: 42},
      {id: "ai", type: "AI", label: "Orca razona", x: 224, y: 126},
      {id: "action", type: "Action", label: "Ejecutar", x: 416, y: 210}
    ];
    let blueprints = [];
    let currentBlueprint = null;
    let selectedId = null;
    let conversationId = null;
    const userInput = document.getElementById("user-id");
    userInput.value = localStorage.getItem("orcaUserId") || "default";

    function escapeHtml(value) {
      return String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
    }

    function badge(status) {
      return `<span class="badge ${escapeHtml(status)}">${escapeHtml(status)}</span>`;
    }

    function setStats(stats) {
      for (const key of ["total", "pending", "running", "completed", "failed"]) {
        document.getElementById(key).textContent = stats[key] ?? 0;
      }
    }

    function renderRows(items) {
      const tbody = document.getElementById("workflow-table");
      tbody.innerHTML = "";
      for (const item of items) {
        const row = document.createElement("tr");
        row.style.cursor = "pointer";
        row.innerHTML = `
          <td>${badge(item.status)}</td>
          <td>${escapeHtml(item.workflow_type)}</td>
          <td>${escapeHtml(item.title)}</td>
          <td class="mono">${escapeHtml(item.model_id)}</td>
        `;
        row.addEventListener("click", () => showDetail(item));
        tbody.appendChild(row);
      }
    }

    function showDetail(item) {
      selectedId = item.id;
      document.getElementById("run-detail").textContent = JSON.stringify({
        id: item.id,
        title: item.title,
        status: item.status,
        payload: item.input_payload,
        output: item.output_markdown || item.error_message || "Sin contenido todavia."
      }, null, 2);
    }

    function renderCanvas() {
      const canvas = document.getElementById("workflow-canvas");
      const nodes = currentBlueprint?.nodes?.length ? currentBlueprint.nodes : defaultNodes;
      canvas.innerHTML = "";
      nodes.forEach((node, index) => {
        const el = document.createElement("button");
        el.className = "node";
        el.style.left = `${node.x ?? 40 + index * 170}px`;
        el.style.top = `${node.y ?? 60 + index * 70}px`;
        el.innerHTML = `<strong>${escapeHtml(node.type || "Node")}</strong><span>${escapeHtml(node.label || node.id)}</span>`;
        el.addEventListener("click", () => {
          node.label = prompt("Nombre del nodo", node.label || node.type) || node.label;
          syncBlueprintFromForm();
          renderCanvas();
        });
        canvas.appendChild(el);
      });
    }

    function newBlueprint() {
      currentBlueprint = {
        id: null,
        user_id: userInput.value,
        name: "Nuevo workflow",
        objective: "Describe el objetivo operacional de este flujo.",
        status: "draft",
        nodes: structuredClone(defaultNodes),
        edges: [{from: "trigger", to: "ai"}, {from: "ai", to: "action"}],
        settings: {voice: document.getElementById("voice-mode").value}
      };
      fillBlueprintForm();
    }

    function fillBlueprintForm() {
      document.getElementById("blueprint-name").value = currentBlueprint?.name || "";
      document.getElementById("blueprint-objective").value = currentBlueprint?.objective || "";
      document.getElementById("blueprint-status").value = currentBlueprint?.status || "draft";
      renderCanvas();
      renderBlueprintList();
    }

    function syncBlueprintFromForm() {
      if (!currentBlueprint) newBlueprint();
      currentBlueprint.user_id = userInput.value;
      currentBlueprint.name = document.getElementById("blueprint-name").value || "Workflow sin nombre";
      currentBlueprint.objective = document.getElementById("blueprint-objective").value || "Sin objetivo";
      currentBlueprint.status = document.getElementById("blueprint-status").value;
      currentBlueprint.settings = {...(currentBlueprint.settings || {}), voice: document.getElementById("voice-mode").value};
    }

    function renderBlueprintList() {
      const list = document.getElementById("blueprint-list");
      list.innerHTML = "";
      if (!blueprints.length) {
        list.innerHTML = '<div class="muted">Sin blueprints guardados.</div>';
        return;
      }
      blueprints.forEach(item => {
        const el = document.createElement("div");
        el.className = "blueprint-item" + (currentBlueprint?.id === item.id ? " active" : "");
        el.innerHTML = `<strong>${escapeHtml(item.name)}</strong><div class="muted">${escapeHtml(item.status)} - ${escapeHtml(item.objective).slice(0, 90)}</div>`;
        el.addEventListener("click", () => {
          currentBlueprint = structuredClone(item);
          fillBlueprintForm();
        });
        list.appendChild(el);
      });
    }

    async function loadBlueprints() {
      const res = await fetch(`/api/blueprints?user_id=${encodeURIComponent(userInput.value)}`);
      const data = await res.json();
      blueprints = data.items || [];
      if (!currentBlueprint && blueprints.length) currentBlueprint = structuredClone(blueprints[0]);
      if (!currentBlueprint) newBlueprint();
      fillBlueprintForm();
    }

    async function saveBlueprint() {
      syncBlueprintFromForm();
      const res = await fetch("/api/blueprints", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(currentBlueprint)
      });
      currentBlueprint = await res.json();
      await loadBlueprints();
      addMessage("Orca", `Blueprint guardado: ${currentBlueprint.name}`);
    }

    async function runBlueprint() {
      if (!currentBlueprint?.id) await saveBlueprint();
      const res = await fetch(`/api/blueprints/${currentBlueprint.id}/run`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({user_id: userInput.value, model: document.getElementById("model-select").value || null})
      });
      const job = await res.json();
      addMessage("Orca", `Ejecucion enviada: ${job.id}`);
      await refresh();
    }

    async function deleteBlueprint() {
      if (!currentBlueprint?.id) return;
      const res = await fetch(`/api/blueprints/${currentBlueprint.id}?user_id=${encodeURIComponent(userInput.value)}`, {method: "DELETE"});
      if (res.ok) {
        currentBlueprint = null;
        await loadBlueprints();
      }
    }

    function addMessage(author, text, user = false) {
      const log = document.getElementById("chat-log");
      const el = document.createElement("div");
      el.className = "message" + (user ? " user" : "");
      el.innerHTML = `<strong>${escapeHtml(author)}</strong><div>${escapeHtml(text)}</div>`;
      log.appendChild(el);
      log.scrollTop = log.scrollHeight;
    }

    async function sendChat() {
      const input = document.getElementById("chat-input");
      const message = input.value.trim();
      if (!message) return;
      input.value = "";
      addMessage("Tu", message, true);
      const rowboatConfigured = document.getElementById("rowboat-status").dataset.configured === "true";
      if (rowboatConfigured) {
        const res = await fetch("/api/rowboat/chat", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({message, conversation_id: conversationId})
        });
        const data = await res.json();
        conversationId = data.conversation_id || conversationId;
        addMessage("Rowboat", data.output_text || data.detail || "Sin respuesta.");
        return;
      }
      document.getElementById("blueprint-objective").value = message;
      syncBlueprintFromForm();
      await saveBlueprint();
      addMessage("Orca", "Rowboat no esta configurado. Converti tu mensaje en un blueprint editable y listo para ejecutar.");
    }

    async function runHermes(prompt) {
      addMessage("Hermes", "Iniciando proceso autonomo...", false);
      try {
        const res = await fetch("/api/hermes/run", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({prompt})
        });
        const data = await res.json();
        addMessage("Hermes", data.response || data.detail || "Sin respuesta.");
      } catch (e) {
        addMessage("Hermes", "Error en la comunicacion autonoma.");
      }
    }

    async function loadModels() {
      const res = await fetch("/api/models");
      const data = await res.json();
      const select = document.getElementById("model-select");
      select.innerHTML = "";
      (data.items || []).forEach(model => {
        const option = document.createElement("option");
        option.value = model.id;
        option.textContent = `${model.id} (${model.provider})`;
        if (model.id === data.default_model) option.selected = true;
        select.appendChild(option);
      });
    }

    async function loadRowboat() {
      const res = await fetch("/api/rowboat/status");
      const data = await res.json();
      const status = document.getElementById("rowboat-status");
      status.dataset.configured = data.configured ? "true" : "false";
      status.textContent = data.configured ? "Rowboat conectado" : "Rowboat pendiente";
      document.getElementById("rowboat-detail").textContent = JSON.stringify(data, null, 2);
    }

    function renderCredentialProvider(item) {
      const status = document.getElementById(`credential-status-${item.provider}`);
      if (!status) return;
      if (!item.configured) {
        status.textContent = "No configurado";
        return;
      }
      const scopeLabel = item.scope === "user" ? "Usuario" : "Global";
      status.textContent = `${scopeLabel}: ${item.masked_value || "guardado"}`;
    }

    async function loadCredentials() {
      const res = await fetch(`/api/credentials?user_id=${encodeURIComponent(userInput.value)}`);
      const data = await res.json();
      (data.providers || []).forEach(renderCredentialProvider);
      document.getElementById("credentials-detail").textContent = JSON.stringify(data, null, 2);
    }

    async function saveCredential(scope, provider) {
      const input = document.getElementById(`credential-${provider}`);
      const value = input.value.trim();
      if (!value) {
        addMessage("Orca", `Falta el token para ${provider}.`);
        return;
      }
      const payload = {values: {[provider]: value}};
      if (scope === "user") {
        payload.user_id = userInput.value;
      }
      const res = await fetch(`/api/credentials/${scope}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        input.value = "";
        await loadCredentials();
        addMessage("Orca", `Credencial ${provider} guardada en scope ${scope}.`);
      }
    }

    async function clearCredential(scope, provider) {
      const suffix = scope === "user" ? `?user_id=${encodeURIComponent(userInput.value)}` : "";
      const res = await fetch(`/api/credentials/${scope}/${provider}${suffix}`, {method: "DELETE"});
      if (res.ok) {
        document.getElementById(`credential-${provider}`).value = "";
        await loadCredentials();
        addMessage("Orca", `Credencial ${provider} eliminada del scope ${scope}.`);
      }
    }

    async function refresh() {
      const [statsRes, jobsRes] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/workflows")
      ]);
      const stats = await statsRes.json();
      const jobs = await jobsRes.json();
      setStats(stats);
      renderRows(jobs.items);
      document.getElementById("health-dot").classList.add("ok");
      document.getElementById("health-text").textContent = "Operativo";
      if (selectedId) {
        const selected = jobs.items.find(item => item.id === selectedId);
        if (selected) {
          showDetail(selected);
        }
      }
    }

    document.querySelectorAll(".nav button").forEach(button => {
      button.addEventListener("click", () => {
        document.querySelectorAll(".nav button").forEach(item => item.classList.remove("active"));
        button.classList.add("active");
        document.getElementById(button.dataset.focus).scrollIntoView({behavior: "smooth", block: "start"});
      });
    });
    document.querySelectorAll("[data-node-type]").forEach(button => {
      button.addEventListener("click", () => {
        syncBlueprintFromForm();
        const type = button.dataset.nodeType;
        const id = `${type.toLowerCase()}-${Date.now()}`;
        currentBlueprint.nodes.push({id, type, label: type, x: 50 + currentBlueprint.nodes.length * 42, y: 80 + currentBlueprint.nodes.length * 36});
        renderCanvas();
      });
    });
    document.getElementById("save-user").addEventListener("click", () => {
      localStorage.setItem("orcaUserId", userInput.value || "default");
      currentBlueprint = null;
      loadBlueprints();
      loadCredentials();
    });
    document.getElementById("new-blueprint").addEventListener("click", newBlueprint);
    document.getElementById("save-blueprint").addEventListener("click", saveBlueprint);
    document.getElementById("run-blueprint").addEventListener("click", runBlueprint);
    document.getElementById("delete-blueprint").addEventListener("click", deleteBlueprint);
    document.getElementById("send-chat").addEventListener("click", sendChat);
    document.getElementById("chat-input").addEventListener("keydown", event => { if (event.key === "Enter") sendChat(); });
    document.getElementById("voice-button").addEventListener("click", () => {
      const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!Recognition) {
        addMessage("Orca", "Este navegador no tiene dictado Web Speech disponible.");
        return;
      }
      const recognition = new Recognition();
      recognition.lang = "es-DO";
      recognition.onresult = event => {
        document.getElementById("chat-input").value = event.results[0][0].transcript;
        sendChat();
      };
      recognition.start();
    });
    document.querySelectorAll("[data-credential-save-user]").forEach(button => {
      button.addEventListener("click", () => saveCredential("user", button.dataset.credentialSaveUser));
    });
    document.querySelectorAll("[data-credential-save-global]").forEach(button => {
      button.addEventListener("click", () => saveCredential("global", button.dataset.credentialSaveGlobal));
    });
    document.querySelectorAll("[data-credential-clear-user]").forEach(button => {
      button.addEventListener("click", () => clearCredential("user", button.dataset.credentialClearUser));
    });
    document.querySelectorAll("[data-credential-clear-global]").forEach(button => {
      button.addEventListener("click", () => clearCredential("global", button.dataset.credentialClearGlobal));
    });

    document.getElementById("hermes-launcher").addEventListener("click", () => {
      const promptText = prompt("Hermes Autonomous Task:", "Analyze the current project and suggest optimizations.");
      if (promptText) runHermes(promptText);
    });

    loadModels();
    loadRowboat();
    loadCredentials();
    loadBlueprints();
    refresh();
    setInterval(refresh, 5000);
  </script>
</body>
</html>""".replace("__APP_NAME__", safe_name)


def public_orca_url(request: Request) -> str:
    configured = os.getenv("ORCA_PUBLIC_URL")
    if configured:
        return configured.rstrip("/")

    forwarded_proto = request.headers.get("x-forwarded-proto")
    forwarded_host = request.headers.get("x-forwarded-host") or request.headers.get("host")
    if forwarded_proto and forwarded_host:
        return f"{forwarded_proto}://{forwarded_host}".rstrip("/")
    return str(request.base_url).rstrip("/")


def create_plugin_download_html(orca_url: str) -> str:
    safe_url = escape(orca_url)
    return f"""<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Orca Clap Launcher</title>
  <style>
    body {{ margin: 0; min-height: 100vh; display: grid; place-items: center; font-family: Inter, Segoe UI, Arial, sans-serif; background: #080b10; color: #f2f6fb; padding: 24px; }}
    main {{ width: min(680px, 100%); border: 1px solid #263241; border-radius: 10px; background: #111822; padding: 28px; }}
    h1 {{ margin: 0 0 8px; font-size: 30px; }}
    p {{ color: #9aa9ba; line-height: 1.5; }}
    a.button {{ display: inline-block; margin-top: 14px; padding: 12px 16px; border-radius: 8px; background: #2dd4bf; color: #022c22; text-decoration: none; font-weight: 700; }}
    code {{ color: #2dd4bf; }}
  </style>
</head>
<body>
  <main>
    <h1>Orca Clap Launcher</h1>
    <p>Descarga el plugin del cliente. Al abrirlo, escucha el microfono local y abre Orca cuando detecta un aplauso.</p>
    <p>URL configurada: <code>{safe_url}</code></p>
    <a class="button" href="/downloads/orca-clap-plugin.zip">Descargar plugin</a>
  </main>
</body>
</html>"""


class PipelineRunRequest(BaseModel):
    title: str = Field(min_length=1)
    objective: str = Field(min_length=1)
    task_type: str = Field(default="code_generation")
    # task_type options: code_generation | test_generation | automation | script | custom


def pipeline_run_to_dict(run: PipelineRun) -> dict[str, Any]:
    return {
        "id": run.id,
        "task_type": run.task_type,
        "title": run.title,
        "objective": run.objective,
        "status": run.status,
        "current_stage": run.current_stage,
        "revision_count": run.revision_count,
        "stages": [
            {
                "stage": s.stage,
                "model_id": s.model_id,
                "role": s.role,
                "verdict": s.verdict,
                "revision_round": s.revision_round,
                "output_preview": s.output[:500] if s.output else "",
                "output": s.output,
                "started_at": s.started_at,
                "completed_at": s.completed_at,
            }
            for s in run.stages
        ],
        "final_output": run.final_output,
        "error_message": run.error_message,
        "created_at": run.created_at,
        "updated_at": run.updated_at,
    }


def create_app(
    config_path: str | Path | None = None,
    *,
    service: OrchestratorService | None = None,
    store: WorkflowStore | None = None,
    blueprint_store: WorkflowBlueprintStore | None = None,
    credential_store: CredentialStore | None = None,
    pipeline_store: PipelineStore | None = None,
    executor: ThreadPoolExecutor | None = None,
) -> FastAPI:
    config = load_config(config_path)
    orchestrator_service = service or OrchestratorService(config)
    workflow_store = store or WorkflowStore()
    blueprint_repository = blueprint_store or WorkflowBlueprintStore()
    credentials = credential_store or CredentialStore()
    pipeline_repository = pipeline_store or PipelineStore()
    pipeline_orchestrator = PipelineOrchestrator(config, pipeline_repository)
    manager = WorkflowManager(orchestrator_service, workflow_store, executor=executor)
    rowboat_client = RowboatClient(load_rowboat_settings())

    app = FastAPI(title="AI Automation Orchestrator")

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    @app.get("/api/rowboat/status")
    def rowboat_status() -> dict[str, Any]:
        return {
            "configured": rowboat_client.configured,
            "missing": rowboat_client.settings.missing,
            "host": rowboat_client.settings.host,
            "project_id": rowboat_client.settings.project_id,
        }

    @app.get("/api/credentials")
    def credential_status(user_id: str = "default") -> dict[str, Any]:
        return credentials.get_status_view(user_id)

    @app.put("/api/credentials/global")
    def save_global_credentials(request: CredentialWriteRequest) -> dict[str, Any]:
        return credentials.upsert_global(request.values)

    @app.put("/api/credentials/user")
    def save_user_credentials(request: CredentialWriteRequest) -> dict[str, Any]:
        user_id = request.user_id or "default"
        return credentials.upsert_user(user_id, request.values)

    @app.delete("/api/credentials/global/{provider}")
    def delete_global_credential(provider: str) -> dict[str, Any]:
        if provider not in SUPPORTED_PROVIDERS:
            raise HTTPException(status_code=404, detail="Unsupported provider.")
        return {"deleted": credentials.delete_global_provider(provider)}

    @app.delete("/api/credentials/user/{provider}")
    def delete_user_credential(provider: str, user_id: str = "default") -> dict[str, Any]:
        if provider not in SUPPORTED_PROVIDERS:
            raise HTTPException(status_code=404, detail="Unsupported provider.")
        return {"deleted": credentials.delete_user_provider(user_id, provider)}

    @app.get("/plugin", response_class=HTMLResponse)
    def clap_plugin_page(request: Request) -> str:
        return create_plugin_download_html(public_orca_url(request))

    @app.get("/downloads/orca-clap-plugin.zip")
    def download_clap_plugin(request: Request) -> Response:
        archive = build_clap_plugin_zip(public_orca_url(request))
        return Response(
            archive,
            media_type="application/zip",
            headers={"Content-Disposition": 'attachment; filename="orca-clap-plugin.zip"'},
        )

    @app.get("/api/models")
    def list_models() -> dict[str, Any]:
        return {
            "default_model": config.default_model,
            "items": [
                {
                    "id": model.id,
                    "provider": model.provider,
                    "model": model.model,
                }
                for model in orchestrator_service.list_models()
            ],
        }

    @app.get("/api/stats")
    def stats() -> dict[str, int]:
        return workflow_store.get_stats()

    @app.get("/api/workflows")
    def list_workflows(limit: int = 50) -> dict[str, Any]:
        return {"items": [job_to_dict(job) for job in workflow_store.list_jobs(limit=limit)]}

    @app.get("/api/blueprints")
    def list_blueprints(user_id: str = "default") -> dict[str, Any]:
        return {"items": [blueprint_to_dict(item) for item in blueprint_repository.list_blueprints(user_id)]}

    @app.post("/api/blueprints")
    def upsert_blueprint(request: WorkflowBlueprintRequest) -> dict[str, Any]:
        blueprint = blueprint_repository.upsert_blueprint(
            blueprint_id=request.id,
            user_id=request.user_id,
            name=request.name,
            objective=request.objective,
            status=request.status,
            nodes=request.nodes,
            edges=request.edges,
            settings=request.settings,
        )
        return blueprint_to_dict(blueprint)

    @app.delete("/api/blueprints/{blueprint_id}")
    def delete_blueprint(blueprint_id: str, user_id: str = "default") -> dict[str, bool]:
        deleted = blueprint_repository.delete_blueprint(blueprint_id, user_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Blueprint not found.")
        return {"deleted": True}

    @app.post("/api/blueprints/{blueprint_id}/run", status_code=202)
    def run_blueprint(blueprint_id: str, request: BlueprintRunRequest) -> dict[str, Any]:
        blueprint = blueprint_repository.get_blueprint(blueprint_id, request.user_id)
        if blueprint is None:
            raise HTTPException(status_code=404, detail="Blueprint not found.")
        if blueprint.settings.get("workflow_kind") == "professional_page_design":
            model_id = request.model or orchestrator_service.config.default_model
            job = manager.submit_professional_page_design(blueprint=blueprint, model_id=model_id)
            return job_to_dict(job)
        workflow_request = AutomationFlowRequest(
            goal=blueprint.objective,
            systems=", ".join(node.get("type", "node") for node in blueprint.nodes) or "Orca",
            context=json.dumps(
                {
                    "name": blueprint.name,
                    "nodes": blueprint.nodes,
                    "edges": blueprint.edges,
                    "settings": blueprint.settings,
                },
                ensure_ascii=False,
                indent=2,
            ),
            model=request.model,
        )
        job = manager.submit_automation_flow(workflow_request)
        return job_to_dict(job)

    @app.get("/api/workflows/{job_id}")
    def get_workflow(job_id: str) -> dict[str, Any]:
        job = workflow_store.get_job(job_id)
        if job is None:
            raise HTTPException(status_code=404, detail="Workflow not found.")
        return job_to_dict(job)

    @app.post("/api/workflows/test-flow", status_code=202)
    def create_test_flow(request: TestFlowRequest) -> dict[str, Any]:
        job = manager.submit_test_flow(request)
        return job_to_dict(job)

    @app.post("/api/workflows/automation-flow", status_code=202)
    def create_automation_flow(request: AutomationFlowRequest) -> dict[str, Any]:
        job = manager.submit_automation_flow(request)
        return job_to_dict(job)

    @app.post("/api/workflows/interaction-script", status_code=202)
    def create_interaction_script(request: InteractionScriptRequest) -> dict[str, Any]:
        job = manager.submit_interaction_script(request)
        return job_to_dict(job)

    @app.post("/api/workflows/{job_id}/notebooklm/audio", status_code=202)
    async def generate_notebooklm_audio(job_id: str, background_tasks: BackgroundTasks) -> dict[str, Any]:
        job = workflow_store.get_job(job_id)
        if job is None:
            raise HTTPException(status_code=404, detail="Workflow not found.")
        
        background_tasks.add_task(export_job_to_notebooklm_audio, job)
        return {"status": "accepted", "message": "NotebookLM audio generation started."}

    @app.post("/api/hermes/run")
    async def api_run_hermes(request: Request):
        data = await request.json()
        prompt = data.get("prompt")
        if not prompt:
            raise HTTPException(status_code=400, detail="No prompt provided")
        
        response = await run_hermes_autonomous_workflow(prompt)
        return {"response": response}

    @app.post("/api/rowboat/chat")
    def rowboat_chat(request: RowboatChatRequest) -> dict[str, Any]:
        try:
            response = rowboat_client.chat(
                request.message,
                conversation_id=request.conversation_id,
                mock_tools=request.mock_tools,
            )
        except RuntimeError as exc:
            raise HTTPException(status_code=503, detail=str(exc)) from exc
        except Exception as exc:
            raise HTTPException(status_code=502, detail=f"Rowboat request failed: {exc}") from exc

        return {
            "conversation_id": response.get("conversationId"),
            "output_text": extract_output_text(response),
            "raw": response,
        }

    @app.get("/", response_class=HTMLResponse)
    def dashboard() -> str:
        return create_dashboard_html(app.title)

    # ---- Pipeline endpoints ------------------------------------------------

    @app.post("/api/pipeline/run", status_code=202)
    def pipeline_run(request: PipelineRunRequest) -> dict[str, Any]:
        """Submit a task to the multi-model pipeline (free workers → paid reviewers/testers/QA)."""
        _executor = manager.executor
        run = pipeline_repository.create(request.task_type, request.title, request.objective)
        _executor.submit(pipeline_orchestrator.run, run.id)
        return {"run_id": run.id, "status": run.status, "message": "Pipeline started"}

    @app.get("/api/pipeline/runs")
    def pipeline_list(limit: int = 50) -> list[dict[str, Any]]:
        """List recent pipeline runs."""
        return [pipeline_run_to_dict(r) for r in pipeline_repository.list_runs(limit)]

    @app.get("/api/pipeline/runs/{run_id}")
    def pipeline_get(run_id: str) -> dict[str, Any]:
        """Get pipeline run details including all stage outputs."""
        run = pipeline_repository.get(run_id)
        if not run:
            raise HTTPException(status_code=404, detail="Pipeline run not found")
        return pipeline_run_to_dict(run)

    @app.get("/api/pipeline/stats")
    def pipeline_stats() -> dict[str, Any]:
        """Pipeline run statistics and configured model roles."""
        stats = pipeline_repository.get_stats()
        models_by_role: dict[str, list[str]] = {}
        for m in config.models:
            for role in m.roles:
                models_by_role.setdefault(role, []).append(f"{m.id} [{m.tier}]")
        return {"stats": stats, "models_by_role": models_by_role}

    # Register provider management endpoints
    register_provider_endpoints(app, credentials)

    # Register Jarvis voice command endpoints
    register_jarvis_endpoints(app)

    # Register workspace management endpoints
    register_workspace_endpoints(app)

    return app


def run() -> None:
    uvicorn.run("ai_automation_orchestrator.webapp:create_app", factory=True, host="0.0.0.0", port=8015)
