import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LedgerService } from '../../src/services/ledgerService';
import fs from 'fs/promises';

vi.mock('fs/promises');

describe('LedgerService', () => {
  let service: LedgerService;

  beforeEach(() => {
    service = new LedgerService('test-ledger');
    vi.clearAllMocks();
  });

  it('should read tasks correctly', async () => {
    const mockTasks = { tasks: [{ id: '1', name: 'Test Task', status: 'pending' }] };
    (fs.readFile as any).mockResolvedValue(JSON.stringify(mockTasks));

    const tasks = await service.getTasks();
    expect(tasks).toHaveLength(1);
    expect(tasks[0].id).toBe('1');
  });

  it('should update task status', async () => {
    const mockTasks = { tasks: [{ id: '1', name: 'Test Task', status: 'pending' }] };
    (fs.readFile as any).mockResolvedValue(JSON.stringify(mockTasks));
    (fs.writeFile as any).mockResolvedValue(undefined);

    await service.updateTaskStatus('1', 'completed');

    expect(fs.writeFile).toHaveBeenCalled();
    const savedData = JSON.parse((fs.writeFile as any).mock.calls[0][1]);
    expect(savedData.tasks[0].status).toBe('completed');
  });
});
