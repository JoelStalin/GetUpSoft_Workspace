import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AI Automation provider endpoints', () => {
  let app: INestApplication;
  const apiKey = 'orca-secret-key-2026';

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

  it('requires api-key', async () => {
    await request(app.getHttpServer()).get('/api/providers').expect(401);
  });

  it('lists provider catalog', async () => {
    const response = await request(app.getHttpServer()).get('/api/providers').set('api-key', apiKey).expect(200);

    expect(response.body.total).toBeGreaterThanOrEqual(4);
    expect(response.body.providers.openai.name).toBe('OpenAI');
  });

  it('connects, reports status, and disconnects provider credentials without exposing secrets', async () => {
    await request(app.getHttpServer())
      .post('/api/providers/openai/connect')
      .set('api-key', apiKey)
      .send({ api_key: 'sk-test-1234567890' })
      .expect(201);

    const status = await request(app.getHttpServer()).get('/api/providers/status').set('api-key', apiKey).expect(200);
    const openai = status.body.providers.find((provider: { provider: string }) => provider.provider === 'openai');
    expect(openai.configured).toBe(true);
    expect(openai.masked_value).toBe('sk-t...7890');
    expect(JSON.stringify(status.body)).not.toContain('sk-test-1234567890');

    await request(app.getHttpServer()).delete('/api/providers/openai/disconnect').set('api-key', apiKey).expect(200);
  });

  it('validates provider credential presence', async () => {
    await request(app.getHttpServer())
      .post('/api/providers/openai/validate')
      .set('api-key', apiKey)
      .send({ api_key: 'sk-test-abcdef' })
      .expect(201);

    await request(app.getHttpServer()).post('/api/providers/openai/validate').set('api-key', apiKey).send({}).expect(400);
  });

  it('saves and tests provider config without returning raw key', async () => {
    await request(app.getHttpServer())
      .post('/api/providers/config')
      .set('api-key', apiKey)
      .send({ user_id: 'default', provider_id: 'gemini', config: { key: 'gm-secret-123456', endpoint: 'local' } })
      .expect(201);

    const config = await request(app.getHttpServer())
      .get('/api/providers/config/gemini')
      .set('api-key', apiKey)
      .expect(200);

    expect(config.body.configured).toBe(true);
    expect(config.body).not.toHaveProperty('config');

    const tested = await request(app.getHttpServer())
      .post('/api/providers/test')
      .set('api-key', apiKey)
      .send({ provider_id: 'gemini' })
      .expect(201);

    expect(tested.body.success).toBe(true);
    expect(JSON.stringify(tested.body)).not.toContain('gm-secret-123456');
  });
});
