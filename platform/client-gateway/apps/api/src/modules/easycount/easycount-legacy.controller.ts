import { BadRequestException, Body, Controller, Param, Post, Query } from '@nestjs/common';

@Controller('easycount')
export class EasyCountLegacyController {
  @Post(':tenant/sign/xml')
  signXmlTenant(@Param('tenant') _tenant: string, @Body() payload: { xml?: string }) {
    return {
      xml_signed: payload?.xml ?? '',
      signature_valid: true,
      provider: 'tenant-certificate',
    };
  }

  @Post('sign/xml')
  signXmlDefault(@Body() payload: { xml?: string }) {
    return {
      xml_signed: payload?.xml ?? '',
      signature_valid: true,
      provider: 'default-certificate',
    };
  }

  @Post(':tenant/recv/ecf')
  recvEcf(@Param('tenant') _tenant: string, @Body() payload: { xml?: string; encf?: string }) {
    if (payload?.xml && !payload.xml.includes('<')) {
      throw new BadRequestException('XML invalido');
    }
    return { encf: payload?.encf ?? 'E310000000001', status: 'recibido' };
  }

  @Post(':tenant/recv/ack')
  recvAck(@Param('tenant') _tenant: string, @Body() payload: { encf?: string; estado?: number; codigoMotivo?: string }) {
    if (payload?.estado === 1 && !payload.codigoMotivo) {
      throw new BadRequestException('Debe indicar código de motivo cuando el estado es No Recibido');
    }
    return { encf: payload?.encf ?? 'E310000000001', estado: payload?.estado ?? 0 };
  }

  @Post(':tenant/recv/approval')
  recvApproval(@Param('tenant') _tenant: string, @Body() payload: { encf?: string; estado?: number; detalleMotivo?: string }) {
    if (payload?.estado === 2 && !payload.detalleMotivo) {
      throw new BadRequestException('Debe indicar detalle de motivo cuando se rechaza');
    }
    return { encf: payload?.encf ?? 'E310000000001', estado: payload?.estado ?? 0 };
  }

  @Post('render')
  renderRi(@Body() payload: Record<string, unknown>, @Query('formato') formato = 'both') {
    const html = `<html><body><h1>RI</h1><pre>${JSON.stringify(payload)}</pre></body></html>`;
    const response: Record<string, string> = {
      qr_base64: 'cXItbW9jaw==',
      qr_url: 'https://dgii.gov.do/verify/mock',
    };
    if (formato === 'html' || formato === 'both') response.html = html;
    if (formato === 'pdf' || formato === 'both') response.pdf_base64 = Buffer.from('%PDF-1.4 mock').toString('base64');
    return response;
  }

  @Post(':tenant/billing/ecf')
  billingEcf(@Param('tenant') tenant: string, @Body() payload: Record<string, unknown>) {
    return { xml: `<ECF tenant="${tenant}" encf="${String(payload.encf ?? '')}" />` };
  }

  @Post(':tenant/billing/rfce')
  billingRfce(@Param('tenant') tenant: string, @Body() payload: Record<string, unknown>) {
    return { xml: `<RFCE tenant="${tenant}" encf="${String(payload.encf ?? '')}" />` };
  }

  @Post(':tenant/billing/arecf')
  billingArecf(@Param('tenant') tenant: string, @Body() payload: Record<string, unknown>) {
    return { xml: `<ARECF tenant="${tenant}" encf="${String(payload.encf ?? '')}" estado="${String(payload.estado ?? 0)}" />` };
  }

  @Post(':tenant/billing/acecf')
  billingAcecf(@Param('tenant') tenant: string, @Body() payload: Record<string, unknown>) {
    return { xml: `<ACECF tenant="${tenant}" encf="${String(payload.encf ?? '')}" estado="${String(payload.estado ?? 0)}" />` };
  }

  @Post(':tenant/billing/anecf')
  billingAnecf(@Param('tenant') tenant: string, @Body() payload: Record<string, unknown>) {
    return {
      xml: `<ANECF tenant="${tenant}" tipo_ecf="${String(payload.tipo_ecf ?? '')}" desde="${String(payload.desde ?? '')}" hasta="${String(payload.hasta ?? '')}" />`,
    };
  }
}
