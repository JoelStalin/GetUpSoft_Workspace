import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Workspace migrated endpoints', () => {
  let app: INestApplication;
  const apiKey = 'orca-secret-key-2026';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
    await app.init();
  }, 15000);

  afterAll(async () => {
    await app.close();
  });

  it('requires api-key for workspace status', async () => {
    await request(app.getHttpServer()).get('/api/workspace/status').expect(401);
  });

  it('returns workspace status and git shape', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/workspace/status')
      .set('api-key', apiKey)
      .expect(200);

    expect(response.body).toMatchObject({
      workspace_root: expect.any(String),
      initialized: true,
      git: expect.objectContaining({
        branch: expect.any(String),
        changes: expect.any(Array),
        has_changes: expect.any(Boolean),
      }),
    });
  }, 15000);

  it('lists workspace files', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/workspace/files')
      .query({ path: 'apps/backend-nest/src/modules/workspace' })
      .set('api-key', apiKey)
      .expect(200);

    expect(response.body.path).toBe('apps/backend-nest/src/modules/workspace');
    expect(response.body.files.some((file: { name: string }) => file.name === 'workspace.controller.ts')).toBe(true);
  });

  it('reads a workspace file', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/workspace/files/read')
      .set('api-key', apiKey)
      .send({ path: 'apps/backend-nest/README.md' })
      .expect(201);

    expect(response.body.path).toBe('apps/backend-nest/README.md');
    expect(response.body.content).toContain('GetUpSoft Backend Nest');
  });

  it('blocks path traversal', async () => {
    await request(app.getHttpServer())
      .post('/api/workspace/files/read')
      .set('api-key', apiKey)
      .send({ path: '../README.md' })
      .expect(403);
  });

  it('blocks mutations by default', async () => {
    await request(app.getHttpServer())
      .post('/api/workspace/files/write')
      .set('api-key', apiKey)
      .send({ path: 'tmp/workspace-test.txt', content: 'blocked' })
      .expect(403);
  });
});
