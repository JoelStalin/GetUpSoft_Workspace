import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { TaskSubmissionDto } from './dto/task-submission.dto';

export interface TaskStatus {
  task_id: string;
  project_id: string;
  goal: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  priority: 'LOW' | 'NORMAL' | 'HIGH';
  result: unknown | null;
  error: string;
  created_at: string;
}

@Injectable()
export class WorkersService {
  private readonly tasks = new Map<string, TaskStatus>();

  submitTask(task: TaskSubmissionDto) {
    const taskId = randomUUID();
    const status: TaskStatus = {
      task_id: taskId,
      project_id: task.project_id,
      goal: task.goal,
      status: 'queued',
      priority: task.priority ?? 'NORMAL',
      result: null,
      error: '',
      created_at: new Date().toISOString(),
    };

    this.tasks.set(taskId, status);

    return {
      task_id: taskId,
      status: 'queued',
      project_id: task.project_id,
    };
  }

  getTaskStatus(taskId: string): TaskStatus {
    const task = this.tasks.get(taskId);
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  listTasks(): TaskStatus[] {
    return [...this.tasks.values()];
  }
}
