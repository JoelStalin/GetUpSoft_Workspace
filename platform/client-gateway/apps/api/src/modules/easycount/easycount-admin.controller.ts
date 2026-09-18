import { Body, Controller, Delete, Get, Headers, HttpCode, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  AdminLedgerEntryCreateDto,
  AdminListInvoicesQueryDto,
  AdminPlanPayloadDto,
  AdminPlatformAIProviderPayloadDto,
  AdminTenantAIProviderPayloadDto,
  AdminTenantPayloadDto,
  AdminTenantPlanAssignmentDto,
  AdminTenantSettingsPayloadDto,
  AdminUserAIProviderPayloadDto,
} from './dto/easycount-admin.dto';
import { EasyCountAdminService } from './easycount-admin.service';

@ApiTags('easycount-admin')
@Controller('easycount/admin')
export class EasyCountAdminController {
  constructor(private readonly service: EasyCountAdminService) {}

  private assertAuth(authorization?: string) {
    return this.service.requirePlatformUser(authorization);
  }

  @Get('tenants')
  listTenants(@Headers('authorization') authorization?: string) {
    this.assertAuth(authorization);
    return this.service.listTenants();
  }

  @Post('tenants')
  @ApiOperation({ summary: 'Create tenant' })
  createTenant(@Headers('authorization') authorization: string | undefined, @Body() body: AdminTenantPayloadDto) {
    this.assertAuth(authorization);
    return this.service.createTenant(body);
  }

  @Get('dashboard/kpis')
  dashboardKpis(@Headers('authorization') authorization: string | undefined, @Query('month') month?: string) {
    this.assertAuth(authorization);
    return this.service.dashboardKpis(month);
  }

  @Get('invoices')
  listInvoices(@Headers('authorization') authorization: string | undefined, @Query() query: AdminListInvoicesQueryDto) {
    this.assertAuth(authorization);
    return this.service.listInvoices(query.page ?? 1, query.size ?? 20);
  }

  @Get('invoices/:invoiceId')
  getInvoice(@Headers('authorization') authorization: string | undefined, @Param('invoiceId') invoiceId: string) {
    this.assertAuth(authorization);
    return this.service.getInvoice(Number(invoiceId));
  }

  @Get('tenants/:tenantId')
  getTenant(@Headers('authorization') authorization: string | undefined, @Param('tenantId') tenantId: string) {
    this.assertAuth(authorization);
    return this.service.getTenant(Number(tenantId));
  }

  @Put('tenants/:tenantId')
  updateTenant(
    @Headers('authorization') authorization: string | undefined,
    @Param('tenantId') tenantId: string,
    @Body() body: AdminTenantPayloadDto,
  ) {
    this.assertAuth(authorization);
    return this.service.updateTenant(Number(tenantId), body);
  }

  @Get('plans')
  listPlans(@Headers('authorization') authorization?: string) {
    this.assertAuth(authorization);
    return this.service.listPlans();
  }

  @Post('plans')
  createPlan(@Headers('authorization') authorization: string | undefined, @Body() body: AdminPlanPayloadDto) {
    this.assertAuth(authorization);
    return this.service.createPlan(body);
  }

  @Put('plans/:planId')
  updatePlan(@Headers('authorization') authorization: string | undefined, @Param('planId') planId: string, @Body() body: AdminPlanPayloadDto) {
    this.assertAuth(authorization);
    return this.service.updatePlan(Number(planId), body);
  }

  @Delete('plans/:planId')
  @HttpCode(204)
  deletePlan(@Headers('authorization') authorization: string | undefined, @Param('planId') planId: string) {
    this.assertAuth(authorization);
    this.service.deletePlan(Number(planId));
  }

  @Get('tenants/:tenantId/accounting/summary')
  accountingSummary(@Headers('authorization') authorization: string | undefined, @Param('tenantId') tenantId: string) {
    this.assertAuth(authorization);
    return this.service.getAccountingSummary(Number(tenantId));
  }

  @Get('tenants/:tenantId/accounting/ledger')
  listLedger(
    @Headers('authorization') authorization: string | undefined,
    @Param('tenantId') tenantId: string,
    @Query('page') page = '1',
    @Query('size') size = '20',
  ) {
    this.assertAuth(authorization);
    return this.service.listLedgerEntries(Number(tenantId), Number(page), Number(size));
  }

  @Post('tenants/:tenantId/accounting/ledger')
  createLedger(
    @Headers('authorization') authorization: string | undefined,
    @Param('tenantId') tenantId: string,
    @Body() body: AdminLedgerEntryCreateDto,
  ) {
    this.assertAuth(authorization);
    return this.service.createLedgerEntry(Number(tenantId), body);
  }

  @Get('tenants/:tenantId/settings')
  getTenantSettings(@Headers('authorization') authorization: string | undefined, @Param('tenantId') tenantId: string) {
    this.assertAuth(authorization);
    return this.service.getTenantSettings(Number(tenantId));
  }

  @Put('tenants/:tenantId/settings')
  putTenantSettings(
    @Headers('authorization') authorization: string | undefined,
    @Param('tenantId') tenantId: string,
    @Body() body: AdminTenantSettingsPayloadDto,
  ) {
    this.assertAuth(authorization);
    return this.service.updateTenantSettings(Number(tenantId), body);
  }

