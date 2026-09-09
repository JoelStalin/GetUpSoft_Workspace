import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Deploy migrated endpoints', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('lists deploy projects', async () => {
    const response = await request(app.getHttpServer()).get('/api/deploy/projects').expect(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty('id');
  });

  it('returns 404 for unknown project status', async () => {
    await request(app.getHttpServer()).get('/api/deploy/unknown/status').expect(404);
  });

  it('returns history list', async () => {
    const response = await request(app.getHttpServer()).get('/api/deploy/history').expect(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('returns 404 on rollback without successful history', async () => {
    await request(app.getHttpServer()).post('/api/deploy/miniverse/rollback').expect(404);
  });
});
