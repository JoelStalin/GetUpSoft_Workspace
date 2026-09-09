import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  AutomationFlowRequestDto,
  BlueprintRunRequestDto,
  CredentialWriteRequestDto,
  HermesRunRequestDto,
  InteractionScriptRequestDto,
  PipelineRunRequestDto,
  RowboatChatRequestDto,
  TestFlowRequestDto,
  WorkflowBlueprintRequestDto,
} from './dto/orchestrator.dto';
import { OrchestratorService } from './orchestrator.service';

@ApiTags('orca-webapp')
@Controller('api')
export class OrchestratorController {
  constructor(private readonly orchestrator: OrchestratorService) {}

  @Get('rowboat/status')
  @ApiOperation({ summary: 'Rowboat integration status' })
  rowboatStatus() {
    return this.orchestrator.rowboatStatus();
  }

  @Get('models')
  @ApiOperation({ summary: 'List configured models' })
  models() {
    return this.orchestrator.listModels();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Workflow stats' })
  stats() {
    return this.orchestrator.stats();
  }

  @Get('workflows')
  @ApiOperation({ summary: 'List workflows' })
  workflows(@Query('limit') limit = '50') {
    return this.orchestrator.listWorkflows(Number(limit));
  }

  @Get('workflows/:jobId')
  @ApiOperation({ summary: 'Get workflow by id' })
  workflow(@Param('jobId') jobId: string) {
    return this.orchestrator.getWorkflow(jobId);
  }

  @Post('workflows/test-flow')
  @ApiOperation({ summary: 'Submit test-flow workflow' })
  testFlow(@Body() request: TestFlowRequestDto) {
    return this.orchestrator.submitTestFlow(request);
  }

  @Post('workflows/automation-flow')
  @ApiOperation({ summary: 'Submit automation-flow workflow' })
  automationFlow(@Body() request: AutomationFlowRequestDto) {
    return this.orchestrator.submitAutomationFlow(request);
  }

  @Post('workflows/interaction-script')
  @ApiOperation({ summary: 'Submit interaction-script workflow' })
  interactionScript(@Body() request: InteractionScriptRequestDto) {
    return this.orchestrator.submitInteractionScript(request);
  }

  @Post('hermes/run')
  @ApiOperation({ summary: 'Run Hermes workflow' })
  hermesRun(@Body() request: HermesRunRequestDto) {
    return this.orchestrator.runHermes(request.prompt);
  }

  @Post('rowboat/chat')
  @ApiOperation({ summary: 'Chat with Rowboat integration' })
  rowboatChat(@Body() request: RowboatChatRequestDto) {
    return this.orchestrator.rowboatChat(request.message, request.conversation_id);
  }

  @Get('credentials')
  @ApiOperation({ summary: 'Get credential status' })
  credentials(@Query('user_id') userId = 'default') {
    return this.orchestrator.credentialStatus(userId);
  }

  @Put('credentials/global')
  @ApiOperation({ summary: 'Update global credentials' })
  credentialsGlobal(@Body() request: CredentialWriteRequestDto) {
    return this.orchestrator.credentialsUpsertGlobal(request);
  }

  @Put('credentials/user')
  @ApiOperation({ summary: 'Update user credentials' })
  credentialsUser(@Body() request: CredentialWriteRequestDto) {
    return this.orchestrator.credentialsUpsertUser(request);
  }

  @Delete('credentials/global/:provider')
  @ApiOperation({ summary: 'Delete global provider credential' })
  deleteGlobalProvider(@Param('provider') provider: string) {
    return { deleted: this.orchestrator.credentialsDeleteGlobal(provider) };
  }

  @Delete('credentials/user/:provider')
  @ApiOperation({ summary: 'Delete user provider credential' })
  deleteUserProvider(@Param('provider') provider: string, @Query('user_id') userId = 'default') {
    return { deleted: this.orchestrator.credentialsDeleteUser(provider, userId) };
  }

  @Get('blueprints')
  @ApiOperation({ summary: 'List workflow blueprints' })
  blueprints(@Query('user_id') userId = 'default') {
    return this.orchestrator.listBlueprints(userId);
  }

  @Post('blueprints')
  @ApiOperation({ summary: 'Create/update workflow blueprint' })
  upsertBlueprint(@Body() request: WorkflowBlueprintRequestDto) {
    return this.orchestrator.upsertBlueprint(request);
  }

  @Delete('blueprints/:blueprintId')
  @ApiOperation({ summary: 'Delete workflow blueprint' })
  deleteBlueprint(@Param('blueprintId') blueprintId: string, @Query('user_id') userId = 'default') {
    return { deleted: this.orchestrator.deleteBlueprint(blueprintId, userId) };
  }

  @Post('blueprints/:blueprintId/run')
  @ApiOperation({ summary: 'Run workflow blueprint' })
  runBlueprint(@Param('blueprintId') blueprintId: string, @Body() request: BlueprintRunRequestDto) {
    return this.orchestrator.runBlueprint(blueprintId, request);
  }

  @Post('pipeline/run')
  @ApiOperation({ summary: 'Start pipeline run' })
  pipelineRun(@Body() request: PipelineRunRequestDto) {
    return this.orchestrator.pipelineRun(request);
  }

  @Get('pipeline/runs')
  @ApiOperation({ summary: 'List pipeline runs' })
  pipelineRuns(@Query('limit') limit = '50') {
    return this.orchestrator.pipelineList(Number(limit));
  }

  @Get('pipeline/runs/:runId')
  @ApiOperation({ summary: 'Get pipeline run details' })
  pipelineRunGet(@Param('runId') runId: string) {
    return this.orchestrator.pipelineGet(runId);
  }

  @Get('pipeline/stats')
  @ApiOperation({ summary: 'Get pipeline stats and model roles' })
  pipelineStats() {
    return this.orchestrator.pipelineStats();
  }
}
