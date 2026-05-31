import * as vscode from "vscode";
import type { Database } from "../../storage/Database.ts";
import { SkillRepository } from "../../storage/repositories/SkillRepository.ts";
import type { Skill } from "../../storage/entities.ts";

export class SkillItem extends vscode.TreeItem {
  constructor(readonly skill: Skill) {
    super(skill.name, vscode.TreeItemCollapsibleState.None);
    this.contextValue = "skillItem";
    this.iconPath = new vscode.ThemeIcon("lightbulb");
    this.description = skill.scope;
    this.tooltip = skill.description ?? skill.skillBody?.slice(0, 120) ?? "";
  }
}

export class SkillsProvider implements vscode.TreeDataProvider<SkillItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<SkillItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private repo: SkillRepository;

  constructor(
    private readonly db: Database,
    private workspaceId: string,
  ) {
    this.repo = new SkillRepository(db);
  }

  refresh(workspaceId?: string): void {
    if (workspaceId) this.workspaceId = workspaceId;
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: SkillItem): vscode.TreeItem {
    return element;
  }

  getChildren(): SkillItem[] {
    if (!this.workspaceId) return [];
    return this.repo
      .findAll()
      .filter((s) => s.workspaceId === this.workspaceId || s.scope === "global")
      .map((s) => new SkillItem(s));
  }
}
