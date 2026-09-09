import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('web ui migrated endpoints', () => {
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

  it('serves dashboard and plugin routes', async () => {
    await request(app.getHttpServer()).get('/').expect(200);
    await request(app.getHttpServer()).get('/plugin').expect(200);
    const zip = await request(app.getHttpServer()).get('/downloads/orca-clap-plugin.zip').expect(200);
    expect(zip.headers['content-type']).toContain('application/zip');
  });

  it('serves workflow editor fallback routes', async () => {
    await request(app.getHttpServer()).get('/workflow-editor').expect(200);
    await request(app.getHttpServer()).get('/workflow-editor/any-route').expect(200);
  });

  it('accepts notebooklm audio request for existing job', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/workflows/test-flow')
      .send({ project: 'ORCA', context: 'audio qa' })
      .expect(201);
    await request(app.getHttpServer()).post(`/api/workflows/${created.body.id}/notebooklm/audio`).expect(201);
  });
});

