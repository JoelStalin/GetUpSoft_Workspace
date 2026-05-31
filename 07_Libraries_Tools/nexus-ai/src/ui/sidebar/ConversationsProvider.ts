import * as vscode from "vscode";
import type { Database } from "../../storage/Database.ts";
import { ConversationRepository } from "../../storage/repositories/ConversationRepository.ts";
import type { Conversation } from "../../storage/entities.ts";

export class ConversationItem extends vscode.TreeItem {
  constructor(readonly conversation: Conversation) {
    super(
      conversation.title ?? conversation.sourceAgent,
      vscode.TreeItemCollapsibleState.None,
    );
    this.contextValue = "conversationItem";
    this.iconPath = new vscode.ThemeIcon(
      conversation.status === "active" ? "comment-discussion" : "comment",
    );
    this.description = conversation.sourceAgent;
    this.tooltip = conversation.summary ?? conversation.title ?? "";
  }
}

export class ConversationsProvider implements vscode.TreeDataProvider<ConversationItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<ConversationItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private repo: ConversationRepository;

  constructor(
    private readonly db: Database,
    private workspaceId: string,
  ) {
    this.repo = new ConversationRepository(db);
  }

  refresh(workspaceId?: string): void {
    if (workspaceId) this.workspaceId = workspaceId;
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: ConversationItem): vscode.TreeItem {
    return element;
  }

  getChildren(): ConversationItem[] {
    if (!this.workspaceId) return [];
    return this.repo
      .findByWorkspace(this.workspaceId)
      .map((c) => new ConversationItem(c));
  }
}
