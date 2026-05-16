import fs from 'fs/promises';
import path from 'path';

export interface Task {
  id: string;
  name: string;
  status: 'pending' | 'ready' | 'in_progress' | 'blocked' | 'awaiting_validation' | 'validated' | 'completed';
  description?: string;
  phase?: string;
}

export class LedgerService {
  private ledgerPath: string;

  constructor(basePath: string = 'task-ledger') {
    this.ledgerPath = path.join(process.cwd(), '06_E_Commerce_Lux', 'Galantesjewelry', basePath, 'tasks.json');
  }

  async getTasks(): Promise<Task[]> {
    try {
      const data = await fs.readFile(this.ledgerPath, 'utf-8');
      const parsed = JSON.parse(data);
      return parsed.tasks || [];
    } catch (error) {
      console.error('Error reading ledger:', error);
      return [];
    }
  }

  async updateTaskStatus(taskId: string, status: Task['status']): Promise<void> {
    const tasks = await this.getTasks();
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex !== -1) {
      tasks[taskIndex].status = status;
      await this.saveTasks(tasks);
      console.log(`Task ${taskId} status updated to ${status}`);
    } else {
      console.warn(`Task ${taskId} not found in ledger.`);
    }
  }

  private async saveTasks(tasks: Task[]): Promise<void> {
    const data = JSON.stringify({ tasks }, null, 2);
    await fs.writeFile(this.ledgerPath, data, 'utf-8');
  }

  async logExecution(message: string): Promise<void> {
    const logPath = path.join(path.dirname(this.ledgerPath), 'execution-log.ndjson');
    const entry = {
      timestamp: new Date().toISOString(),
      message,
    };
    await fs.appendFile(logPath, JSON.stringify(entry) + '\n', 'utf-8');
  }
}

export const ledgerService = new LedgerService();
