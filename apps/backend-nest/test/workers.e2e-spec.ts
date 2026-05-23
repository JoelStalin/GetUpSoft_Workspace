import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Workers migrated task server endpoints', () => {
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

  it('rejects requests without api-key like the FastAPI task server', async () => {
    await request(app.getHttpServer()).get('/tasks').expect(401);
  });

  it('submits and reads a queued task', async () => {
    const created = await request(app.getHttpServer())
      .post('/tasks')
      .set('api-key', apiKey)
      .send({ goal: 'run migration QA', project_id: 'orca', priority: 'HIGH' })
      .expect(201);

    expect(created.body).toMatchObject({
      task_id: expect.any(String),
      status: 'queued',
      project_id: 'orca',
    });

    const status = await request(app.getHttpServer())
      .get(`/tasks/${created.body.task_id}`)
      .set('api-key', apiKey)
      .expect(200);

    expect(status.body).toMatchObject({
      task_id: created.body.task_id,
      project_id: 'orca',
      goal: 'run migration QA',
      status: 'queued',
      priority: 'HIGH',
      error: '',
    });
  });

  it('returns 404 for missing tasks', async () => {
    await request(app.getHttpServer()).get('/tasks/missing').set('api-key', apiKey).expect(404);
  });
});
