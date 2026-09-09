import { Body, Controller, Get, Headers, HttpCode, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import {
  EasyCountCertificateIntakeDto,
  EasyCountCertificateStatusDto,
  EasyCountDgiiLiveDto,
  EasyCountEcfGenerateDto,
  EasyCountInternalSignXmlDto,
  EasyCountReminderCreateDto,
  EasyCountWorkflowCheckpointDto,
} from './dto/easycount-internal.dto';
import { EasyCountInternalService } from './easycount-internal.service';

@Controller('easycount')
export class EasyCountInternalController {
  constructor(private readonly service: EasyCountInternalService) {}

  @Post('internal/certificates/sign-xml')
  signXml(@Body() body: EasyCountInternalSignXmlDto, @Headers('x-internal-secret') secret?: string) {
    this.service.requireInternalSecret(secret);
    return this.service.signXml(body.xml);
  }

  @Post('internal/certificates/register')
  registerCertificate(
    @Query('tenant_id') tenantId = '1',
    @Query('alias') alias = 'InternalCert',
    @Headers('x-internal-secret') secret?: string,
  ) {
    this.service.requireInternalSecret(secret);
    return this.service.registerCertificate(Number(tenantId), alias);
  }

  @Post('generate')
  ecfGenerate(@Body() body: EasyCountEcfGenerateDto) {
    return this.service.ecfGenerate(body.certia_tenant_id, body.l10n_latam_document_type ?? '31');
  }

  @Get('sync')
  ecfSync(@Query('tenant_id') tenantId: string) {
    return this.service.ecfSync(Number(tenantId));
  }

  @Post('certificate-workflow/intake')
  cwIntake(@Body() body: EasyCountCertificateIntakeDto, @Headers('x-internal-secret') secret?: string) {
    this.service.requireInternalSecret(secret);
    return this.service.intake(body as unknown as Record<string, unknown>);
  }

  @Get('certificate-workflow/:caseId')
  cwGetCase(@Param('caseId') caseId: string, @Headers('x-internal-secret') secret?: string) {
    this.service.requireInternalSecret(secret);
    return this.service.getCase(caseId);
  }

  @Post('certificate-workflow/:caseId/validate-certificate')
  cwValidateCert(@Param('caseId') caseId: string, @Headers('x-internal-secret') secret?: string) {
    this.service.requireInternalSecret(secret);
    return this.service.validateCertificate(caseId);
  }

  @Post('certificate-workflow/:caseId/status')
  cwStatus(
    @Param('caseId') caseId: string,
    @Body() body: EasyCountCertificateStatusDto,
    @Headers('x-internal-secret') secret?: string,
  ) {
    this.service.requireInternalSecret(secret);
    return this.service.transitionCase(caseId, body.status);
  }

  @Post('certificate-workflow/:caseId/reminders')
  cwReminder(
    @Param('caseId') caseId: string,
    @Body() body: EasyCountReminderCreateDto,
    @Headers('x-internal-secret') secret?: string,
  ) {
    this.service.requireInternalSecret(secret);
    return this.service.scheduleReminder(caseId, body.title, body.hours);
  }

  @Get('certificate-workflow/reminders/due')
  cwDueReminders(@Query('limit') limit = '50', @Headers('x-internal-secret') secret?: string) {
    this.service.requireInternalSecret(secret);
    return this.service.dueReminders(Number(limit));
  }

  @Post('certificate-workflow/reminders/:reminderId/resolve')
  cwResolveReminder(@Param('reminderId', ParseIntPipe) reminderId: number, @Headers('x-internal-secret') secret?: string) {
    this.service.requireInternalSecret(secret);
    return this.service.resolveReminder(reminderId);
  }

  @Post('certificate-workflow/:caseId/store-secret')
  cwStoreSecret(@Param('caseId') caseId: string, @Headers('x-internal-secret') secret?: string) {
    this.service.requireInternalSecret(secret);
    return { case_id: caseId, status: 'SECRET_STORED', secret_ref: `secret://${caseId}` };
  }

  @Post('certificate-workflow/:caseId/smoke-sign')
  cwSmokeSign(@Param('caseId') caseId: string, @Headers('x-internal-secret') secret?: string) {
    this.service.requireInternalSecret(secret);
    return { case_id: caseId, status: 'READY_FOR_DGII', signature_valid: true, sample_hash_sha256: 'mockhash' };
  }

  @Post('certificate-workflow/reminders/process-due')
  cwProcessDue(@Headers('x-internal-secret') secret?: string) {
    this.service.requireInternalSecret(secret);
    return { processed: 0 };
  }

  @Post('certificate-workflow/mail-intake/process')
  cwMailIntakeProcess(@Headers('x-internal-secret') secret?: string) {
    this.service.requireInternalSecret(secret);
    return { scanned: 0, skipped_sender: 0, skipped_case: 0, attachments_saved: 0, cases_updated: 0, validations_ok: 0, validations_failed: 0 };
  }

  @Get('certificate-workflow/mail-intake/health')
  cwMailIntakeHealth(@Headers('x-internal-secret') secret?: string) {
    this.service.requireInternalSecret(secret);
    return { enabled: true, imap_host: 'localhost', imap_port: 993, mailbox: 'INBOX', use_ssl: true, can_connect: true, error: null };
  }

  @Post('certificate-workflow/:caseId/dgii-certification-check')
  cwDgiiCheck(@Param('caseId') caseId: string, @Body() body: EasyCountDgiiLiveDto, @Headers('x-internal-secret') secret?: string) {
    this.service.requireInternalSecret(secret);
    return this.service.dgiiCheck(caseId, Boolean(body?.live));
  }

  @Post('certificate-workflow/:caseId/submit-test-ecf')
  cwSubmitTest(@Param('caseId') caseId: string, @Body() body: EasyCountDgiiLiveDto, @Headers('x-internal-secret') secret?: string) {
    this.service.requireInternalSecret(secret);
    return this.service.dgiiSubmit(caseId, Boolean(body?.live));
  }

  @Get('certificate-workflow/:caseId/track-status')
  cwTrackStatus(
    @Param('caseId') caseId: string,
    @Query('track_id') trackId?: string,
    @Query('live') live?: string,
    @Headers('x-internal-secret') secret?: string,
  ) {
    this.service.requireInternalSecret(secret);
    return this.service.dgiiTrackStatus(caseId, trackId, live === 'true');
  }

  @Get('certificate-workflow/:caseId/track-status/poll')
  cwTrackPoll(
    @Param('caseId') caseId: string,
    @Query('track_id') trackId?: string,
    @Query('live') live?: string,
    @Headers('x-internal-secret') secret?: string,
  ) {
    this.service.requireInternalSecret(secret);
    return this.service.dgiiTrackPoll(caseId, trackId, live === 'true');
  }

  @Post('certificate-workflow/track-status/process-ready')
  cwProcessReady(@Headers('x-internal-secret') secret?: string) {
    this.service.requireInternalSecret(secret);
    return { processed: 0, mode: 'simulated', limit: 10 };
  }

  @Post('certificate-workflow/:caseId/execution/start')
  cwExecutionStart(@Param('caseId') caseId: string, @Headers('x-internal-secret') secret?: string) {
    this.service.requireInternalSecret(secret);
    return this.service.startExecution(caseId);
  }

  @Post('certificate-workflow/:caseId/checkpoint')
  cwCheckpoint(
    @Param('caseId') caseId: string,
    @Body() body: EasyCountWorkflowCheckpointDto,
    @Headers('x-internal-secret') secret?: string,
  ) {
    this.service.requireInternalSecret(secret);
    return this.service.checkpoint(caseId, body.execution_id, body.step, body.result);
  }

  @Get('certificate-workflow/:caseId/progress')
  cwProgress(@Param('caseId') caseId: string, @Headers('x-internal-secret') secret?: string) {
    this.service.requireInternalSecret(secret);
    return this.service.progress(caseId);
  }

  @Post('certificate-workflow/:caseId/resume')
  @HttpCode(200)
  cwResume(@Param('caseId') caseId: string, @Headers('x-internal-secret') secret?: string) {
    this.service.requireInternalSecret(secret);
    return this.service.resume(caseId);
  }
}
