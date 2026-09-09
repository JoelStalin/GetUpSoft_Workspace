import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { AppModule } from '../src/app.module';

describe('n8n migrated endpoints', () => {
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

  it('requires auth on n8n endpoints', async () => {
    await request(app.getHttpServer()).get('/api/n8n/workflows').expect(401);
  });

  it('supports node types + workflow CRUD + run', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'qa-n8n@getupsoft.com', name: 'QA N8N' })
      .expect(201);
    const cookie = login.headers['set-cookie'][0];

    const nodeTypes = await request(app.getHttpServer()).get('/api/n8n/node-types').set('Cookie', cookie).expect(200);
    expect(nodeTypes.body.count).toBeGreaterThan(0);

    const created = await request(app.getHttpServer())
      .post('/api/n8n/workflows')
      .set('Cookie', cookie)
      .send({
        name: 'QA Workflow',
        nodes: [
          {
            id: 'node-1',
            name: 'Trigger',
            type: 'orca-nodes-base.trigger',
            position: [100, 200],
          },
        ],
      })
      .expect(201);

    const workflowId = created.body.workflow.id;
    expect(workflowId).toBeTruthy();

    await request(app.getHttpServer()).get(`/api/n8n/workflows/${workflowId}`).set('Cookie', cookie).expect(200);

    await request(app.getHttpServer())
      .put(`/api/n8n/workflows/${workflowId}`)
      .set('Cookie', cookie)
      .send({
        id: workflowId,
        name: 'QA Workflow Updated',
        nodes: [
          {
            id: 'node-1',
            name: 'Trigger',
            type: 'orca-nodes-base.trigger',
            position: [110, 220],
          },
        ],
      })
      .expect(200);

    const run = await request(app.getHttpServer()).post(`/api/n8n/workflows/${workflowId}/run`).set('Cookie', cookie).expect(201);
    expect(run.body.status).toBe('pending');
    expect(run.body.execution_id).toBeTruthy();

    await request(app.getHttpServer()).get(`/api/n8n/executions/${run.body.execution_id}`).set('Cookie', cookie).expect(200);
    await request(app.getHttpServer()).get(`/api/n8n/workflows/${workflowId}/executions`).set('Cookie', cookie).expect(200);
    const stream = await request(app.getHttpServer())
      .get(`/api/n8n/executions/${run.body.execution_id}/stream`)
      .set('Cookie', cookie)
      .expect(200);
    expect(stream.text).toContain('data:');

    await request(app.getHttpServer()).get(`/api/n8n/workflows/${workflowId}/export`).set('Cookie', cookie).expect(200);

    await request(app.getHttpServer()).delete(`/api/n8n/workflows/${workflowId}`).set('Cookie', cookie).expect(200);
  });

  it('supports import file and import-directory dry-run', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'qa-n8n-import@getupsoft.com', name: 'QA N8N Import' })
      .expect(201);
    const cookie = login.headers['set-cookie'][0];

    const payload = {
      name: 'Imported Workflow',
      nodes: [{ id: 'n1', name: 'Trigger', type: 'orca-nodes-base.trigger', position: [0, 0] }],
      connections: {},
    };
    await request(app.getHttpServer())
      .post('/api/n8n/import')
      .set('Cookie', cookie)
      .attach('file', Buffer.from(JSON.stringify(payload), 'utf8'), 'workflow.json')
      .expect(201);

    const dir = mkdtempSync(join(tmpdir(), 'n8n-import-'));
    try {
      writeFileSync(join(dir, 'sample.json'), JSON.stringify(payload), 'utf8');
      const result = await request(app.getHttpServer())
        .post('/api/n8n/import-directory')
        .set('Cookie', cookie)
        .send({ source_path: dir, dry_run: true })
        .expect(201);
      expect(result.body.discovered).toBeGreaterThan(0);
      expect(result.body.dry_run).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('supports workflow generation from prompt', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'qa-n8n-generate@getupsoft.com', name: 'QA N8N Generate' })
      .expect(201);
    const cookie = login.headers['set-cookie'][0];

    const generated = await request(app.getHttpServer())
      .post('/api/n8n/generate')
      .set('Cookie', cookie)
      .send({ prompt: 'llama una api y valida la respuesta y termina' })
      .expect(201);

    expect(generated.body.workflow_id).toBeTruthy();
    expect(generated.body.node_count).toBeGreaterThan(2);
  });
});
