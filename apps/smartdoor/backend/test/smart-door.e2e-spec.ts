import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Smart Door module', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns the Smart Door blueprint', async () => {
    const response = await request(app.getHttpServer()).get('/api/smartdoor/blueprint').expect(200);

    expect(response.body).toMatchObject({
      product: 'GetUpSoft Smart Door',
      recommendation: {
        mvp: expect.any(String),
      },
      orca: {
        prompt_id: 'getupsoft-smartdoor-orca-automation',
      },
    });
  });

  it('creates a QR grant and opens the lock through the QR flow', async () => {
    const grant = await request(app.getHttpServer())
      .post('/api/smartdoor/qr-grants')
      .send({
        tenant_id: 'tenant-getupsoft-demo',
        smart_lock_id: 'lock-tuya-frontdoor-01',
        issued_by_user_id: 'owner-demo-01',
        guest_label: 'Guest QR Demo',
        valid_from: new Date(Date.now() - 60_000).toISOString(),
        stay_duration_minutes: 30,
        max_uses: 2,
        allowed_hours: ['08:00-18:00'],
      })
      .expect(201);

    expect(grant.body).toMatchObject({
      tenant_id: 'tenant-getupsoft-demo',
      smart_lock_id: 'lock-tuya-frontdoor-01',
      stay_duration_minutes: 30,
      current_uses: 0,
    });

    const token = grant.body.token as string;

    const landing = await request(app.getHttpServer()).get(`/api/smartdoor/qr/${token}`).expect(200);
    expect(landing.body).toMatchObject({
      smart_lock_id: 'lock-tuya-frontdoor-01',
      remaining_uses: 2,
      guest_label: 'Guest QR Demo',
    });

    const opened = await request(app.getHttpServer())
      .post(`/api/smartdoor/qr/${token}/open`)
      .send({
        idempotency_key: 'idem-qr-demo-0001',
        correlation_id: 'corr-qr-demo-0001',
        biometric_assertion_id: 'bio-qr-demo-0001',
        reason: 'Guest check-in',
        client_timestamp: new Date().toISOString(),
      })
      .expect(201);

    expect(opened.body).toMatchObject({
      smart_lock_id: 'lock-tuya-frontdoor-01',
      command_status: 'accepted',
      remaining_uses: 1,
    });
  });

  it('exposes ORCA workflow guardrails', async () => {
    const response = await request(app.getHttpServer()).get('/api/smartdoor/orca/workflows').expect(200);
    expect(response.body).toMatchObject({
      prompt_id: 'getupsoft-smartdoor-orca-automation',
      allowed_intents: expect.any(Array),
      forbidden_behaviors: expect.any(Array),
    });
  });
});
