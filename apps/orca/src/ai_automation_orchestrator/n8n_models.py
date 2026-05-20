"""N8n-compatible workflow models and schemas."""

from typing import Any, Optional, Dict, List
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime


class N8nPosition(BaseModel):
    """Node position in the canvas."""
    x: float
    y: float


class N8nNodeParameters(BaseModel):
    """Open-ended node parameters (allows extra fields)."""
    model_config = ConfigDict(extra="allow")


class N8nNode(BaseModel):
    """Represents a single node in the workflow."""
    id: str = Field(..., description="Unique node ID (UUID)")
    name: str = Field(..., description="Node display name")
    type: str = Field(..., description="Node type (e.g., 'orca-nodes-base.aiPrompt')")
    typeVersion: int = Field(default=1, description="Node type version")
    position: list[float] = Field(..., description="[x, y] position on canvas")
    parameters: Dict[str, Any] = Field(default_factory=dict, description="Node configuration")
    disabled: bool = Field(default=False, description="Whether node is disabled")
    notes: str = Field(default="", description="Node notes/documentation")


class N8nConnection(BaseModel):
    """Represents a connection between nodes."""
    node: str = Field(..., description="Destination node name")
    type: str = Field(default="main", description="Connection type")
    index: int = Field(default=0, description="Output index")


class N8nWorkflow(BaseModel):
    """Represents a complete n8n workflow."""
    id: str = Field(..., description="Workflow ID (UUID)")
    name: str = Field(..., description="Workflow name")
    active: bool = Field(default=False, description="Whether workflow is active")
    nodes: List[N8nNode] = Field(default_factory=list, description="List of nodes")
    connections: Dict[str, Dict[str, List[List[N8nConnection]]]] = Field(
        default_factory=dict,
        description="Connections: {nodeId: {type: [[connections]]}}"
    )
    settings: Dict[str, Any] = Field(
        default_factory=lambda: {"executionOrder": "v1"},
        description="Workflow settings"
    )
    createdAt: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updatedAt: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    orca_meta: Dict[str, Any] = Field(default_factory=dict, description="Orca-specific metadata")


class NodeTypeInfo(BaseModel):
    """Information about a node type."""
    type: str = Field(..., description="Node type ID")
    label: str = Field(..., description="Display label")
    color: str = Field(..., description="Hex color code")
    inputs: int = Field(..., description="Number of input ports")
    outputs: int = Field(..., description="Number of output ports")
    description: str = Field(default="", description="Node description")
    category: str = Field(default="core", description="Node category")


class WorkflowExecution(BaseModel):
    """Workflow execution record."""
    id: str = Field(..., description="Execution ID")
    workflow_id: str = Field(..., description="Parent workflow ID")
    user_id: str = Field(..., description="User who triggered execution")
    status: str = Field(..., description="Status: pending, running, success, error")
    startedAt: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    completedAt: Optional[str] = Field(default=None)
    result: Optional[Dict[str, Any]] = Field(default=None)
    error: Optional[str] = Field(default=None)
    logs: List[Dict[str, Any]] = Field(default_factory=list)


class WorkflowGenerateRequest(BaseModel):
    """Request to generate workflow from prompt."""
    prompt: str = Field(..., description="Natural language prompt")
    model_id: str = Field(default="gpt-4", description="LLM to use")
    systems: Optional[str] = Field(default=None, description="Comma-separated systems")


class WorkflowImportRequest(BaseModel):
    """Request to import external workflow."""
    json_data: Dict[str, Any] = Field(..., description="Workflow JSON")
    name: Optional[str] = Field(default=None, description="Override workflow name")


class WorkflowExportResponse(BaseModel):
    """Response with exported workflow."""
    workflow: N8nWorkflow
    json_str: str = Field(..., description="JSON string for export")
