import * as vscode from "vscode";
import type { Database } from "../../storage/Database.ts";
import { PromptExecutionRepository } from "../../storage/repositories/PromptExecutionRepository.ts";

export class EpicProgressItem extends vscode.TreeItem {
  constructor(
    readonly epicId: string,
    readonly epicKey: string,
    completionPercent: number,
    taskCount: number,
  ) {
    const pct = Math.round(completionPercent);
    super(
      `${epicKey} — ${pct}%`,
      taskCount > 0
        ? vscode.TreeItemCollapsibleState.Collapsed
        : vscode.TreeItemCollapsibleState.None,
    );
    this.contextValue = "epicProgress";
    this.iconPath = new vscode.ThemeIcon(pct >= 100 ? "check-all" : pct > 0 ? "loading" : "circle-large-outline");
    this.description = `${taskCount} task${taskCount !== 1 ? "s" : ""}`;
  }
}

export class TaskProgressItem extends vscode.TreeItem {
  constructor(
    taskKey: string,
    completionPercent: number,
    status: string,
  ) {
    super(
      `${taskKey} — ${Math.round(completionPercent)}%`,
      vscode.TreeItemCollapsibleState.None,
    );
    this.contextValue = "taskProgress";
    const icon =
      status === "done" ? "check" : completionPercent > 0 ? "loading" : "circle-large-outline";
    this.iconPath = new vscode.ThemeIcon(icon);
    this.description = status;
  }
}

export class OverallProgressItem extends vscode.TreeItem {
  constructor(overallPercent: number) {
    super(`Overall: ${Math.round(overallPercent)}%`, vscode.TreeItemCollapsibleState.None);
    this.contextValue = "overallProgress";
    this.iconPath = new vscode.ThemeIcon("graph");
    this.description = `${Math.round(overallPercent)}% complete`;
  }
}

type ProgressNode = OverallProgressItem | EpicProgressItem | TaskProgressItem;

export class PromptProgressProvider implements vscode.TreeDataProvider<ProgressNode> {
  private _onDidChangeTreeData = new vscode.EventEmitter<ProgressNode | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private repo: PromptExecutionRepository;

  constructor(
    private readonly db: Database,
    private workspaceId: string,
  ) {
    this.repo = new PromptExecutionRepository(db);
  }

  refresh(workspaceId?: string): void {
    if (workspaceId) this.workspaceId = workspaceId;
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: ProgressNode): vscode.TreeItem {
    return element;
  }

  getChildren(element?: ProgressNode): ProgressNode[] {
    if (!this.workspaceId) return [];

    if (!element) {
      const tasks = this.repo.findByWorkspace(this.workspaceId);
      if (tasks.length === 0) return [];

      const overall =
        tasks.reduce((sum, t) => sum + t.completionPercent, 0) / tasks.length;

      const byEpic = new Map<string, typeof tasks>();
      for (const t of tasks) {
        const list = byEpic.get(t.epic) ?? [];
        list.push(t);
        byEpic.set(t.epic, list);
      }

      const epicItems: EpicProgressItem[] = Array.from(byEpic.entries()).map(
        ([epicKey, epicTasks]) => {
          const epicPct =
            epicTasks.reduce((s, t) => s + t.completionPercent, 0) / epicTasks.length;
          return new EpicProgressItem(epicKey, epicKey, epicPct, epicTasks.length);
        },
      );

      return [new OverallProgressItem(overall), ...epicItems];
    }

    if (element instanceof EpicProgressItem) {
      return this.repo
        .findByWorkspace(this.workspaceId)
        .filter((t) => t.epic === element.epicKey)
        .map((t) => new TaskProgressItem(t.title, t.completionPercent, t.status));
    }

    return [];
  }
}
