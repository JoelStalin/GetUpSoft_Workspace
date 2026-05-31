import * as vscode from "vscode";
import type { Database } from "../../storage/Database.ts";
import { AgentRepository } from "../../storage/repositories/AgentRepository.ts";
import type { Agent } from "../../storage/entities.ts";
import { ModelRoutingService } from "../../services/ModelRoutingService.ts";

export class AgentItem extends vscode.TreeItem {
  constructor(readonly agent: Agent, selectedModel?: string) {
    super(agent.name, vscode.TreeItemCollapsibleState.None);
    this.contextValue = "agentItem";
    this.iconPath = new vscode.ThemeIcon("robot");
    this.description = selectedModel ? `${agent.adapterType} · ${selectedModel}` : agent.adapterType;
    this.tooltip = selectedModel
      ? `Adapter: ${agent.adapterType}\nModel: ${selectedModel}`
      : `Adapter: ${agent.adapterType}`;
  }
}

export class AgentsProvider implements vscode.TreeDataProvider<AgentItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<AgentItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private repo: AgentRepository;
  private routing: ModelRoutingService;

  constructor(
    private readonly db: Database,
    private workspaceId: string,
  ) {
    this.repo = new AgentRepository(db);
    this.routing = new ModelRoutingService(db);
  }

  refresh(workspaceId?: string): void {
    if (workspaceId) this.workspaceId = workspaceId;
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: AgentItem): vscode.TreeItem {
    return element;
  }

  getChildren(): AgentItem[] {
    if (!this.workspaceId) return [];
    return this.repo
      .findByWorkspace(this.workspaceId)
      .map((a) => {
        const routed = this.routing.recommendForAgent(this.workspaceId, { agentType: a.name });
        const selectedModel = routed ? `${routed.provider} ${routed.model}` : undefined;
        return new AgentItem(a, selectedModel);
      });
  }
}
