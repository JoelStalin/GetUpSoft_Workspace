import { Body, Controller, Get, Headers, HttpCode, Param, Post, Put, Query, Sse } from '@nestjs/common';
import { interval, map, Observable, take } from 'rxjs';
import {
  EasyCountOdooRncSearchQueryDto,
  EasyCountOdooTransmitDto,
  EasyCountPartnerEmitDto,
  EasyCountTenantApiCreateInvoiceDto,
  EasyCountUiTourUpdateDto,
} from './dto/easycount-extended.dto';
import { EasyCountExtendedService } from './easycount-extended.service';

@Controller('easycount')
export class EasyCountExtendedController {
  constructor(private readonly service: EasyCountExtendedService) {}

  @Get('ui-tours/me')
  uiToursMe(@Headers('authorization') authorization?: string) {
    const user = this.service.requireAnyBearer(authorization);
    return this.service.listMyTours(user ? 1 : 1);
  }

  @Put('ui-tours/:viewKey')
  uiToursUpsert(
    @Param('viewKey') viewKey: string,
    @Body() body: EasyCountUiTourUpdateDto,
    @Headers('authorization') authorization?: string,
  ) {
    this.service.requireAnyBearer(authorization);
    return this.service.upsertTour(1, viewKey, body.tourVersion, body.status, body.lastStep);
  }

  @Post('ui-tours/:viewKey/reset')
  uiToursReset(@Param('viewKey') viewKey: string, @Headers('authorization') authorization?: string) {
    this.service.requireAnyBearer(authorization);
    return this.service.resetTour(1, viewKey);
  }

  @Get('tenant-api/invoices')
  tenantApiInvoices(
    @Headers('authorization') authorization?: string,
    @Query('page') page = '1',
    @Query('size') size = '20',
  ) {
    const token = this.service.requireTenantApi(authorization, 'read');
    return this.service.listTenantApiInvoices(token.tenant_id, Number(page), Number(size));
  }

  @Get('tenant-api/invoices/:invoiceId')
  tenantApiInvoiceDetail(@Headers('authorization') authorization: string | undefined, @Param('invoiceId') invoiceId: string) {
    const token = this.service.requireTenantApi(authorization, 'read');
    return this.service.getTenantApiInvoice(token.tenant_id, Number(invoiceId));
  }

  @Post('tenant-api/invoices')
  tenantApiCreateInvoice(@Headers('authorization') authorization: string | undefined, @Body() body: EasyCountTenantApiCreateInvoiceDto) {
    const token = this.service.requireTenantApi(authorization, 'write');
    return this.service.createTenantApiInvoice(token.tenant_id, body.customer_name, body.amount_total);
  }

  @Get('partner/me')
  partnerMe(@Headers('authorization') authorization?: string) {
    const partner = this.service.requirePartner(authorization);
    return this.service.partnerProfile(partner.user_id);
  }

  @Get('partner/dashboard')
  partnerDashboard(@Headers('authorization') authorization?: string) {
    const partner = this.service.requirePartner(authorization);
    return this.service.partnerDashboard(partner.user_id);
  }

  @Get('partner/tenants')
  partnerTenants(@Headers('authorization') authorization?: string) {
    this.service.requirePartner(authorization);
    return this.service.partnerTenants();
  }

  @Get('partner/tenants/:tenantId/overview')
  partnerTenantOverview(@Param('tenantId') tenantId: string, @Headers('authorization') authorization?: string) {
    this.service.requirePartner(authorization);
    return this.service.partnerTenantOverview(Number(tenantId));
  }

  @Get('partner/invoices')
  partnerInvoices(@Headers('authorization') authorization?: string, @Query('page') page = '1', @Query('size') size = '20') {
    this.service.requirePartner(authorization);
    return this.service.partnerInvoices(Number(page), Number(size));
  }

  @Post('partner/emit')
  partnerEmit(@Headers('authorization') authorization: string | undefined, @Body() body: EasyCountPartnerEmitDto) {
    this.service.requirePartner(authorization);
    return this.service.partnerEmitInvoice(body.tenant_id, body.amount_total);
  }

  @Get('operations')
  operations(
    @Headers('authorization') authorization?: string,
    @Query('limit') limit = '50',
  ) {
    this.service.requirePlatform(authorization);
    return this.service.listOperations(Number(limit));
  }

  @Get('operations/:operationId')
  operationDetail(@Param('operationId') operationId: string, @Headers('authorization') authorization?: string) {
    this.service.requirePlatform(authorization);
    return this.service.getOperation(operationId);
  }

  @Get('operations/:operationId/events')
  operationEvents(@Param('operationId') operationId: string, @Headers('authorization') authorization?: string) {
    this.service.requirePlatform(authorization);
    return this.service.getOperationEvents(operationId);
  }

  @Sse('operations/:operationId/stream')
  operationStream(@Param('operationId') operationId: string, @Headers('authorization') authorization?: string): Observable<MessageEvent> {
    this.service.requirePlatform(authorization);
    return interval(200).pipe(
      take(3),
      map((i) => ({ data: { operation_id: operationId, event: i === 2 ? 'done' : 'tick', seq: i + 1 } }) as MessageEvent),
    );
  }

  @Post('operations/:operationId/retry')
  operationRetry(@Param('operationId') operationId: string, @Headers('authorization') authorization?: string) {
    this.service.requirePlatform(authorization);
    return this.service.retryOperation(operationId);
  }

  @Get('odoo/rnc/search')
  odooRncSearch(@Query() query: EasyCountOdooRncSearchQueryDto) {
    return this.service.odooSearchRnc(query.term, query.limit ?? 20);
  }

  @Get('odoo/rnc/:fiscalId')
  odooLookup(@Param('fiscalId') fiscalId: string) {
    return this.service.odooLookupRnc(fiscalId);
  }

  @Post('odoo/invoices/transmit')
  @HttpCode(202)
  odooTransmit(@Body() body: EasyCountOdooTransmitDto) {
    return this.service.odooTransmitInvoice(body);
  }
}
