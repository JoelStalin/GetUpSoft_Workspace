import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('google-drive-product-publication workflow', () => {
  it('includes the required orchestration nodes', async () => {
    const workflowPath = path.resolve(
      process.cwd(),
      'Galantesjewelry/automation/n8n/google-drive-product-publication-workflow.json',
    );
    const raw = readFileSync(workflowPath, 'utf-8');
    expect(raw).toContain('Galantes Jewelry Google Drive Product Publication');
    const workflow = JSON.parse(raw);
    const nodeNames = new Set((workflow.nodes || []).map((node: { name?: string }) => node.name));

    expect(workflow.name).toBe('Galantes Jewelry Google Drive Product Publication');
    expect(nodeNames.has('Manual Trigger')).toBe(true);
    expect(nodeNames.has('Every 6 Hours')).toBe(true);
    expect(nodeNames.has('Scan Drive Folder')).toBe(true);
    expect(nodeNames.has('Build Manifest')).toBe(true);
    expect(nodeNames.has('Publish via Nano Banana')).toBe(true);
    expect(nodeNames.has('Final Evidence')).toBe(true);
  });

  it('routes publication through the Nano Banana enhancer command', async () => {
    const workflowPath = path.resolve(
      process.cwd(),
      'Galantesjewelry/automation/n8n/google-drive-product-publication-workflow.json',
    );
    const raw = readFileSync(workflowPath, 'utf-8');
    const workflow = JSON.parse(raw);
    const publishNode = (workflow.nodes || []).find((node: { name?: string }) => node.name === 'Publish via Nano Banana');

    expect(publishNode?.parameters?.command).toContain('--mode publish');
    expect(publishNode?.parameters?.command).toContain('{{$json.sourcePath}}');
    expect(publishNode?.parameters?.command).toContain('{{$json.enhancerCommand}}');
    expect(publishNode?.parameters?.command).toContain('{{$json.publishArgs}}');
    const finalNode = (workflow.nodes || []).find((node: { name?: string }) => node.name === 'Final Evidence');
    expect(finalNode?.parameters?.command).toContain('generatedAt');
  });
});
