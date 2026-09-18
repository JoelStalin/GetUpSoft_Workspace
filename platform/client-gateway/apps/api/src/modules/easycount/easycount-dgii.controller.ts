import { BadRequestException, Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

@Controller('easycount/dgii')
export class EasyCountDgiiController {
  @Post('auth/token')
  @HttpCode(201)
  authToken() {
    return { access_token: `local-${randomUUID().replace(/-/g, '')}` };
  }

  @Post('recepcion/ecf')
  @HttpCode(202)
  recepcionEcf() {
    return { trackId: `LOCAL-${randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`, estado: 'EN_PROCESO' };
  }

  @Get('recepcion/status/:trackId')
  recepcionStatus(@Param('trackId') trackId: string) {
    return { trackId, estado: 'ACEPTADO', descripcion: 'Procesado' };
  }

  @Post('ecf/send')
  sendEcf(@Body() _payload: unknown) {
    return { trackId: `LOCAL-${randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`, estado: 'EN_PROCESO' };
  }

  @Post('rfce/send')
  sendRfce(@Body() _payload: unknown) {
    return { trackId: `LOCAL-${randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`, estado: 'EN_PROCESO' };
  }

  @Post('acecf/send')
  sendAcecf(@Body() _payload: unknown) {
    return { trackId: `LOCAL-${randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`, estado: 'EN_PROCESO' };
  }

  @Post('arecf/send')
  sendArecf(@Body() _payload: unknown) {
    return { trackId: `LOCAL-${randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`, estado: 'EN_PROCESO' };
  }

  @Get('status/:trackId')
  getStatus(@Param('trackId') trackId: string) {
    return { trackId, estado: 'ACEPTADO', descripcion: 'Procesado' };
  }

  // Legacy-compatible DGII router aliases
  @Post('rfce/resumen')
  @HttpCode(202)
  rfceResumen(@Body() _payload: unknown) {
    return { codigo: '200', estado: 'EN_PROCESO', mensajes: ['RFCE recibido'], encf: null };
  }

  @Post('acuse/arecef')
  @HttpCode(202)
  acuseArecef(@Body() _payload: unknown) {
    return { trackId: `LOCAL-${randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`, estado: 'EN_PROCESO' };
  }

  @Post('aprobacion/acecf')
  @HttpCode(202)
  aprobacionAcecf(@Body() _payload: unknown) {
    return { trackId: `LOCAL-${randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`, estado: 'EN_PROCESO' };
  }

  @Post('anulacion/anecf')
  @HttpCode(202)
  anulacionAnecf(@Body() _payload: unknown) {
    return { trackId: `LOCAL-${randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`, estado: 'EN_PROCESO' };
  }

  @Post('certification/status')
  certificationStatus(@Body() body: { rnc?: string; password?: string }) {
    if (!body?.rnc || !body?.password) {
      throw new BadRequestException('RNC and password are required for OFV access.');
    }
    return { rnc: body.rnc, status: 'CERTIFICATION_IN_PROGRESS', source: 'mock-bot' };
  }
}
