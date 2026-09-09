import { Body, Controller, Get, Headers, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { createHash, randomUUID } from 'node:crypto';

@Controller('easycount/fe')
export class EasyCountEnfcController {
  private readonly idempotency = new Map<string, { hash: string; body: Record<string, unknown>; statusCode: number }>();

  @Post('recepcion/api/ecf')
  async recepcionEcf(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    const { contentType, rawBody, wantsJson } = this.readRequest(req);
    const hash = this.payloadHash(contentType, rawBody);
    const key = idempotencyKey ?? this.fallbackKey(req.path, hash);

    const cached = this.idempotency.get(key);
    if (cached) {
      if (cached.hash !== hash) return res.status(409).json({ detail: 'Idempotency key payload mismatch' });
      res.setHeader('Idempotent-Replay', 'true');
      return wantsJson ? res.status(cached.statusCode).json(cached.body) : this.xmlResponse(res, 'AcuseRecepcion', cached.body);
    }

    const body = { trackId: `LOCAL-${randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`, estado: 'EN_PROCESO' };
    this.idempotency.set(key, { hash, body, statusCode: 200 });
    res.setHeader('Idempotent-Replay', 'false');
    return wantsJson ? res.status(200).json(body) : this.xmlResponse(res, 'AcuseRecepcion', body);
  }

  @Post('aprobacioncomercial/api/ecf')
  async aprobacionEcf(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    const { contentType, rawBody, wantsJson } = this.readRequest(req);
    const hash = this.payloadHash(contentType, rawBody);
    const key = idempotencyKey ?? this.fallbackKey(req.path, hash);

    const cached = this.idempotency.get(key);
    if (cached) {
      if (cached.hash !== hash) return res.status(409).json({ detail: 'Idempotency key payload mismatch' });
      res.setHeader('Idempotent-Replay', 'true');
      return wantsJson ? res.status(cached.statusCode).json(cached.body) : this.xmlResponse(res, 'AcuseAprobacion', cached.body);
    }

    const body = { trackId: `LOCAL-${randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`, estado: 'APROBADO' };
    this.idempotency.set(key, { hash, body, statusCode: 200 });
    res.setHeader('Idempotent-Replay', 'false');
    return wantsJson ? res.status(200).json(body) : this.xmlResponse(res, 'AcuseAprobacion', body);
  }

  @Get('autenticacion/api/semilla')
  semilla(@Req() req: Request, @Res() res: Response) {
    const body = { valor: randomUUID().replace(/-/g, ''), fecha: new Date().toISOString() };
    const wantsJson = (req.headers.accept ?? '').toLowerCase().includes('application/json');
    if (wantsJson) return res.status(200).json(body);
    return this.xmlResponse(res, 'SemillaModel', body, {
      'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      'xmlns:xsd': 'http://www.w3.org/2001/XMLSchema',
    });
  }

  @Post('autenticacion/api/validacioncertificado')
  validacionCertificado(@Req() req: Request, @Res() res: Response, @Body() payload: Record<string, unknown>) {
    const tokenPayload = {
      token: `tok_${randomUUID().replace(/-/g, '')}`,
      expira: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      expedido: new Date().toISOString(),
    };
    const contentType = (req.headers['content-type'] ?? '').toLowerCase();
    const wantsJson = (req.headers.accept ?? '').toLowerCase().includes('application/json') || contentType.includes('application/json');
    if (wantsJson || Object.keys(payload ?? {}).length > 0) return res.status(200).json(tokenPayload);
    return this.xmlResponse(res, 'RespuestaAutenticacion', tokenPayload);
  }

  private readRequest(req: Request) {
    const contentTypeRaw = (req.headers['content-type'] ?? '').toString().toLowerCase();
    const contentType = contentTypeRaw.split(';', 1)[0].trim();
    const wantsJson = ((req.headers.accept ?? '').toString().toLowerCase().includes('application/json'));
    const rawBody =
      typeof req.body === 'string'
        ? req.body
        : Buffer.isBuffer(req.body)
          ? req.body.toString('utf8')
          : JSON.stringify(req.body ?? {});
    return { contentType: contentType || 'application/json', rawBody, wantsJson };
  }

  private payloadHash(contentType: string, body: string) {
    if (contentType === 'application/json') {
      try {
        const parsed = body ? JSON.parse(body) : {};
        const canonical = JSON.stringify(parsed, Object.keys(parsed).sort());
        return createHash('sha256').update(canonical).digest('hex');
      } catch {
        return createHash('sha256').update(body).digest('hex');
      }
    }
    return createHash('sha256').update(body).digest('hex');
  }

  private fallbackKey(path: string, hash: string) {
    return createHash('sha256').update(`${path}:${hash}`).digest('hex');
  }

  private xmlResponse(res: Response, rootTag: string, body: Record<string, unknown>, attrs?: Record<string, string>) {
    const attributes = attrs ? ` ${Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ')}` : '';
    const fields = Object.entries(body)
      .map(([k, v]) => `<${k}>${String(v ?? '')}</${k}>`)
      .join('');
    const xml = `<?xml version="1.0" encoding="utf-8"?><${rootTag}${attributes}>${fields}</${rootTag}>`;
    res.setHeader('Content-Type', 'application/xml');
    return res.status(200).send(xml);
  }
}

