import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrcaApiKeyGuard } from '../../common/guards/orca-api-key.guard';
import { TaskSubmissionDto } from './dto/task-submission.dto';
import { WorkersService } from './workers.service';

@ApiTags('workers')
@ApiHeader({ name: 'api-key', required: true })
@UseGuards(OrcaApiKeyGuard)
@Controller('tasks')
export class WorkersController {
  constructor(private readonly workersService: WorkersService) {}

  @Post()
  @ApiOperation({ summary: 'Submit task migrated from ai_automation_orchestrator/task_server.py' })
  submitTask(@Body() task: TaskSubmissionDto) {
    return this.workersService.submitTask(task);
  }

  @Get(':taskId')
  @ApiOperation({ summary: 'Get task status by id' })
  getTaskStatus(@Param('taskId') taskId: string) {
    return this.workersService.getTaskStatus(taskId);
  }

  @Get()
  @ApiOperation({ summary: 'List all task statuses' })
  listTasks() {
    return this.workersService.listTasks();
  }
}
