import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { GatewayStore } from "./gateway.store";

@Controller("api/v1")
export class GatewayController {
  constructor(private readonly store: GatewayStore) {}

  @Post("tenants")
  async createTenant(@Body() body: { name: string; slug: string }) {
    const now = this.store.nowIso();
    const tenant = {
      id: this.store.id("ten"),
      name: body.name,
      slug: body.slug,
      status: "active" as const,
      createdAt: now,
      updatedAt: now
    };
    await this.store.saveTenant(tenant);
    await this.audit("tenant_created", "admin", "Tenant created", { tenantId: tenant.id });
    return tenant;
  }

  @Get("tenants")
  async listTenants() {
    return this.store.listTenants();
  }

  @Post("tenants/:tenantId/pairing-codes")
  async issuePairing(@Param("tenantId") tenantId: string) {
    const tenant = await this.store.getTenant(tenantId);
    if (!tenant || tenant.status === "disabled") return { error: "tenant_not_available" };
    const plainCode = `GTS-${Math.floor(Math.random() * 9000 + 1000)}-XL`;
    const pair = {
      id: this.store.id("pair"),
      tenantId,
      codeHash: this.store.hashValue(plainCode),
      displayCodeLast4: plainCode.slice(-4),
      status: "active" as const,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    };
    await this.store.savePairing(pair);
    await this.audit("pairing_code_issued", "admin", "Pairing issued", { tenantId, pairingCodeId: pair.id });
    return { pairingCode: plainCode, pairingCodeId: pair.id, tenantId, expiresAt: pair.expiresAt };
  }

  @Post("agent/devices/enroll")
  async enroll(
    @Body()
    body: { pairingCode: string; deviceName: string; os: string; arch: string; agentVersion: string; publicKey: string }
  ) {
    const pair = await this.store.findPairingByCode(body.pairingCode);
    if (!pair || pair.status !== "active") return { error: "invalid_pairing_code" };
    if (new Date(pair.expiresAt).getTime() < Date.now()) {
      pair.status = "expired";
      return { error: "pairing_code_expired" };
    }
    const tenant = await this.store.getTenant(pair.tenantId);
    if (!tenant || tenant.status === "disabled") {
      return { error: "tenant_not_available" };
    }
    pair.status = "used";
    pair.usedAt = this.store.nowIso();
    const device = {
      id: this.store.id("dev"),
      tenantId: pair.tenantId,
      deviceName: body.deviceName,
      os: body.os,
      arch: body.arch,
      status: "connected" as const,
      lastSeenAt: this.store.nowIso()
    };
    pair.usedByDeviceId = device.id;
    await this.store.savePairing(pair);
    await this.store.saveDevice(device);
    await this.audit("device_enrolled", "agent", "Device enrolled", { tenantId: device.tenantId, deviceId: device.id });
    return {
      deviceId: device.id,
      tenantId: device.tenantId,
      credential: "temporary_or_signed_token",
      credentialExpiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      tunnelConfig: { provider: "mock", mode: "user", sessionId: this.store.id("tun") },
      runtimePolicy: { runtimeVersion: "1.0.0", requireSignedFlows: true }
    };
  }

  @Post("agent/devices/:deviceId/heartbeat")
  async heartbeat(@Param("deviceId") deviceId: string, @Body() body: Record<string, unknown>) {
    const device = await this.store.getDevice(deviceId);
    if (!device || device.status === "revoked") return { error: "device_revoked_or_not_found" };
    device.lastSeenAt = this.store.nowIso();
    await this.store.saveDevice(device);
    await this.audit("device_heartbeat", "agent", "Heartbeat received", { deviceId, ...body });
    return { ok: true, deviceId, lastSeenAt: device.lastSeenAt };
  }

