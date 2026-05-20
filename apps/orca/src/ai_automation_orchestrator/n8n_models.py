"""n8n-compatible workflow data models."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field, ConfigDict


class N8nNodeParameters(BaseModel):
    """Open-schema node parameters (any field allowed)."""

    model_config = ConfigDict(extra="allow")


class N8nNode(BaseModel):
    """n8n-compatible node in a workflow."""

    id: str = Field(..., description="Node UUID")
    name: str = Field(..., description="Node display name")
    type: str = Field(
        ...,
        description="Node type (e.g. 'orca-nodes-base.aiPrompt' or 'n8n-nodes-base.slack')",
    )
    typeVersion: int | float = Field(default=1, description="Node type version")
    position: list[float] = Field(
        ..., description="[x, y] position on canvas"
    )
    parameters: dict[str, Any] = Field(default_factory=dict, description="Node configuration")
    disabled: bool = Field(default=False, description="Whether node is disabled")
    notes: str = Field(default="", description="User notes for this node")
    credentials: dict[str, Any] = Field(
        default_factory=dict, description="References to credentials"
    )


class N8nConnection(BaseModel):
    """A connection FROM one node TO another."""

    node: str = Field(..., description="Target node name")
    type: str = Field(default="main", description="Connection type (main/error/etc)")
    index: int = Field(default=0, description="Output index on source node")


class N8nWorkflow(BaseModel):
    """n8n-compatible workflow definition."""

    id: str = Field(..., description="Workflow UUID")
    name: str = Field(..., description="Workflow display name")
    active: bool = Field(default=False, description="Is workflow active")
    nodes: list[N8nNode] = Field(default_factory=list, description="Workflow nodes")
    connections: dict[str, dict[str, list[list[N8nConnection]]]] = Field(
        default_factory=dict,
        description="Connections by source node name: {nodeName: {main: [[{node, type, index}]]}}"
    )
    settings: dict[str, Any] = Field(
        default_factory=lambda: {"executionOrder": "v1"},
        description="Workflow settings"
    )
    createdAt: str = Field(default_factory=lambda: datetime.utcnow().isoformat(), description="Creation timestamp")
    updatedAt: str = Field(default_factory=lambda: datetime.utcnow().isoformat(), description="Last update timestamp")
    orca_meta: dict[str, Any] = Field(
        default_factory=dict,
        description="Orca-specific metadata (objective, model_id, etc)"
    )

    def to_json_dict(self) -> dict[str, Any]:
        """Export as n8n-compatible JSON dict."""
        return {
            "id": self.id,
            "name": self.name,
            "active": self.active,
            "nodes": [node.model_dump(exclude_none=True) for node in self.nodes],
            "connections": {
                source: {
                    branch_type: [
                        [conn.model_dump(exclude_none=True) for conn in connections]
                        for connections in branches
                    ]
                    for branch_type, branches in node_conns.items()
                }
                for source, node_conns in self.connections.items()
            },
            "settings": self.settings,
            "createdAt": self.createdAt,
            "updatedAt": self.updatedAt,
        }


class N8nNodeType(BaseModel):
    """Available node type in the Orca catalog."""

    type: str = Field(..., description="Full node type identifier")
    label: str = Field(..., description="Display label")
    color: str = Field(..., description="Node color (hex)")
    inputs: int = Field(default=1, description="Number of inputs")
    outputs: int = Field(default=1, description="Number of outputs")
    icon: str = Field(default="", description="Icon name")
    description: str = Field(default="", description="Node description")


# Orca node type catalog
NODE_TYPE_CATALOG: dict[str, N8nNodeType] = {
    "orca-nodes-base.trigger": N8nNodeType(
        type="orca-nodes-base.trigger",
        label="Trigger",
        color="#ff6d5a",
        inputs=0,
        outputs=1,
        icon="bell",
        description="Start a workflow execution",
    ),
    "orca-nodes-base.aiPrompt": N8nNodeType(
        type="orca-nodes-base.aiPrompt",
        label="AI Prompt",
        color="#7c4dff",
        inputs=1,
        outputs=1,
        icon="brain",
        description="Call an AI model with a prompt",
    ),
    "orca-nodes-base.httpRequest": N8nNodeType(
        type="orca-nodes-base.httpRequest",
        label="HTTP Request",
        color="#1a9ba1",
        inputs=1,
        outputs=1,
        icon="globe",
        description="Make an HTTP request to an API",
    ),
    "orca-nodes-base.condition": N8nNodeType(
        type="orca-nodes-base.condition",
        label="Condition",
        color="#ff9f43",
        inputs=1,
        outputs=2,
        icon="git-branch",
        description="Branch workflow based on a condition",
    ),
    "orca-nodes-base.loop": N8nNodeType(
        type="orca-nodes-base.loop",
        label="Loop",
        color="#10ac84",
        inputs=1,
        outputs=1,
        icon="repeat",
        description="Iterate over array items",
    ),
    "orca-nodes-base.setVariable": N8nNodeType(
        type="orca-nodes-base.setVariable",
        label="Set Variable",
        color="#576574",
        inputs=1,
        outputs=1,
        icon="variable",
        description="Store data in a variable",
    ),
    "orca-nodes-base.executeCommand": N8nNodeType(
        type="orca-nodes-base.executeCommand",
        label="Execute",
        color="#ee5a24",
        inputs=1,
        outputs=1,
        icon="play",
        description="Execute a command or script",
    ),
    "orca-nodes-base.end": N8nNodeType(
        type="orca-nodes-base.end",
        label="End",
        color="#353b48",
        inputs=1,
        outputs=0,
        icon="flag-finish",
        description="End workflow execution",
    ),
}


class WorkflowGenerateRequest(BaseModel):
    """Request to generate a workflow from a prompt."""

    prompt: str = Field(..., description="Natural language workflow description")
    model_id: str = Field(default="kimi-k2-6", description="AI model to use")
    context: str = Field(default="", description="Additional context")


class WorkflowExecutionRequest(BaseModel):
    """Request to execute a workflow."""

    workflow_id: str = Field(..., description="Workflow UUID to execute")
    input_data: dict[str, Any] = Field(default_factory=dict, description="Input data for the workflow")


class WorkflowDirectoryImportRequest(BaseModel):
    """Request to import many n8n workflow JSON files from a local directory."""

    source_path: str = Field(..., description="Local directory containing n8n workflow JSON files")
    limit: int | None = Field(default=None, ge=1, description="Maximum workflows to import")
    dry_run: bool = Field(default=False, description="Validate and report without persisting workflows")
