import { ConfigService } from '@nestjs/config';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import * as path from 'node:path';
import { OrcaService } from './orca.service';

describe('OrcaService n8n workflow support', () => {
  let workspaceRoot: string;
  let service: OrcaService;

  beforeEach(() => {
    workspaceRoot = mkdtempSync(path.join(tmpdir(), 'orca-n8n-'));
    service = new OrcaService(
      new ConfigService({
        WORKSPACE_ROOT: workspaceRoot,
        ORCA_CANONICAL_LANGUAGE: 'es',
      }),
    );
  });

  afterEach(() => {
    rmSync(workspaceRoot, { recursive: true, force: true });
  });

  it('persists workflows with upsert and list semantics', async () => {
    const workflow = await service.upsertN8nWorkflow('wf-1', {
      name: 'Primer flujo',
      active: true,
      nodes: [{ id: 'node-1', data: { label: 'Trigger' }, position: { x: 10, y: 20 } }],
      connections: {},
      settings: { env: 'prod-like' },
    });

    expect(workflow.id).toBe('wf-1');
    expect(workflow.name).toBe('Primer flujo');
    expect(workflow.settings).toEqual({ env: 'prod-like' });

    const listed = await service.listN8nWorkflows({ limit: 50, offset: 0 });
    expect(listed.total).toBe(1);
    expect(listed.data[0]?.id).toBe('wf-1');
  });

  it('returns node types for the editor contract', () => {
    const nodeTypes = service.getNodeTypes();
    expect(nodeTypes['orca-nodes-base.trigger']).toMatchObject({
      label: 'Trigger',
      color: '#ff6d5a',
    });
    expect(nodeTypes['orca-nodes-base.aiPrompt']).toBeDefined();
  });

  it('generates a starter workflow payload compatible with the frontend modal', async () => {
    const generated = await service.generateN8nWorkflow({
      prompt: 'Crear flujo para facturar en Odoo',
      model_id: 'kimi-k2-6',
      context: 'produccion',
    });

    expect(generated.workflow_id).toBeTruthy();
    expect(generated.name).toContain('Crear flujo');
    expect(generated.workflow.nodes.length).toBeGreaterThan(1);
    expect(generated.workflow.nodes[0]).toHaveProperty('position');
  });
});