  @Put('tenants/:tenantId/plan')
  putTenantPlan(
    @Headers('authorization') authorization: string | undefined,
    @Param('tenantId') tenantId: string,
    @Body() body: AdminTenantPlanAssignmentDto,
  ) {
    this.assertAuth(authorization);
    return this.service.assignTenantPlan(Number(tenantId), body);
  }

  @Get('tenants/:tenantId/plan')
  getTenantPlan(@Headers('authorization') authorization: string | undefined, @Param('tenantId') tenantId: string) {
    this.assertAuth(authorization);
    return this.service.getTenantPlan(Number(tenantId));
  }

  @Get('billing/summary')
  billingSummary(@Headers('authorization') authorization: string | undefined, @Query('month') month?: string) {
    this.assertAuth(authorization);
    return this.service.billingSummary(month);
  }

  @Get('audit-logs')
  auditLogs(@Headers('authorization') authorization: string | undefined, @Query('limit') limit = '50') {
    this.assertAuth(authorization);
    return this.service.auditLogs(Number(limit));
  }

  @Get('users')
  users(@Headers('authorization') authorization?: string) {
    this.assertAuth(authorization);
    return this.service.listUsers();
  }

  @Get('ai-providers')
  platformProviders(@Headers('authorization') authorization?: string) {
    this.assertAuth(authorization);
    return this.service.listPlatformAiProviders();
  }

  @Post('ai-providers')
  createPlatformProvider(@Headers('authorization') authorization: string | undefined, @Body() body: AdminPlatformAIProviderPayloadDto) {
    this.assertAuth(authorization);
    return this.service.createPlatformAiProvider(body);
  }

  @Put('ai-providers/:providerId')
  updatePlatformProvider(
    @Headers('authorization') authorization: string | undefined,
    @Param('providerId') providerId: string,
    @Body() body: AdminPlatformAIProviderPayloadDto,
  ) {
    this.assertAuth(authorization);
    return this.service.updatePlatformAiProvider(Number(providerId), body);
  }

  @Delete('ai-providers/:providerId')
  @HttpCode(204)
  deletePlatformProvider(@Headers('authorization') authorization: string | undefined, @Param('providerId') providerId: string) {
    this.assertAuth(authorization);
    this.service.deletePlatformAiProvider(Number(providerId));
  }

  @Get('tenants/:tenantId/ai-providers')
  tenantProviders(@Headers('authorization') authorization: string | undefined, @Param('tenantId') tenantId: string) {
    this.assertAuth(authorization);
    return this.service.listTenantAiProviders(Number(tenantId));
  }

  @Post('tenants/:tenantId/ai-providers')
  createTenantProvider(
    @Headers('authorization') authorization: string | undefined,
    @Param('tenantId') tenantId: string,
    @Body() body: AdminTenantAIProviderPayloadDto,
  ) {
    this.assertAuth(authorization);
    return this.service.createTenantAiProvider(Number(tenantId), body);
  }

  @Put('tenants/:tenantId/ai-providers/:providerId')
  updateTenantProvider(
    @Headers('authorization') authorization: string | undefined,
    @Param('tenantId') tenantId: string,
    @Param('providerId') providerId: string,
    @Body() body: AdminTenantAIProviderPayloadDto,
  ) {
    this.assertAuth(authorization);
    return this.service.updateTenantAiProvider(Number(tenantId), Number(providerId), body);
  }

  @Delete('tenants/:tenantId/ai-providers/:providerId')
  @HttpCode(204)
  deleteTenantProvider(
    @Headers('authorization') authorization: string | undefined,
    @Param('tenantId') tenantId: string,
    @Param('providerId') providerId: string,
  ) {
    this.assertAuth(authorization);
    this.service.deleteTenantAiProvider(Number(tenantId), Number(providerId));
  }

  @Get('users/:userId/ai-providers')
  userProviders(@Headers('authorization') authorization: string | undefined, @Param('userId') userId: string) {
    this.assertAuth(authorization);
    return this.service.listUserAiProviders(Number(userId));
  }

  @Post('users/:userId/ai-providers')
  createUserProvider(@Headers('authorization') authorization: string | undefined, @Param('userId') userId: string, @Body() body: AdminUserAIProviderPayloadDto) {
    this.assertAuth(authorization);
    return this.service.createUserAiProvider(Number(userId), body);
  }

  @Put('users/:userId/ai-providers/:providerId')
  updateUserProvider(
    @Headers('authorization') authorization: string | undefined,
    @Param('userId') userId: string,
    @Param('providerId') providerId: string,
    @Body() body: AdminUserAIProviderPayloadDto,
  ) {
    this.assertAuth(authorization);
    return this.service.updateUserAiProvider(Number(userId), Number(providerId), body);
  }

  @Delete('users/:userId/ai-providers/:providerId')
  @HttpCode(204)
  deleteUserProvider(
    @Headers('authorization') authorization: string | undefined,
    @Param('userId') userId: string,
    @Param('providerId') providerId: string,
  ) {
    this.assertAuth(authorization);
    this.service.deleteUserAiProvider(Number(userId), Number(providerId));
  }
}
