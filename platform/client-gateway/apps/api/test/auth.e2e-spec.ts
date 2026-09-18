import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth migrated endpoints', () => {
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

  it('register/login returns session and sets cookie', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'qa-auth@getupsoft.com', name: 'QA Auth' })
      .expect(201);

    expect(response.body.user_id).toBeTruthy();
    expect(response.body.email).toBe('qa-auth@getupsoft.com');
    expect(response.body.session_id).toBeTruthy();
    expect(response.headers['set-cookie']).toBeDefined();
  });

  it('me and verify-session work with session cookie', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'qa-auth-me@getupsoft.com', name: 'QA Me' })
      .expect(201);
    const cookie = login.headers['set-cookie'][0];

    const me = await request(app.getHttpServer()).get('/api/auth/me').set('Cookie', cookie).expect(200);
    expect(me.body.email).toBe('qa-auth-me@getupsoft.com');

    const verified = await request(app.getHttpServer()).get('/api/auth/verify-session').set('Cookie', cookie).expect(200);
    expect(verified.body.valid).toBe(true);
    expect(verified.body.user_id).toBeTruthy();
  });

  it('logout invalidates session', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'qa-auth-logout@getupsoft.com', name: 'QA Logout' })
      .expect(201);
    const cookie = login.headers['set-cookie'][0];

    await request(app.getHttpServer()).post('/api/auth/logout').set('Cookie', cookie).expect(201);

    await request(app.getHttpServer()).get('/api/auth/me').set('Cookie', cookie).expect(401);
    const verified = await request(app.getHttpServer()).get('/api/auth/verify-session').set('Cookie', cookie).expect(200);
    expect(verified.body.valid).toBe(false);
  });

  it('login-password rejects unknown user', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login-password')
      .send({ email: 'does-not-exist@getupsoft.com', password: 'bad' })
      .expect(401);
  });
});
