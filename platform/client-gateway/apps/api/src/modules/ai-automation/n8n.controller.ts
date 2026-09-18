import { Body, Controller, Delete, Get, Param, Post, Put, Req, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import { N8nGenerateWorkflowDto, N8nImportDirectoryDto, N8nWorkflowDto } from './dto/n8n.dto';
import { N8nService } from './n8n.service';

@ApiTags('n8n-workflows')
@Controller('api/n8n')
export class N8nController {
  constructor(private readonly n8nService: N8nService) {}

  @Get('node-types')
  @ApiOperation({ summary: 'Get available n8n node types' })
  nodeTypes(@Req() req: Request) {
    return this.n8nService.getNodeTypes(this.getSessionId(req));
  }

  @Get('workflows')
  @ApiOperation({ summary: 'List workflows' })
  listWorkflows(@Req() req: Request) {
    return this.n8nService.listWorkflows(this.getSessionId(req));
  }

  @Post('workflows')
  @ApiOperation({ summary: 'Create workflow' })
  createWorkflow(@Body() payload: N8nWorkflowDto, @Req() req: Request) {
    return this.n8nService.createWorkflow(payload, this.getSessionId(req));
  }

  @Get('workflows/:workflowId')
  @ApiOperation({ summary: 'Get workflow by id' })
  getWorkflow(@Param('workflowId') workflowId: string, @Req() req: Request) {
    return this.n8nService.getWorkflow(workflowId, this.getSessionId(req));
  }

  @Put('workflows/:workflowId')
  @ApiOperation({ summary: 'Update workflow' })
  updateWorkflow(@Param('workflowId') workflowId: string, @Body() payload: N8nWorkflowDto, @Req() req: Request) {
    return this.n8nService.updateWorkflow(workflowId, payload, this.getSessionId(req));
  }

  @Delete('workflows/:workflowId')
  @ApiOperation({ summary: 'Delete workflow' })
  deleteWorkflow(@Param('workflowId') workflowId: string, @Req() req: Request) {
    return this.n8nService.deleteWorkflow(workflowId, this.getSessionId(req));
  }

  @Post('workflows/:workflowId/run')
  @ApiOperation({ summary: 'Run workflow' })
  runWorkflow(@Param('workflowId') workflowId: string, @Req() req: Request) {
    return this.n8nService.runWorkflow(workflowId, this.getSessionId(req));
  }

  @Get('workflows/:workflowId/export')
  @ApiOperation({ summary: 'Export workflow JSON file' })
  exportWorkflow(@Param('workflowId') workflowId: string, @Req() req: Request, @Res() res: Response) {
    const { exportPath, fileName } = this.n8nService.exportWorkflow(workflowId, this.getSessionId(req));
    return res.download(exportPath, fileName);
  }

  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Import workflow from JSON file' })
  importWorkflow(@UploadedFile() file: { buffer: Buffer } | undefined, @Req() req: Request) {
    if (!file) return { message: 'No file uploaded' };
    return this.n8nService.importWorkflowFromJson(file.buffer.toString('utf8'), this.getSessionId(req));
  }

  @Post('import-directory')
  @ApiOperation({ summary: 'Import workflows from local directory' })
  importDirectory(@Body() request: N8nImportDirectoryDto, @Req() req: Request) {
    return this.n8nService.importWorkflowDirectory(request, this.getSessionId(req));
  }

  @Get('workflows/:workflowId/executions')
  @ApiOperation({ summary: 'List executions for workflow' })
  listExecutions(@Param('workflowId') workflowId: string, @Req() req: Request) {
    return this.n8nService.listWorkflowExecutions(workflowId, this.getSessionId(req));
  }

  @Get('executions/:executionId')
  @ApiOperation({ summary: 'Get execution status/logs' })
  executionStatus(@Param('executionId') executionId: string, @Req() req: Request) {
    return this.n8nService.getExecutionStatus(executionId, this.getSessionId(req));
  }

  @Get('executions/:executionId/stream')
  @ApiOperation({ summary: 'Stream execution logs via SSE' })
  async streamExecution(@Param('executionId') executionId: string, @Req() req: Request, @Res() res: Response) {
    const start = this.n8nService.getExecutionStatus(executionId, this.getSessionId(req));
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const initialLogs = start.logs ?? [];
    let sent = 0;
    const sendLog = (entry: unknown) => res.write(`data: ${JSON.stringify(entry)}\n\n`);
    for (const log of initialLogs) {
      sendLog(log);
      sent += 1;
    }

    const timer = setInterval(() => {
      const status = this.n8nService.getExecutionStatus(executionId, this.getSessionId(req));
      const logs = status.logs ?? [];
      while (sent < logs.length) {
        sendLog(logs[sent]);
        sent += 1;
      }
      const lastStatus = logs.length > 0 ? String((logs[logs.length - 1] as { status?: string }).status ?? '') : '';
      if (['completed', 'failed', 'error'].includes(lastStatus)) {
        res.write(`data: ${JSON.stringify({ status: 'done' })}\n\n`);
        clearInterval(timer);
        res.end();
      }
    }, 100);

    req.on('close', () => {
      clearInterval(timer);
      if (!res.writableEnded) res.end();
    });
  }

  @Post('generate')
  @ApiOperation({ summary: 'Generate workflow from prompt' })
  generateWorkflow(@Body() request: N8nGenerateWorkflowDto, @Req() req: Request) {
    return this.n8nService.generateWorkflow(request, this.getSessionId(req));
  }

  private getSessionId(req: Request) {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) return undefined;
    for (const part of cookieHeader.split(';')) {
      const [key, value] = part.trim().split('=');
      if (key === 'session_id') return value;
    }
    return undefined;
  }
}
