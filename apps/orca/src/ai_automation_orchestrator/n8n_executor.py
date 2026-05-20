"""Execute n8n-compatible workflows."""

from __future__ import annotations

import asyncio
import uuid
from datetime import UTC, datetime
from typing import Any, AsyncGenerator
from dataclasses import dataclass, field

from ai_automation_orchestrator.n8n_models import N8nWorkflow


@dataclass
class ExecutionState:
    """State of a workflow execution."""

    execution_id: str
    workflow_id: str
    status: str = "pending"  # pending, running, completed, failed
    start_time: str = field(default_factory=lambda: datetime.now(UTC).isoformat())
    end_time: str | None = None
    node_results: dict[str, Any] = field(default_factory=dict)
    node_errors: dict[str, str] = field(default_factory=dict)
    node_status: dict[str, str] = field(default_factory=dict)
    logs: list[str] = field(default_factory=list)


class WorkflowExecutor:
    """Execute n8n-compatible workflows."""

    def __init__(self):
        self.executions: dict[str, ExecutionState] = {}

    async def execute_workflow(
        self,
        workflow: N8nWorkflow,
        input_data: dict[str, Any] | None = None,
        execution_id: str | None = None,
    ) -> AsyncGenerator[dict[str, Any], None]:
        """
        Execute a workflow and yield execution updates.

        Yields:
            dict with keys: execution_id, node_id, status, result, error, timestamp
        """
        execution_id = execution_id or str(uuid.uuid4())
        execution = ExecutionState(
            execution_id=execution_id,
            workflow_id=workflow.id,
        )
        self.executions[execution_id] = execution

        try:
            execution.status = "running"
            yield {
                "execution_id": execution_id,
                "workflow_id": workflow.id,
                "status": "running",
                "timestamp": datetime.now(UTC).isoformat(),
            }

            # Initialize node inputs with workflow input
            node_inputs = {node.id: {} for node in workflow.nodes}
            if input_data:
                # Trigger node gets the input data
                trigger_nodes = [n for n in workflow.nodes if "trigger" in n.type.lower()]
                for trigger in trigger_nodes:
                    node_inputs[trigger.id] = input_data

            # Execute nodes in order (topological sort)
            executed_nodes = set()
            current_nodes = [
                n for n in workflow.nodes if "trigger" in n.type.lower()
            ]

            while current_nodes and len(executed_nodes) < len(workflow.nodes):
                next_nodes = []

                for node in current_nodes:
                    if node.id in executed_nodes:
                        continue

                    # Execute node
                    try:
                        execution.node_status[node.id] = "running"
                        yield {
                            "execution_id": execution_id,
                            "node_id": node.id,
                            "node_name": node.name,
                            "status": "running",
                            "timestamp": datetime.now(UTC).isoformat(),
                        }

                        # Simulate node execution (in real implementation, would call actual services)
                        result = await self._execute_node(node, node_inputs.get(node.id, {}))

                        execution.node_results[node.id] = result
                        execution.node_status[node.id] = "completed"

                        yield {
                            "execution_id": execution_id,
                            "node_id": node.id,
                            "node_name": node.name,
                            "status": "completed",
                            "result": result,
                            "timestamp": datetime.now(UTC).isoformat(),
                        }

                        executed_nodes.add(node.id)

                        # Find connected nodes
                        for source, connections in workflow.connections.items():
                            source_node = next(
                                (n for n in workflow.nodes if n.name == source), None
                            )
                            if source_node and source_node.id == node.id:
                                for branch in connections.get("main", []):
                                    for conn in branch:
                                        target_name = conn.node
                                        target_node = next(
                                            (
                                                n
                                                for n in workflow.nodes
                                                if n.name == target_name
                                            ),
                                            None,
                                        )
                                        if target_node and target_node.id not in executed_nodes:
                                            next_nodes.append(target_node)
                                            # Pass output as input
                                            node_inputs[target_node.id] = result

                    except Exception as e:
                        execution.node_errors[node.id] = str(e)
                        execution.node_status[node.id] = "failed"

                        yield {
                            "execution_id": execution_id,
                            "node_id": node.id,
                            "node_name": node.name,
                            "status": "failed",
                            "error": str(e),
                            "timestamp": datetime.now(UTC).isoformat(),
                        }

                        executed_nodes.add(node.id)

                # Move to next batch
                deduped_next_nodes = {}
                for next_node in next_nodes:
                    deduped_next_nodes[next_node.id] = next_node
                current_nodes = list(deduped_next_nodes.values())
                await asyncio.sleep(0.1)  # Yield to event loop

            # Mark as completed
            execution.status = "completed"
            execution.end_time = datetime.now(UTC).isoformat()

            yield {
                "execution_id": execution_id,
                "workflow_id": workflow.id,
                "status": "completed",
                "node_count": len(workflow.nodes),
                "successful": len(execution.node_results),
                "failed": len(execution.node_errors),
                "timestamp": datetime.now(UTC).isoformat(),
            }

        except Exception as e:
            execution.status = "failed"
            execution.end_time = datetime.now(UTC).isoformat()

            yield {
                "execution_id": execution_id,
                "workflow_id": workflow.id,
                "status": "failed",
                "error": str(e),
                "timestamp": datetime.now(UTC).isoformat(),
            }

    async def _execute_node(self, node, inputs: dict[str, Any]) -> dict[str, Any]:
        """Execute a single node."""
        node_type = node.type

        # Simulate execution based on node type
        if "trigger" in node_type.lower():
            return {"triggered_at": datetime.now(UTC).isoformat(), **inputs}

        elif "httpRequest" in node_type:
            # Simulate HTTP request
            await asyncio.sleep(0.2)
            return {
                "status_code": 200,
                "data": {"message": "Request successful"},
                "request": node.parameters.get("url", ""),
            }

        elif "aiPrompt" in node_type:
            # Simulate AI prompt execution
            await asyncio.sleep(0.3)
            prompt = node.parameters.get("prompt", "")
            return {
                "prompt": prompt,
                "response": f"AI response to: {prompt[:50]}...",
                "tokens_used": 42,
            }

        elif "condition" in node_type:
            # Simulate conditional execution
            await asyncio.sleep(0.1)
            return {"condition_met": True, "branch": "true"}

        elif "loop" in node_type:
            # Simulate loop
            await asyncio.sleep(0.15)
            items = inputs.get("items", [])
            return {"iterations": len(items), "processed": items}

        elif "setVariable" in node_type:
            # Simulate variable setting
            return {"variable_set": node.parameters.get("variable"), "value": inputs}

        elif "executeCommand" in node_type:
            # Simulate command execution
            await asyncio.sleep(0.1)
            return {"exit_code": 0, "output": "Command executed successfully"}

        elif "end" in node_type:
            # End node
            return {"workflow_completed": True, "final_output": inputs}

        else:
            # Unknown node type
            return {"node_type": node_type, "status": "skipped"}

    def get_execution(self, execution_id: str) -> ExecutionState | None:
        """Get execution state by ID."""
        return self.executions.get(execution_id)

    def get_execution_summary(self, execution_id: str) -> dict[str, Any]:
        """Get execution summary."""
        execution = self.executions.get(execution_id)
        if not execution:
            return {}

        return {
            "execution_id": execution.execution_id,
            "workflow_id": execution.workflow_id,
            "status": execution.status,
            "start_time": execution.start_time,
            "end_time": execution.end_time,
            "duration_seconds": (
                (
                    datetime.fromisoformat(execution.end_time)
                    - datetime.fromisoformat(execution.start_time)
                ).total_seconds()
                if execution.end_time
                else None
            ),
            "node_results": execution.node_results,
            "node_errors": execution.node_errors,
            "node_status": execution.node_status,
            "successful_nodes": len(execution.node_results),
            "failed_nodes": len(execution.node_errors),
        }
