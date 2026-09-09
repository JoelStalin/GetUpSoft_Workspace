import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrcaApiKeyGuard } from '../../common/guards/orca-api-key.guard';
import {
  CommandExecuteRequestDto,
  FileDeleteRequestDto,
  FileReadRequestDto,
  FileWriteRequestDto,
  GitCommitRequestDto,
  GitPullRequestDto,
  GitPushRequestDto,
} from './dto/workspace.dto';
import { WorkspaceService } from './workspace.service';

@ApiTags('workspace')
@ApiHeader({ name: 'api-key', required: true })
@UseGuards(OrcaApiKeyGuard)
@Controller('api/workspace')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get workspace and git status' })
  status() {
    return this.workspaceService.status();
  }

  @Get('files')
  @ApiOperation({ summary: 'List files in workspace directory' })
  listFiles(@Query('path') path = '.') {
    return this.workspaceService.listFiles(path);
  }

  @Post('files/read')
  @ApiOperation({ summary: 'Read a workspace file' })
  readFile(@Body() request: FileReadRequestDto) {
    return this.workspaceService.readFile(request);
  }

  @Post('files/write')
  @ApiOperation({ summary: 'Write a workspace file' })
  writeFile(@Body() request: FileWriteRequestDto) {
    return this.workspaceService.writeFile(request);
  }

  @Post('files/delete')
  @ApiOperation({ summary: 'Delete a workspace file' })
  deleteFile(@Body() request: FileDeleteRequestDto) {
    return this.workspaceService.deleteFile(request);
  }

  @Post('git/commit')
  @ApiOperation({ summary: 'Create a git commit' })
  gitCommit(@Body() request: GitCommitRequestDto) {
    return this.workspaceService.gitCommit(request);
  }

  @Post('git/push')
  @ApiOperation({ summary: 'Push git commits' })
  gitPush(@Body() request: GitPushRequestDto) {
    return this.workspaceService.gitPush(request);
  }

  @Post('git/pull')
  @ApiOperation({ summary: 'Pull git changes' })
  gitPull(@Body() request: GitPullRequestDto) {
    return this.workspaceService.gitPull(request);
  }

  @Post('execute')
  @ApiOperation({ summary: 'Execute an allow-listed command in the workspace' })
  execute(@Body() request: CommandExecuteRequestDto) {
    return this.workspaceService.execute(request);
  }

  @Get('logs')
  @ApiOperation({ summary: 'Get workspace operation log' })
  logs() {
    return { operations: this.workspaceService.getOperationsLog() };
  }
}
