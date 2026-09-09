import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('webapp migrated endpoints', () => {
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

  it('serves models, rowboat status, and stats', async () => {
    await request(app.getHttpServer()).get('/api/models').expect(200);
    await request(app.getHttpServer()).get('/api/rowboat/status').expect(200);
    await request(app.getHttpServer()).get('/api/stats').expect(200);
  });

  it('creates and retrieves workflow jobs', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/workflows/test-flow')
      .send({ project: 'ORCA', context: 'crear suite QA' })
      .expect(201);
    const jobId = created.body.id;
    expect(jobId).toBeTruthy();

    await request(app.getHttpServer()).get('/api/workflows').expect(200);
    await request(app.getHttpServer()).get(`/api/workflows/${jobId}`).expect(200);
  });

  it('supports rowboat chat and hermes run', async () => {
    const rowboat = await request(app.getHttpServer())
      .post('/api/rowboat/chat')
      .send({ message: 'hola orca' })
      .expect(201);
    expect(rowboat.body.output_text).toContain('Mock Rowboat response');

    const hermes = await request(app.getHttpServer()).post('/api/hermes/run').send({ prompt: 'analiza este flujo' }).expect(201);
    expect(hermes.body.response).toBeDefined();
  });

  it('supports credentials CRUD', async () => {
    await request(app.getHttpServer())
      .put('/api/credentials/global')
      .send({ values: { openai: 'sk-test-1234567890' } })
      .expect(200);
    await request(app.getHttpServer())
      .put('/api/credentials/user')
      .send({ user_id: 'qa-user', values: { gemini: 'gm-test-123456' } })
      .expect(200);
    const status = await request(app.getHttpServer()).get('/api/credentials?user_id=qa-user').expect(200);
    expect(status.body.providers.length).toBeGreaterThan(0);
    await request(app.getHttpServer()).delete('/api/credentials/global/openai').expect(200);
    await request(app.getHttpServer()).delete('/api/credentials/user/gemini?user_id=qa-user').expect(200);
  });

  it('supports blueprints CRUD and run', async () => {
    const create = await request(app.getHttpServer())
      .post('/api/blueprints')
      .send({ user_id: 'qa', name: 'Blueprint QA', objective: 'Automatizar pruebas', nodes: [], edges: [], settings: {} })
      .expect(201);
    const blueprintId = create.body.id;
    expect(blueprintId).toBeTruthy();
    await request(app.getHttpServer()).get('/api/blueprints?user_id=qa').expect(200);
    await request(app.getHttpServer()).post(`/api/blueprints/${blueprintId}/run`).send({ user_id: 'qa' }).expect(201);
    await request(app.getHttpServer()).delete(`/api/blueprints/${blueprintId}?user_id=qa`).expect(200);
  });

  it('supports pipeline run/list/get/stats', async () => {
    const run = await request(app.getHttpServer())
      .post('/api/pipeline/run')
      .send({ task_type: 'automation', title: 'QA Pipeline', objective: 'Validar migracion' })
      .expect(201);
    expect(run.body.run_id).toBeTruthy();
    await request(app.getHttpServer()).get('/api/pipeline/runs').expect(200);
    await request(app.getHttpServer()).get(`/api/pipeline/runs/${run.body.run_id}`).expect(200);
    await request(app.getHttpServer()).get('/api/pipeline/stats').expect(200);
  });
});
