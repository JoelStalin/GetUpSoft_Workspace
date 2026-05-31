import * as vscode from "vscode";
import type { Database } from "../../storage/Database.ts";
import { JobQueueService } from "../../services/JobQueueService.ts";
import type { Job } from "../../storage/entities.ts";

// ─── Tree items ───────────────────────────────────────────────────────────────

export class AgentQueueItem extends vscode.TreeItem {
  constructor(
    readonly agentType: string,
    readonly pending: number,
  ) {
    super(agentType, pending > 0
      ? vscode.TreeItemCollapsibleState.Collapsed
      : vscode.TreeItemCollapsibleState.None,
    );
    this.contextValue = "agentQueueItem";
    this.iconPath = new vscode.ThemeIcon(
      pending > 0 ? "loading~spin" : "circle-large-outline",
    );
    this.description = pending > 0 ? `${pending} pending` : "idle";
    this.tooltip = `${agentType}: ${pending} job(s) in queue`;
  }
}

export class JobItem extends vscode.TreeItem {
  constructor(readonly job: Job) {
    super(job.jobType, vscode.TreeItemCollapsibleState.None);
    this.contextValue = "jobItem";
    this.iconPath = new vscode.ThemeIcon(statusIcon(job.status));
    this.description = `[${job.status}] p=${job.priority}`;
    this.tooltip = `Job ${job.id.slice(0, 8)} — ${job.jobType} — ${job.status}\nRetries: ${job.retryCount}/${job.maxRetries}`;
  }
}

function statusIcon(status: string): string {
  switch (status) {
    case "pending": return "clock";
    case "claimed":
    case "processing": return "loading~spin";
    case "completed": return "check";
    case "failed": return "warning";
    case "dead": return "error";
    default: return "circle-outline";
  }
}

type QueueTreeItem = AgentQueueItem | JobItem;

// ─── Provider ────────────────────────────────────────────────────────────────

export class JobQueueProvider implements vscode.TreeDataProvider<QueueTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<QueueTreeItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private svc: JobQueueService;

  constructor(
    private readonly db: Database,
    private workspaceId: string,
  ) {
    this.svc = new JobQueueService(db);
  }

  refresh(workspaceId?: string): void {
    if (workspaceId) this.workspaceId = workspaceId;
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: QueueTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: QueueTreeItem): QueueTreeItem[] {
    if (!this.workspaceId) return [];

    if (!element) {
      // Root: one row per agent type that has any queued jobs
      const depths = this.svc.allQueueDepths();
      if (depths.length === 0) {
        return [new AgentQueueItem("(no jobs in queue)", 0)];
      }
      return depths.map((d) => new AgentQueueItem(d.agentType, d.count));
    }

    if (element instanceof AgentQueueItem && element.pending > 0) {
      // Children: active jobs for this agent type in this workspace
      return this.svc
        .allFor(this.workspaceId)
        .filter(
          (j) =>
            j.agentType === element.agentType &&
            ["pending", "claimed", "processing", "failed"].includes(j.status),
        )
        .slice(0, 20)
        .map((j) => new JobItem(j));
    }

    return [];
  }
}
