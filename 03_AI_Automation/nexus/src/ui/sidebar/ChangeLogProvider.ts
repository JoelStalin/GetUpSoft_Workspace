import * as vscode from "vscode";
import type { Database } from "../../storage/Database.ts";
import { ChangeLogRepository } from "../../storage/repositories/ChangeLogRepository.ts";
import type { ChangeLogEntry } from "../../storage/entities.ts";

const CHANGE_ICONS: Record<string, string> = {
  add: "add",
  modify: "edit",
  delete: "trash",
  refactor: "symbol-misc",
  fix: "bug",
  docs: "book",
};

export class ChangeLogItem extends vscode.TreeItem {
  constructor(readonly entry: ChangeLogEntry) {
    super(entry.title, vscode.TreeItemCollapsibleState.None);
    this.contextValue = "changeLogItem";
    const icon = CHANGE_ICONS[entry.changeType] ?? "history";
    this.iconPath = new vscode.ThemeIcon(icon);
    this.description = `${entry.agentId ?? "unknown"} · ${entry.createdAt.slice(0, 10)}`;
    this.tooltip = entry.reason;
  }
}

export class ChangeLogProvider implements vscode.TreeDataProvider<ChangeLogItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<ChangeLogItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private repo: ChangeLogRepository;

  constructor(
    private readonly db: Database,
    private workspaceId: string,
    private readonly limit = 50,
  ) {
    this.repo = new ChangeLogRepository(db);
  }

  refresh(workspaceId?: string): void {
    if (workspaceId) this.workspaceId = workspaceId;
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: ChangeLogItem): vscode.TreeItem {
    return element;
  }

  getChildren(): ChangeLogItem[] {
    if (!this.workspaceId) return [];
    return this.repo
      .findByWorkspace(this.workspaceId, this.limit)
      .map((e) => new ChangeLogItem(e));
  }
}
