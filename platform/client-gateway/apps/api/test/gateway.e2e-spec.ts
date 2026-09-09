import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { PrismaClient } from "@prisma/client";
import { AppModule } from "../src/app.module";
const request = require("supertest");

describe("Gateway Vertical Slice (e2e)", () => {
  let app: INestApplication;
  const mode = process.env.GATEWAY_STORE_MODE ?? "memory";

  beforeAll(async () => {
    if (mode === "prisma") {
      const prisma = new PrismaClient();
      await prisma.$connect();
      await prisma.auditEvent.deleteMany();
      await prisma.agentCommand.deleteMany();
      await prisma.device.deleteMany();
      await prisma.pairingCode.deleteMany();
      await prisma.tenant.deleteMany();
      await prisma.$disconnect();
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("should execute tenant -> pairing -> enroll -> heartbeat -> command -> poll -> result -> revoke", async () => {
    const tenantRes = await request(app.getHttpServer())
      .post("/api/v1/tenants")
      .send({ name: "Demo", slug: "demo-e2e" })
      .expect(201);

    const tenantId = tenantRes.body.id;
    const pairingRes = await request(app.getHttpServer())
      .post(`/api/v1/tenants/${tenantId}/pairing-codes`)
      .expect(201);

    const enrollRes = await request(app.getHttpServer())
      .post("/api/v1/agent/devices/enroll")
      .send({
        pairingCode: pairingRes.body.pairingCode,
        deviceName: "QA Device",
        os: "windows",
        arch: "x64",
        agentVersion: "1.0.0",
        publicKey: "BASE64_PUBLIC_KEY"
      })
      .expect(201);

    const deviceId = enrollRes.body.deviceId;

    await request(app.getHttpServer())
      .post(`/api/v1/agent/devices/${deviceId}/heartbeat`)
      .send({ status: "connected", agentVersion: "1.0.0" })
      .expect(201);

    const cmdRes = await request(app.getHttpServer())
      .post(`/api/v1/devices/${deviceId}/commands`)
      .send({
        type: "RUN_FLOW",
        payload: { input: "hello" },
        ttlSeconds: 300,
        idempotencyKey: "idem-e2e"
      })
      .expect(201);

    await request(app.getHttpServer()).get(`/api/v1/agent/devices/${deviceId}/commands/poll`).expect(200);

    await request(app.getHttpServer())
      .post(`/api/v1/agent/devices/${deviceId}/commands/${cmdRes.body.id}/result`)
      .send({ status: "succeeded", exitCode: 0 })
      .expect(201);

    await request(app.getHttpServer()).post(`/api/v1/devices/${deviceId}/revoke`).expect(201);

    const revokedHeartbeat = await request(app.getHttpServer())
      .post(`/api/v1/agent/devices/${deviceId}/heartbeat`)
      .send({ status: "connected", agentVersion: "1.0.0" })
      .expect(201);

    expect(revokedHeartbeat.body.error).toBe("device_revoked_or_not_found");
  });

  it("should reject reused pairing code", async () => {
    const tenantRes = await request(app.getHttpServer())
      .post("/api/v1/tenants")
      .send({ name: "Demo Reuse", slug: "demo-reuse" })
      .expect(201);

    const pairingRes = await request(app.getHttpServer())
      .post(`/api/v1/tenants/${tenantRes.body.id}/pairing-codes`)
      .expect(201);

    const firstEnroll = await request(app.getHttpServer())
      .post("/api/v1/agent/devices/enroll")
      .send({
        pairingCode: pairingRes.body.pairingCode,
        deviceName: "Device A",
        os: "windows",
        arch: "x64",
        agentVersion: "1.0.0",
        publicKey: "KEY_A"
      })
      .expect(201);

    expect(firstEnroll.body.deviceId).toBeDefined();

    const secondEnroll = await request(app.getHttpServer())
      .post("/api/v1/agent/devices/enroll")
      .send({
        pairingCode: pairingRes.body.pairingCode,
        deviceName: "Device B",
        os: "windows",
        arch: "x64",
        agentVersion: "1.0.0",
        publicKey: "KEY_B"
      })
      .expect(201);

    expect(secondEnroll.body.error).toBe("invalid_pairing_code");
  });

  it("should reject duplicate idempotency key for same device", async () => {
    const tenantRes = await request(app.getHttpServer())
      .post("/api/v1/tenants")
      .send({ name: "Demo Idempotency", slug: "demo-idempotency" })
      .expect(201);

    const pairingRes = await request(app.getHttpServer())
      .post(`/api/v1/tenants/${tenantRes.body.id}/pairing-codes`)
      .expect(201);

    const enrollRes = await request(app.getHttpServer())
      .post("/api/v1/agent/devices/enroll")
      .send({
        pairingCode: pairingRes.body.pairingCode,
        deviceName: "Device Idem",
        os: "windows",
        arch: "x64",
        agentVersion: "1.0.0",
        publicKey: "KEY_IDEM"
      })
      .expect(201);

    const deviceId = enrollRes.body.deviceId;
    const payload = {
      type: "RUN_FLOW",
      payload: { input: "idem" },
      ttlSeconds: 300,
      idempotencyKey: "idem-fixed"
    };

    await request(app.getHttpServer()).post(`/api/v1/devices/${deviceId}/commands`).send(payload).expect(201);

    const second = await request(app.getHttpServer())
      .post(`/api/v1/devices/${deviceId}/commands`)
      .send(payload)
      .expect(201);

    expect(second.body.error).toBe("duplicate_idempotency_key");
  });

  it("should expire command when ttl is exceeded before poll", async () => {
    const tenantRes = await request(app.getHttpServer())
      .post("/api/v1/tenants")
      .send({ name: "Demo TTL", slug: "demo-ttl" })
      .expect(201);

    const pairingRes = await request(app.getHttpServer())
      .post(`/api/v1/tenants/${tenantRes.body.id}/pairing-codes`)
      .expect(201);

    const enrollRes = await request(app.getHttpServer())
      .post("/api/v1/agent/devices/enroll")
      .send({
        pairingCode: pairingRes.body.pairingCode,
        deviceName: "Device TTL",
        os: "windows",
        arch: "x64",
        agentVersion: "1.0.0",
        publicKey: "KEY_TTL"
      })
      .expect(201);

    const deviceId = enrollRes.body.deviceId;
    await request(app.getHttpServer())
      .post(`/api/v1/devices/${deviceId}/commands`)
      .send({
        type: "RUN_FLOW",
        payload: { input: "expire-me" },
        ttlSeconds: 1,
        idempotencyKey: "idem-ttl-1"
      })
      .expect(201);

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const pollRes = await request(app.getHttpServer())
      .get(`/api/v1/agent/devices/${deviceId}/commands/poll`)
      .expect(200);

    expect(Array.isArray(pollRes.body.commands)).toBe(true);
    expect(pollRes.body.commands).toHaveLength(0);
  });

  it("should block new commands after tenant disable", async () => {
    const tenantRes = await request(app.getHttpServer())
      .post("/api/v1/tenants")
      .send({ name: "Demo Disable", slug: "demo-disable" })
      .expect(201);

    const tenantId = tenantRes.body.id;
    const pairingRes = await request(app.getHttpServer())
      .post(`/api/v1/tenants/${tenantId}/pairing-codes`)
      .expect(201);

    const enrollRes = await request(app.getHttpServer())
      .post("/api/v1/agent/devices/enroll")
      .send({
        pairingCode: pairingRes.body.pairingCode,
        deviceName: "Device Disable",
        os: "windows",
        arch: "x64",
        agentVersion: "1.0.0",
        publicKey: "KEY_DISABLE"
      })
      .expect(201);

    const deviceId = enrollRes.body.deviceId;

    await request(app.getHttpServer()).patch(`/api/v1/tenants/${tenantId}/disable`).expect(200);

    const cmdRes = await request(app.getHttpServer())
      .post(`/api/v1/devices/${deviceId}/commands`)
      .send({
        type: "RUN_FLOW",
        payload: { input: "blocked" },
        ttlSeconds: 300,
        idempotencyKey: "idem-disabled-1"
      })
      .expect(201);

    expect(cmdRes.body.error).toBe("device_not_available");

    const hbRes = await request(app.getHttpServer())
      .post(`/api/v1/agent/devices/${deviceId}/heartbeat`)
      .send({ status: "connected", agentVersion: "1.0.0" })
      .expect(201);

    expect(hbRes.body.error).toBe("device_revoked_or_not_found");
  });
});
