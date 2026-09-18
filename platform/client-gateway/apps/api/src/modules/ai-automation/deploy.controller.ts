import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DeploymentHistoryQueryDto, DeployRequestDto, VersionBumpRequestDto } from './dto/deploy.dto';
import { DeployService } from './deploy.service';

@ApiTags('deploy')
@Controller('api/deploy')
export class DeployController {
  constructor(private readonly deployService: DeployService) {}

  @Get('projects')
  @ApiOperation({ summary: 'Get list of deployable projects' })
  projects() {
    return this.deployService.listProjects();
  }

  @Get(':projectId/status')
  @ApiOperation({ summary: 'Get project status' })
  projectStatus(@Param('projectId') projectId: string) {
    return this.deployService.projectStatus(projectId);
  }

  @Post(':projectId/deploy')
  @ApiOperation({ summary: 'Deploy project' })
  deploy(@Param('projectId') projectId: string, @Body() request: DeployRequestDto) {
    return this.deployService.deploy(projectId, request.target ?? 'dev');
  }

  @Post(':projectId/rollback')
  @ApiOperation({ summary: 'Rollback project' })
  rollback(@Param('projectId') projectId: string) {
    return this.deployService.rollback(projectId);
  }

  @Get(':projectId/health')
  @ApiOperation({ summary: 'Check project health endpoint' })
  health(@Param('projectId') projectId: string) {
    return this.deployService.health(projectId);
  }

  @Post(':projectId/bump-version')
  @ApiOperation({ summary: 'Bump project version' })
  bumpVersion(@Param('projectId') projectId: string, @Body() request: VersionBumpRequestDto) {
    return this.deployService.bumpVersion(projectId, request.bump_type ?? 'patch');
  }

  @Get('history')
  @ApiOperation({ summary: 'Get deployment history' })
  history(@Query() query: DeploymentHistoryQueryDto) {
    return this.deployService.history(query.project_id, query.limit ?? 50);
  }
}

