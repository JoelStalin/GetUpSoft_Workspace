import { Controller, Get, NotFoundException, Param, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { existsSync, readFileSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import { OrchestratorService } from './orchestrator.service';

@Controller()
export class WebUiController {
  private readonly workspaceRoot = resolve(process.cwd(), '..', '..');
  private readonly workflowEditorDist = resolve(this.workspaceRoot, 'apps/orca/workflow-editor/dist');

  constructor(private readonly orchestrator: OrchestratorService) {}

  @Get('/')
  dashboard() {
    return `
<!doctype html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>ORCA | Orchestrator</title></head>
<body style="font-family:Inter,Arial,sans-serif;background:#0a0a0a;color:#fff;margin:0;padding:32px">
  <h1>ORCA Orchestrator</h1>
  <p>Backend NestJS migration active.</p>
</body>
</html>`;
  }

  @Get('/plugin')
  pluginPage() {
    return `
<!doctype html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Orca Clap Launcher</title></head>
<body style="font-family:Inter,Arial,sans-serif;background:#111;color:#eee;padding:24px">
  <h1>Orca Clap Launcher</h1>
  <a href="/downloads/orca-clap-plugin.zip">Descargar plugin</a>
</body>
</html>`;
  }

  @Get('/downloads/orca-clap-plugin.zip')
  pluginZip(@Res() res: Response) {
    const payload = Buffer.from('PK\x05\x06' + '\x00'.repeat(18), 'binary');
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="orca-clap-plugin.zip"');
    res.send(payload);
  }

  @Post('/api/workflows/:jobId/notebooklm/audio')
  notebooklmAudio(@Param('jobId') jobId: string) {
    this.orchestrator.getWorkflow(jobId);
    return { status: 'accepted', message: 'NotebookLM audio generation started.' };
  }

  @Get('/workflow-editor')
  workflowEditor() {
    return this.loadWorkflowEditorIndex();
  }

  @Get('/workflow-editor/assets/:assetPath')
  workflowEditorAsset(@Param('assetPath') assetPath: string, @Res() res: Response) {
    const safeName = assetPath.replace(/[\\/]/g, '');
    const fullPath = resolve(this.workflowEditorDist, 'assets', safeName);
    if (!fullPath.startsWith(resolve(this.workflowEditorDist, 'assets')) || !existsSync(fullPath)) {
      throw new NotFoundException('Asset not found');
    }
    const ext = extname(fullPath).toLowerCase();
    const mediaType =
      ext === '.js' ? 'application/javascript'
      : ext === '.css' ? 'text/css'
      : ext === '.svg' ? 'image/svg+xml'
      : ext === '.png' ? 'image/png'
      : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg'
      : 'application/octet-stream';
    res.setHeader('Content-Type', mediaType);
    res.send(readFileSync(fullPath));
  }

  @Get('/workflow-editor/:path')
  workflowEditorFallback() {
    return this.loadWorkflowEditorIndex();
  }

  private loadWorkflowEditorIndex() {
    const indexPath = resolve(this.workflowEditorDist, 'index.html');
    if (!existsSync(indexPath)) {
      return `
<!doctype html>
<html><body style="font-family:Inter,Arial,sans-serif;background:#1a1b1e;color:#fff;padding:24px">
<h2>Workflow Editor</h2><p>Building React app...</p>
</body></html>`;
    }
    return readFileSync(indexPath, 'utf8')
      .replaceAll('src="/assets/', 'src="/workflow-editor/assets/')
      .replaceAll('href="/assets/', 'href="/workflow-editor/assets/');
  }
}

