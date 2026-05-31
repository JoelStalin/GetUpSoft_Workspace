import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import { OrcaService } from './orca.service';

type UploadedWorkflowFile = {
  buffer: Buffer;
};

@ApiTags('orca-n8n')
@Controller('api/n8n')
export class OrcaN8nController {
  constructor(private readonly orcaService: OrcaService) {}

  @Get('node-types')
  @ApiOperation({ summary: 'List ORCA node types for the workflow editor' })
  nodeTypes() {
    return this.orcaService.getNodeTypes();
  }

  @Get('workflows')
  @ApiOperation({ summary: 'List persisted ORCA workflows' })
  async listWorkflows(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const parsedLimit = Number.parseInt(limit ?? '50', 10);
    const parsedOffset = Number.parseInt(offset ?? '0', 10);
    return this.orcaService.listN8nWorkflows({
      limit: Number.isFinite(parsedLimit) ? parsedLimit : 50,
      offset: Number.isFinite(parsedOffset) ? parsedOffset : 0,
    });
  }

  @Get('workflows/:id')
  @ApiOperation({ summary: 'Get a single ORCA workflow' })
  async getWorkflow(@Param('id') id: string) {
    return this.orcaService.getN8nWorkflow(id);
  }

  @Post('workflows')
  @ApiOperation({ summary: 'Create a workflow' })
  async createWorkflow(@Body() workflow: Record<string, unknown>) {
    return this.orcaService.createN8nWorkflow(workflow);
  }

  @Put('workflows/:id')
  @ApiOperation({ summary: 'Create or update a workflow' })
  async upsertWorkflow(@Param('id') id: string, @Body() workflow: Record<string, unknown>) {
    return this.orcaService.upsertN8nWorkflow(id, workflow);
  }

  @Delete('workflows/:id')
  @ApiOperation({ summary: 'Delete a workflow' })
  async deleteWorkflow(@Param('id') id: string) {
    return this.orcaService.deleteN8nWorkflow(id);
  }

  @Get('workflows/:id/export')
  @ApiOperation({ summary: 'Export a workflow as JSON' })
  async exportWorkflow(@Param('id') id: string, @Res() res: Response) {
    const workflow = await this.orcaService.getN8nWorkflow(id);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${workflow.name || id}.json"`);
    res.send(JSON.stringify(workflow, null, 2));
  }

  @Post('import')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Import a workflow JSON file' })
  async importWorkflow(@UploadedFile() file?: UploadedWorkflowFile) {
    return this.orcaService.importN8nWorkflow(file);
  }

  @Post('generate')
  @ApiOperation({ summary: 'Generate a starter workflow from a prompt' })
  async generateWorkflow(
    @Body()
    request: {
      prompt?: string;
      model_id?: string;
      context?: string;
    },
  ) {
    return this.orcaService.generateN8nWorkflow(request);
  }

  @Post('workflows/:id/run')
  @ApiOperation({ summary: 'Start a workflow execution' })
  async runWorkflow(
    @Param('id') id: string,
    @Body()
    request: {
      input_data?: Record<string, unknown>;
    },
  ) {
    return this.orcaService.startN8nExecution(id, request?.input_data ?? {});
  }

  @Get('executions/:id/stream')
  @ApiOperation({ summary: 'Stream workflow execution events via SSE' })
  async streamExecution(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    const cleanup = await this.orcaService.streamN8nExecution(id, res);
    req.on('close', cleanup);
  }
}
