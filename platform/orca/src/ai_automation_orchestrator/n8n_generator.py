"""Generate n8n-compatible workflows from Orca prompts."""

from __future__ import annotations

import re
import uuid
from datetime import datetime
from typing import Any

from ai_automation_orchestrator.n8n_models import (
    N8nNode,
    N8nWorkflow,
    N8nConnection,
)


def infer_node_type(task_text: str) -> str:
    """Infer node type from task description."""
    text_lower = task_text.lower()

    if any(word in text_lower for word in ["api", "http", "request", "call", "fetch"]):
        return "orca-nodes-base.httpRequest"
    elif any(word in text_lower for word in ["validate", "check", "verify", "if", "condition", "when"]):
        return "orca-nodes-base.condition"
    elif any(word in text_lower for word in ["loop", "iterate", "repeat", "for each"]):
        return "orca-nodes-base.loop"
    elif any(word in text_lower for word in ["variable", "store", "save", "set"]):
        return "orca-nodes-base.setVariable"
    elif any(word in text_lower for word in ["run", "execute", "execute", "command", "script", "bash", "shell"]):
        return "orca-nodes-base.executeCommand"
    elif any(word in text_lower for word in ["ai", "model", "prompt", "generate", "llm"]):
        return "orca-nodes-base.aiPrompt"
    else:
        return "orca-nodes-base.aiPrompt"  # default


def clean_task_name(task_text: str, max_length: int = 50) -> str:
    """Clean and shorten task text for node name."""
    # Remove markdown bullets/numbers
    cleaned = re.sub(r"^[-*•]\s*", "", task_text.strip())
    cleaned = re.sub(r"^\d+\.\s*", "", cleaned)
    # Truncate
    if len(cleaned) > max_length:
        cleaned = cleaned[:max_length].rsplit(" ", 1)[0] + "..."
    return cleaned


def _extract_tasks(automation_flow_text: str) -> list[str]:
    """Extract task list from markdown automation flow text."""
    lines = automation_flow_text.split("\n")
    tasks = []

    in_tasks_section = False
    for line in lines:
        line = line.strip()

        # Detect task section header
        if line.lower().startswith("## task") or line.lower().startswith("### task"):
            in_tasks_section = True
            continue

        # Stop if we hit another major section
        if in_tasks_section and line.startswith("## ") and "task" not in line.lower():
            break

        # Extract task lines (bullets or numbered)
        if in_tasks_section and (line.startswith("-") or line.startswith("*") or re.match(r"^\d+\.", line)):
            tasks.append(line.lstrip("-* ").lstrip("0123456789. "))

    return [t for t in tasks if t]  # filter empty


async def generate_n8n_workflow(
    prompt: str,
    model_id: str = "kimi-k2-6",
    context: str = "",
) -> N8nWorkflow:
    """
    Generate an n8n-compatible workflow from a natural language prompt.

    1. Call Orca's automation flow generator
    2. Parse tasks from markdown
    3. Map each task to a visual node
    4. Create connections in sequence
    5. Return N8nWorkflow
    """
    from ai_automation_orchestrator.generators.automation_flows import (
        build_automation_flow_messages,
    )
    from ai_automation_orchestrator.service import OrchestratorService
    from ai_automation_orchestrator.config import get_settings

    settings = get_settings()
    service = OrchestratorService.from_config(settings)

    # Generate automation flow via AI
    messages = build_automation_flow_messages(
        goal=prompt,
        systems=context if context else "N/A",
        context="Generate a workflow with clear, sequential tasks.",
    )

    response = await service.generate(messages=messages, model_id=model_id)
    automation_text = response if isinstance(response, str) else str(response)

    # Parse tasks from markdown
    tasks = _extract_tasks(automation_text)
    if not tasks:
        # Fallback: use the first line of input as a single task
        tasks = [prompt[:80]]

    # Create nodes
    nodes: list[N8nNode] = []
    node_names: list[str] = []

    # Add trigger node
    trigger_node = N8nNode(
        id=str(uuid.uuid4()),
        name="Trigger",
        type="orca-nodes-base.trigger",
        typeVersion=1,
        position=[100, 300],
        parameters={},
    )
    nodes.append(trigger_node)
    node_names.append(trigger_node.name)

    # Add task nodes
    for idx, task in enumerate(tasks):
        x_pos = 350 + (idx * 250)
        node_type = infer_node_type(task)
        node_name = clean_task_name(task)

        node = N8nNode(
            id=str(uuid.uuid4()),
            name=node_name,
            type=node_type,
            typeVersion=1,
            position=[x_pos, 300],
            parameters={
                "prompt": task if "aiPrompt" in node_type else None,
                "url": None if "httpRequest" not in node_type else "https://api.example.com",
                "method": "POST" if "httpRequest" in node_type else None,
            },
            notes=task,
        )
        nodes.append(node)
        node_names.append(node.name)

    # Add end node
    end_node = N8nNode(
        id=str(uuid.uuid4()),
        name="End",
        type="orca-nodes-base.end",
        typeVersion=1,
        position=[350 + (len(tasks) * 250), 300],
        parameters={},
    )
    nodes.append(end_node)
    node_names.append(end_node.name)

    # Build connections: each node -> next node
    connections: dict[str, dict[str, list[list[N8nConnection]]]] = {}
    for i in range(len(node_names) - 1):
        source_name = node_names[i]
        target_name = node_names[i + 1]

        if source_name not in connections:
            connections[source_name] = {"main": []}

        connection = N8nConnection(node=target_name, type="main", index=0)
        # Ensure the structure exists
        if not connections[source_name]["main"]:
            connections[source_name]["main"] = [[]]

        connections[source_name]["main"][0].append(connection)

    # Create workflow
    workflow = N8nWorkflow(
        id=str(uuid.uuid4()),
        name=prompt[:50],
        active=False,
        nodes=nodes,
        connections=connections,
        settings={"executionOrder": "v1"},
        createdAt=datetime.utcnow().isoformat(),
        updatedAt=datetime.utcnow().isoformat(),
        orca_meta={
            "source_prompt": prompt,
            "model_id": model_id,
            "generated_at": datetime.utcnow().isoformat(),
            "task_count": len(tasks),
        },
    )

    return workflow
