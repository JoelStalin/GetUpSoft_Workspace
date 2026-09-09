import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('ORCA migrated compatibility endpoints', () => {
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

  it('serves FastAPI-compatible /health response shape', async () => {
    const response = await request(app.getHttpServer()).get('/health').expect(200);

    expect(response.body).toMatchObject({
      status: 'ok',
      canonical_language: 'es',
      completion_policy: expect.any(String),
    });
    expect(typeof response.body.low_confidence_threshold).toBe('number');
  });

  it('validates /interpret body like the FastAPI min_length contract', async () => {
    await request(app.getHttpServer()).post('/interpret').send({ source_type: 'text', content: '' }).expect(400);
  });

  it('interprets text through the ORCA core bridge', async () => {
    const response = await request(app.getHttpServer())
      .post('/interpret')
      .send({ source_type: 'text', content: 'arregla el bug del login y crea pruebas' })
      .expect(201);

    expect(response.body.source_type).toBe('text');
    expect(response.body.normalized_prompt).toContain('bug');
    expect(response.body.scrum.tasks.length).toBeGreaterThan(0);
  }, 60000);

  it('builds the n8n payload shape', async () => {
    const response = await request(app.getHttpServer())
      .post('/n8n-payload')
      .send({ source_type: 'text', content: 'crea una historia scrum para ORCA' })
      .expect(201);

    expect(response.body).toMatchObject({
      source: 'text',
      detected_intent: expect.any(String),
      selected_skill: expect.any(String),
      normalized_prompt: expect.any(String),
      tasks: expect.any(Array),
    });
  }, 60000);
});
