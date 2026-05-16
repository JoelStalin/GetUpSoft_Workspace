import * as vscode from "vscode";
import type { Database } from "../../storage/Database.ts";
import { ProjectMemoryRepository } from "../../storage/repositories/ProjectMemoryRepository.ts";
import { DecisionRepository } from "../../storage/repositories/DecisionRepository.ts";

export class MemoryItem extends vscode.TreeItem {
  constructor(
    label: string,
    readonly category: string,
    collapsibleState = vscode.TreeItemCollapsibleState.None,
  ) {
    super(label, collapsibleState);
    this.contextValue = "memoryItem";
    this.iconPath = new vscode.ThemeIcon("circle-filled");
  }
}

export class MemoryCategoryItem extends vscode.TreeItem {
  constructor(
    readonly category: string,
    count: number,
  ) {
    super(`${category} (${count})`, vscode.TreeItemCollapsibleState.Collapsed);
    this.contextValue = "memoryCategory";
    this.iconPath = new vscode.ThemeIcon("symbol-namespace");
  }
}

type ProjectMemoryNode = MemoryCategoryItem | MemoryItem;

export class ProjectMemoryProvider implements vscode.TreeDataProvider<ProjectMemoryNode> {
  private _onDidChangeTreeData = new vscode.EventEmitter<ProjectMemoryNode | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private memoryRepo: ProjectMemoryRepository;
  private decisionRepo: DecisionRepository;

  constructor(
    private readonly db: Database,
    private workspaceId: string,
  ) {
    this.memoryRepo = new ProjectMemoryRepository(db);
    this.decisionRepo = new DecisionRepository(db);
  }

  refresh(workspaceId?: string): void {
    if (workspaceId) this.workspaceId = workspaceId;
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: ProjectMemoryNode): vscode.TreeItem {
    return element;
  }

  getChildren(element?: ProjectMemoryNode): ProjectMemoryNode[] {
    if (!this.workspaceId) return [];

    if (!element) {
      const facts = this.memoryRepo.findByWorkspace(this.workspaceId);
      const decisions = this.decisionRepo.findByWorkspace(this.workspaceId);

      const byCategory = new Map<string, number>();
      for (const f of facts) {
        byCategory.set(f.category, (byCategory.get(f.category) ?? 0) + 1);
      }
      if (decisions.length > 0) {
        byCategory.set("decisions", decisions.length);
      }

      return Array.from(byCategory.entries()).map(
        ([cat, count]) => new MemoryCategoryItem(cat, count),
      );
    }

    if (element instanceof MemoryCategoryItem) {
      if (element.category === "decisions") {
        return this.decisionRepo
          .findByWorkspace(this.workspaceId)
          .map((d) => {
            const item = new MemoryItem(d.title, "decisions");
            item.tooltip = d.rationale;
            item.description = d.status;
            return item;
          });
      }

      return this.memoryRepo
        .findByCategory(this.workspaceId, element.category)
        .map((m) => {
          const item = new MemoryItem(m.fact, m.category);
          item.tooltip = `Confidence: ${m.confidence}`;
          item.description = m.category;
          return item;
        });
    }

    return [];
  }
}
