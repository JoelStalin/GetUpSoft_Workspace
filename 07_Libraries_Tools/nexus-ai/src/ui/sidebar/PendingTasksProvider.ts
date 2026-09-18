import * as vscode from "vscode";
import type { Database } from "../../storage/Database.ts";
import { TaskRepository } from "../../storage/repositories/TaskRepository.ts";
import type { Task } from "../../storage/entities.ts";

const STATUS_ICONS: Record<string, string> = {
  pending: "circle-large-outline",
  in_progress: "loading~spin",
  done: "check",
  blocked: "error",
};

export class TaskItem extends vscode.TreeItem {
  constructor(readonly task: Task) {
    super(task.title, vscode.TreeItemCollapsibleState.None);
    this.contextValue = "taskItem";
    const icon = STATUS_ICONS[task.status] ?? "circle-large-outline";
    this.iconPath = new vscode.ThemeIcon(icon);
    this.description = `${task.epic} · ${task.status}`;
    this.tooltip = task.description ?? task.title;
  }
}

export class EpicItem extends vscode.TreeItem {
  constructor(
    readonly epic: string,
    readonly tasks: Task[],
  ) {
    const done = tasks.filter((t) => t.status === "done").length;
    super(
      `${epic} (${done}/${tasks.length})`,
      vscode.TreeItemCollapsibleState.Collapsed,
    );
    this.contextValue = "epicItem";
    this.iconPath = new vscode.ThemeIcon("folder");
  }
}

type TaskNode = EpicItem | TaskItem;

export class PendingTasksProvider implements vscode.TreeDataProvider<TaskNode> {
  private _onDidChangeTreeData = new vscode.EventEmitter<TaskNode | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private taskRepo: TaskRepository;

  constructor(
    private readonly db: Database,
    private workspaceId: string,
  ) {
    this.taskRepo = new TaskRepository(db);
  }

  refresh(workspaceId?: string): void {
    if (workspaceId) this.workspaceId = workspaceId;
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: TaskNode): vscode.TreeItem {
    return element;
  }

  getChildren(element?: TaskNode): TaskNode[] {
    if (!this.workspaceId) return [];

    if (!element) {
      const allTasks = this.taskRepo.findByWorkspace(this.workspaceId);
      const byEpic = new Map<string, Task[]>();
      for (const t of allTasks) {
        const list = byEpic.get(t.epic) ?? [];
        list.push(t);
        byEpic.set(t.epic, list);
      }
      return Array.from(byEpic.entries()).map(([epic, tasks]) => new EpicItem(epic, tasks));
    }

    if (element instanceof EpicItem) {
      return element.tasks.map((t) => new TaskItem(t));
    }

    return [];
  }
}
