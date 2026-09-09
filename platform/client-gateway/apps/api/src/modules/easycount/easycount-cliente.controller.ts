import { Body, Controller, Delete, Get, Headers, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  EasyCountApiTokenCreateDto,
  EasyCountChatAskDto,
  EasyCountChatMemoryCreateDto,
  EasyCountInvoiceEmitRequestDto,
  EasyCountInvoiceListQueryDto,
  EasyCountInvoiceSendEmailDto,
  EasyCountOdooSyncDto,
  EasyCountOnboardingUpdateDto,
  EasyCountPlanChangeRequestDto,
  EasyCountRecurringCreateDto,
} from './dto/easycount-cliente.dto';
import { EasyCountClienteService } from './easycount-cliente.service';

@ApiTags('easycount-cliente')
@Controller('easycount/cliente')
export class EasyCountClienteController {
  constructor(private readonly service: EasyCountClienteService) {}

  @Get('health')
  @ApiOperation({ summary: 'Cliente health endpoint' })
  health() {
    return { status: 'ok', scope: 'cliente' };
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current tenant user' })
  me(@Headers('authorization') authorization?: string) {
    const ctx = this.service.requireTenant(authorization);
    return this.service.me(ctx);
  }

  @Get('plans')
  @ApiOperation({ summary: 'List available plans' })
  plans(@Headers('authorization') authorization?: string) {
    this.service.requireTenant(authorization);
    return this.service.listPlans();
  }

  @Get('plan')
  @ApiOperation({ summary: 'Get current tenant plan' })
  plan(@Headers('authorization') authorization?: string) {
    const ctx = this.service.requireTenant(authorization);
    return this.service.getPlan(ctx.tenant_id);
  }

  @Put('plan')
  @ApiOperation({ summary: 'Request plan change' })
  requestPlan(@Body() body: EasyCountPlanChangeRequestDto, @Headers('authorization') authorization?: string) {
    const ctx = this.service.requireTenant(authorization);
    return this.service.requestPlanChange(ctx.tenant_id, body.plan_id);
  }

  @Get('usage')
  @ApiOperation({ summary: 'Usage summary' })
  usage(
    @Headers('authorization') authorization?: string,
    @Query('month') month?: string,
    @Query() query?: EasyCountInvoiceListQueryDto,
  ) {
    const ctx = this.service.requireTenant(authorization);
    return this.service.usageSummary(ctx.tenant_id, month, query?.page ?? 1, query?.size ?? 20);
  }

  @Get('invoices')
  @ApiOperation({ summary: 'List tenant invoices' })
  invoices(@Headers('authorization') authorization?: string, @Query() query?: EasyCountInvoiceListQueryDto) {
    const ctx = this.service.requireTenant(authorization);
    return this.service.listInvoices(ctx.tenant_id, query?.page ?? 1, query?.size ?? 20);
  }

  @Get('invoices/:invoiceId')
  @ApiOperation({ summary: 'Get invoice detail' })
  invoiceDetail(@Param('invoiceId') invoiceId: string, @Headers('authorization') authorization?: string) {
    const ctx = this.service.requireTenant(authorization);
    return this.service.getInvoiceDetail(ctx.tenant_id, Number(invoiceId));
  }

  @Post('invoices/emit')
  @ApiOperation({ summary: 'Emit tenant invoice' })
  emitInvoice(@Body() body: EasyCountInvoiceEmitRequestDto, @Headers('authorization') authorization?: string) {
    const ctx = this.service.requireTenant(authorization);
    return this.service.emitInvoice(ctx.tenant_id, body);
  }

  @Get('invoices/:invoiceId/pdf')
  invoicePdf(@Param('invoiceId') invoiceId: string, @Headers('authorization') authorization?: string) {
    const ctx = this.service.requireTenant(authorization);
    const pdf = this.service.invoicePdf(ctx.tenant_id, Number(invoiceId));
    return { filename: `invoice-${invoiceId}.pdf`, content_base64: pdf.toString('base64') };
  }

  @Get('invoices/:invoiceId/xml')
  invoiceXml(@Param('invoiceId') invoiceId: string, @Headers('authorization') authorization?: string) {
    const ctx = this.service.requireTenant(authorization);
    const xml = this.service.invoiceXml(ctx.tenant_id, Number(invoiceId));
    return { filename: `invoice-${invoiceId}.json`, content_base64: xml.toString('base64') };
  }

  @Post('invoices/:invoiceId/send-email')
  sendInvoiceEmail(
    @Param('invoiceId') invoiceId: string,
    @Body() body: EasyCountInvoiceSendEmailDto,
    @Headers('authorization') authorization?: string,
  ) {
    const ctx = this.service.requireTenant(authorization);
    return this.service.sendInvoiceEmail(ctx.tenant_id, Number(invoiceId), body.recipient);
  }

  @Get('certificates')
  certificates(@Headers('authorization') authorization?: string) {
    const ctx = this.service.requireTenant(authorization);
    return this.service.listCertificates(ctx.tenant_id);
  }

  @Post('certificates')
  uploadCertificate(
    @Headers('authorization') authorization?: string,
    @Query('alias') alias = 'Certificado',
    @Query('filename') filename = 'certificado.p12',
    @Query('activate') activate = 'true',
  ) {
    const ctx = this.service.requireTenant(authorization);
    return this.service.uploadCertificate(ctx.tenant_id, alias, filename, activate !== 'false');
  }

  @Post('certificates/sign-xml')
  signXml(@Headers('authorization') authorization?: string, @Body() body?: { xml?: string }) {
    const ctx = this.service.requireTenant(authorization);
    return this.service.signXml(ctx.tenant_id, body?.xml ?? '');
  }

  @Get('onboarding')
  onboarding(@Headers('authorization') authorization?: string) {
    const ctx = this.service.requireTenant(authorization);
    return this.service.getOnboarding(ctx.tenant_id);
  }

  @Put('onboarding')
  onboardingComplete(@Headers('authorization') authorization?: string, @Body() body?: EasyCountOnboardingUpdateDto) {
    const ctx = this.service.requireTenant(authorization);
    return this.service.completeOnboarding(ctx.tenant_id, body?.company_name ?? 'Tenant');
  }

  @Get('api-tokens')
  apiTokens(@Headers('authorization') authorization?: string) {
    const ctx = this.service.requireTenant(authorization);
    return this.service.listApiTokens(ctx.tenant_id);
  }

  @Post('api-tokens')
  createApiToken(@Headers('authorization') authorization?: string, @Body() body?: EasyCountApiTokenCreateDto) {
    const ctx = this.service.requireTenant(authorization);
    return this.service.createApiToken(ctx.tenant_id, body?.label ?? 'Token');
  }

  @Delete('api-tokens/:tokenId')
  revokeApiToken(@Param('tokenId') tokenId: string, @Headers('authorization') authorization?: string) {
    const ctx = this.service.requireTenant(authorization);
    return this.service.revokeApiToken(ctx.tenant_id, Number(tokenId));
  }

  @Get('recurring-invoices')
  recurring(@Headers('authorization') authorization?: string) {
    const ctx = this.service.requireTenant(authorization);
    return this.service.listRecurring(ctx.tenant_id);
  }

  @Post('recurring-invoices')
  createRecurring(@Headers('authorization') authorization?: string, @Body() body?: EasyCountRecurringCreateDto) {
    const ctx = this.service.requireTenant(authorization);
    return this.service.createRecurring(ctx.tenant_id, body?.name ?? 'Recurring');
  }

  @Put('recurring-invoices/:scheduleId')
  updateRecurring(
    @Param('scheduleId') scheduleId: string,
    @Headers('authorization') authorization?: string,
    @Body() body?: EasyCountRecurringCreateDto,
  ) {
    const ctx = this.service.requireTenant(authorization);
    return this.service.updateRecurring(ctx.tenant_id, Number(scheduleId), body?.name ?? 'Recurring');
  }

  @Post('recurring-invoices/:scheduleId/pause')
  pauseRecurring(@Param('scheduleId') scheduleId: string, @Headers('authorization') authorization?: string) {
    const ctx = this.service.requireTenant(authorization);
    return this.service.markRecurring(ctx.tenant_id, Number(scheduleId), 'paused');
  }

  @Post('recurring-invoices/:scheduleId/resume')
  resumeRecurring(@Param('scheduleId') scheduleId: string, @Headers('authorization') authorization?: string) {
    const ctx = this.service.requireTenant(authorization);
    return this.service.markRecurring(ctx.tenant_id, Number(scheduleId), 'active');
  }

  @Post('recurring-invoices/run-due')
  runDue(@Headers('authorization') authorization?: string) {
    const ctx = this.service.requireTenant(authorization);
    return this.service.runDueRecurring(ctx.tenant_id);
  }

  @Post('chat/ask')
  chatAsk(@Headers('authorization') authorization?: string, @Body() body?: EasyCountChatAskDto) {
    const ctx = this.service.requireTenant(authorization);
    return this.service.askChat(ctx.tenant_id, body?.question ?? '');
  }

  @Get('chat/sessions')
  chatSessions(@Headers('authorization') authorization?: string) {
    const ctx = this.service.requireTenant(authorization);
    return this.service.listChatSessions(ctx.tenant_id);
  }

  @Get('chat/sessions/:sessionId/messages')
  chatMessages(@Param('sessionId') sessionId: string, @Headers('authorization') authorization?: string) {
    const ctx = this.service.requireTenant(authorization);
    return this.service.getChatMessages(ctx.tenant_id, Number(sessionId));
  }

  @Delete('chat/sessions/:sessionId')
  chatSessionDelete(@Param('sessionId') sessionId: string, @Headers('authorization') authorization?: string) {
    const ctx = this.service.requireTenant(authorization);
    this.service.deleteChatSession(ctx.tenant_id, Number(sessionId));
    return { deleted: true };
  }

  @Get('chat/memory')
  chatMemory(@Headers('authorization') authorization?: string) {
    const ctx = this.service.requireTenant(authorization);
    return this.service.listMemory(ctx.tenant_id);
  }

  @Get('chat/memory/search')
  chatMemorySearch(@Query('q') q: string, @Headers('authorization') authorization?: string) {
    const ctx = this.service.requireTenant(authorization);
    return this.service.searchMemory(ctx.tenant_id, q ?? '');
  }

  @Post('chat/memory')
  chatMemoryCreate(@Headers('authorization') authorization?: string, @Body() body?: EasyCountChatMemoryCreateDto) {
    const ctx = this.service.requireTenant(authorization);
    return this.service.createMemory(ctx.tenant_id, body?.content ?? '');
  }

  @Put('chat/memory/:memoryId')
  chatMemoryUpdate(
    @Param('memoryId') memoryId: string,
    @Headers('authorization') authorization?: string,
    @Body() body?: EasyCountChatMemoryCreateDto,
  ) {
    const ctx = this.service.requireTenant(authorization);
    return this.service.updateMemory(ctx.tenant_id, Number(memoryId), body?.content ?? '');
  }

  @Delete('chat/memory/:memoryId')
  chatMemoryDelete(@Param('memoryId') memoryId: string, @Headers('authorization') authorization?: string) {
    const ctx = this.service.requireTenant(authorization);
    this.service.deleteMemory(ctx.tenant_id, Number(memoryId));
    return { deleted: true };
  }

  @Post('integrations/odoo/sync')
  odooSync(@Headers('authorization') authorization?: string, @Body() body?: EasyCountOdooSyncDto) {
    const ctx = this.service.requireTenant(authorization);
    return this.service.syncOdoo(
      ctx.tenant_id,
      Boolean(body?.include_customers),
      Boolean(body?.include_vendors),
      Boolean(body?.include_products),
      Boolean(body?.include_invoices),
      body?.limit ?? 100,
    );
  }

  @Get('integrations/odoo/customers')
  odooCustomers(@Headers('authorization') authorization?: string, @Query('limit') limit = '100') {
    this.service.requireTenant(authorization);
    return this.service.listOdooPartners('customer', Number(limit));
  }

  @Get('integrations/odoo/vendors')
  odooVendors(@Headers('authorization') authorization?: string, @Query('limit') limit = '100') {
    this.service.requireTenant(authorization);
    return this.service.listOdooPartners('vendor', Number(limit));
  }

  @Get('integrations/odoo/products')
  odooProducts(@Headers('authorization') authorization?: string, @Query('limit') limit = '100') {
    this.service.requireTenant(authorization);
    return this.service.listOdooProducts(Number(limit));
  }

  @Get('integrations/odoo/invoices')
  odooInvoices(@Headers('authorization') authorization?: string, @Query('limit') limit = '100') {
    this.service.requireTenant(authorization);
    return this.service.listOdooInvoices(Number(limit));
  }
}