  @Post("devices/:deviceId/commands")
  async issueCommand(
    @Param("deviceId") deviceId: string,
    @Body() body: { type: string; flowId?: string; payload: Record<string, unknown>; ttlSeconds?: number; idempotencyKey: string }
  ) {
    const device = await this.store.getDevice(deviceId);
    if (!device || device.status === "revoked") return { error: "device_not_available" };
    const tenant = await this.store.getTenant(device.tenantId);
    if (!tenant || tenant.status === "disabled") return { error: "tenant_not_available" };
    if (await this.store.hasIdempotency(deviceId, body.idempotencyKey)) {
      return { error: "duplicate_idempotency_key" };
    }
    await this.store.addIdempotency(deviceId, body.idempotencyKey);
    const command = {
      id: this.store.id("cmd"),
      tenantId: device.tenantId,
      deviceId,
      type: body.type,
      payload: body.payload ?? {},
      idempotencyKey: body.idempotencyKey,
      status: "pending" as const,
      expiresAt: new Date(Date.now() + (body.ttlSeconds ?? 300) * 1000).toISOString()
    };
    await this.store.saveCommand(command);
    await this.audit("command_issued", "admin", "Command issued", { commandId: command.id, deviceId });
    return command;
  }

  @Get("agent/devices/:deviceId/commands/poll")
  async poll(@Param("deviceId") deviceId: string) {
    const device = await this.store.getDevice(deviceId);
    if (!device || device.status === "revoked") return { error: "device_revoked_or_not_found", commands: [] };
    const now = Date.now();
    const pending = await this.store.findPendingCommand(deviceId);
    if (!pending) return { commands: [] };
    if (new Date(pending.expiresAt).getTime() < now) {
      pending.status = "expired";
      await this.store.saveCommand(pending);
      await this.audit("command_expired", "system", "Command expired", { commandId: pending.id });
      return { commands: [] };
    }
    pending.status = "delivered";
    await this.store.saveCommand(pending);
    await this.audit("command_delivered", "system", "Command delivered", { commandId: pending.id });
    return { commands: [pending] };
  }

  @Post("agent/devices/:deviceId/commands/:commandId/result")
  async result(
    @Param("deviceId") deviceId: string,
    @Param("commandId") commandId: string,
    @Body() body: Record<string, unknown>
  ) {
    const device = await this.store.getDevice(deviceId);
    const cmd = await this.store.getCommand(commandId);
    if (!device || device.status === "revoked" || !cmd) return { error: "command_or_device_invalid" };
    cmd.status = (body.status as "succeeded" | "failed") ?? "succeeded";
    cmd.result = body;
    await this.store.saveCommand(cmd);
    await this.audit(`command_${cmd.status}`, "agent", "Command finished", { commandId, deviceId });
    return { ok: true };
  }

  @Post("devices/:deviceId/revoke")
  async revoke(@Param("deviceId") deviceId: string) {
    const device = await this.store.getDevice(deviceId);
    if (!device) return { error: "device_not_found" };
    device.status = "revoked";
    await this.store.saveDevice(device);
    await this.audit("device_revoked", "admin", "Device revoked", { deviceId });
    return { ok: true, deviceId };
  }

  @Get("devices/:deviceId/audit")
  async deviceAudit(@Param("deviceId") deviceId: string) {
    return this.store.listAuditByDevice(deviceId);
  }

  @Get("health")
  health() {
    return { status: "ok", service: "orca-control-plane-api", timestamp: this.store.nowIso() };
  }

  @Patch("tenants/:tenantId/disable")
  async disableTenant(@Param("tenantId") tenantId: string) {
    const tenant = await this.store.getTenant(tenantId);
    if (!tenant) return { error: "tenant_not_found" };
    tenant.status = "disabled";
    tenant.updatedAt = this.store.nowIso();
    await this.store.saveTenant(tenant);
    await this.store.revokeDevicesByTenant(tenantId);
    await this.audit("tenant_disabled", "admin", "Tenant disabled", { tenantId });
    return tenant;
  }

  private async audit(eventType: string, actorType: string, message: string, metadata: Record<string, unknown>) {
    await this.store.pushAudit({
      id: this.store.id("aud"),
      eventType,
      actorType,
      severity: "info",
      message,
      ...metadata,
      createdAt: this.store.nowIso()
    });
  }
}
