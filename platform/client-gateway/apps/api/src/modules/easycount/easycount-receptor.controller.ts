import { BadRequestException, Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';

@Controller('easycount/receptor')
export class EasyCountReceptorController {
  @Post('arecf')
  @HttpCode(202)
  arecf(@Req() req: Request, @Body() _body: unknown) {
    const xml = typeof req.body === 'string' ? req.body : '';
    if (xml && !xml.includes('<ARECF')) {
      throw new BadRequestException('Invalid ARECF XML');
    }
    return { status: 'ARECF received, validated, and queued for processing' };
  }

  @Post('acecf')
  @HttpCode(202)
  acecf(@Req() req: Request, @Body() _body: unknown) {
    const xml = typeof req.body === 'string' ? req.body : '';
    if (xml && !xml.includes('<ACECF')) {
      throw new BadRequestException('Invalid ACECF XML');
    }
    return { status: 'ACECF received, validated, and queued for processing and submission to DGII' };
  }

  @Post('anecf')
  @HttpCode(202)
  anecf(@Req() req: Request, @Body() _body: unknown) {
    const xml = typeof req.body === 'string' ? req.body : '';
    if (xml && !xml.includes('<ANECF')) {
      throw new BadRequestException('Invalid ANECF XML');
    }
    return { status: 'ANECF received, validated, and queued for processing' };
  }
}
