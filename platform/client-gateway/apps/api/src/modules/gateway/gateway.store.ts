import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHash, timingSafeEqual } from "crypto";
import { PrismaService } from "../../common/prisma/prisma.service";

type Tenant = {
  id: string;
  name: string;
  slug: string;
  status: "active" | "disabled";
  createdAt: string;
  updatedAt: string;
};

type PairingCode = {
  id: string;
  tenantId: string;
  codeHash: string;
  displayCodeLast4: string;
  status: "active" | "used" | "revoked" | "expired";
  expiresAt: string;
  usedAt?: string;
  usedByDeviceId?: string;
};

type Device = {
  id: string;
  tenantId: string;
  deviceName: string;
  os: string;
  arch: string;
  status: "connected" | "revoked";
  lastSeenAt?: string;
};

type AgentCommand = {
  id: string;
  tenantId: string;
  deviceId: string;
  type: string;
  payload: Record<string, unknown>;
  idempotencyKey: string;
  status: "pending" | "delivered" | "succeeded" | "failed" | "revoked" | "expired";
  expiresAt: string;
  result?: Record<string, unknown>;
};

@Injectable()
export class GatewayStore {
  readonly tenants = new Map<string, Tenant>();
  readonly pairingById = new Map<string, PairingCode>();
  readonly commandIdempotency = new Set<string>();
  readonly devices = new Map<string, Device>();
  readonly commands = new Map<string, AgentCommand>();
  readonly audit: Array<Record<string, unknown>> = [];

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService
  ) {}

  private usePrisma(): boolean {
    return (this.config.get<string>("GATEWAY_STORE_MODE") ?? "memory") === "prisma";
  }

  nowIso(): string {
    return new Date().toISOString();
  }

  id(prefix: string): string {
    return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
  }

  hashValue(value: string): string {
    return createHash("sha256").update(value).digest("hex");
  }

  constantTimeEquals(a: string, b: string): boolean {
    const left = Buffer.from(a, "utf8");
    const right = Buffer.from(b, "utf8");
    if (left.length !== right.length) return false;
    return timingSafeEqual(left, right);
  }

  async saveTenant(tenant: Tenant): Promise<void> {
    if (!this.usePrisma()) {
      this.tenants.set(tenant.id, tenant);
      return;
    }
    await this.prisma.tenant.upsert({
      where: { id: tenant.id },
      create: { ...tenant, createdAt: new Date(tenant.createdAt), updatedAt: new Date(tenant.updatedAt) },
      update: { name: tenant.name, slug: tenant.slug, status: tenant.status, updatedAt: new Date(tenant.updatedAt) }
    });
  }

  async getTenant(id: string): Promise<Tenant | undefined> {
    if (!this.usePrisma()) return this.tenants.get(id);
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) return undefined;
    return {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      status: tenant.status as "active" | "disabled",
      createdAt: tenant.createdAt.toISOString(),
      updatedAt: tenant.updatedAt.toISOString()
    };
  }

  async listTenants(): Promise<Tenant[]> {
    if (!this.usePrisma()) return Array.from(this.tenants.values());
    const rows = await this.prisma.tenant.findMany({ orderBy: { createdAt: "asc" } });
    return rows.map((tenant) => ({
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      status: tenant.status as "active" | "disabled",
      createdAt: tenant.createdAt.toISOString(),
      updatedAt: tenant.updatedAt.toISOString()
    }));
  }

  async savePairing(pair: PairingCode): Promise<void> {
    if (!this.usePrisma()) {
      this.pairingById.set(pair.id, pair);
      return;
    }
    await this.prisma.pairingCode.upsert({
      where: { id: pair.id },
      create: {
        ...pair,
        expiresAt: new Date(pair.expiresAt),
        usedAt: pair.usedAt ? new Date(pair.usedAt) : null
      },
      update: {
        status: pair.status,
        usedAt: pair.usedAt ? new Date(pair.usedAt) : null,
        usedByDeviceId: pair.usedByDeviceId ?? null
      }
    });
  }

  async findPairingByCode(inputCode: string): Promise<PairingCode | undefined> {
    const hashed = this.hashValue(inputCode);
    if (!this.usePrisma()) {
      for (const pair of this.pairingById.values()) {
        if (this.constantTimeEquals(pair.codeHash, hashed)) return pair;
      }
      return undefined;
    }
    const rows = await this.prisma.pairingCode.findMany({
      where: { codeHash: hashed },
      take: 1
    });
    const pair = rows[0];
    if (!pair) return undefined;
    return {
      id: pair.id,
      tenantId: pair.tenantId,
      codeHash: pair.codeHash,
      displayCodeLast4: pair.displayCodeLast4,
      status: pair.status as PairingCode["status"],
      expiresAt: pair.expiresAt.toISOString(),
      usedAt: pair.usedAt?.toISOString(),
      usedByDeviceId: pair.usedByDeviceId ?? undefined
    };
  }

  async saveDevice(device: Device): Promise<void> {
    if (!this.usePrisma()) {
      this.devices.set(device.id, device);
      return;
    }
    await this.prisma.device.upsert({
      where: { id: device.id },
      create: {
        ...device,
        lastSeenAt: device.lastSeenAt ? new Date(device.lastSeenAt) : null
      },
      update: {
        status: device.status,
        lastSeenAt: device.lastSeenAt ? new Date(device.lastSeenAt) : null
      }
    });
  }

  async revokeDevicesByTenant(tenantId: string): Promise<void> {
    if (!this.usePrisma()) {
      for (const device of this.devices.values()) {
        if (device.tenantId === tenantId) {
          device.status = "revoked";
        }
      }
      return;
    }
    await this.prisma.device.updateMany({
      where: { tenantId },
      data: { status: "revoked" }
    });
  }

  async getDevice(id: string): Promise<Device | undefined> {
    if (!this.usePrisma()) return this.devices.get(id);
    const row = await this.prisma.device.findUnique({ where: { id } });
    if (!row) return undefined;
    return {
      id: row.id,
      tenantId: row.tenantId,
      deviceName: row.deviceName,
      os: row.os,
      arch: row.arch,
      status: row.status as Device["status"],
      lastSeenAt: row.lastSeenAt?.toISOString()
    };
  }

  async saveCommand(command: AgentCommand): Promise<void> {
    if (!this.usePrisma()) {
      this.commands.set(command.id, command);
      return;
    }
    await this.prisma.agentCommand.upsert({
      where: { id: command.id },
      create: {
        id: command.id,
        tenantId: command.tenantId,
        deviceId: command.deviceId,
        type: command.type,
        payloadJson: JSON.stringify(command.payload),
        idempotencyKey: command.idempotencyKey,
        status: command.status,
        expiresAt: new Date(command.expiresAt)
      },
      update: {
        status: command.status,
        payloadJson: JSON.stringify(command.payload),
        expiresAt: new Date(command.expiresAt)
      }
    });
  }

  async getCommand(commandId: string): Promise<AgentCommand | undefined> {
    if (!this.usePrisma()) return this.commands.get(commandId);
    const row = await this.prisma.agentCommand.findUnique({ where: { id: commandId } });
    if (!row) return undefined;
    return {
      id: row.id,
      tenantId: row.tenantId,
      deviceId: row.deviceId,
      type: row.type,
      payload: JSON.parse(row.payloadJson) as Record<string, unknown>,
      idempotencyKey: row.idempotencyKey,
      status: row.status as AgentCommand["status"],
      expiresAt: row.expiresAt.toISOString()
    };
  }

  async findPendingCommand(deviceId: string): Promise<AgentCommand | undefined> {
    if (!this.usePrisma()) {
      return Array.from(this.commands.values()).find((cmd) => cmd.deviceId === deviceId && cmd.status === "pending");
    }
    const row = await this.prisma.agentCommand.findFirst({
      where: { deviceId, status: "pending" },
      orderBy: { createdAt: "asc" }
    });
    if (!row) return undefined;
    return {
      id: row.id,
      tenantId: row.tenantId,
      deviceId: row.deviceId,
      type: row.type,
      payload: JSON.parse(row.payloadJson) as Record<string, unknown>,
      idempotencyKey: row.idempotencyKey,
      status: row.status as AgentCommand["status"],
      expiresAt: row.expiresAt.toISOString()
    };
  }

  async hasIdempotency(deviceId: string, idempotencyKey: string): Promise<boolean> {
    const key = `${deviceId}:${idempotencyKey}`;
    if (!this.usePrisma()) return this.commandIdempotency.has(key);
    const row = await this.prisma.agentCommand.findFirst({
      where: { deviceId, idempotencyKey },
      select: { id: true }
    });
    return Boolean(row);
  }

  async addIdempotency(deviceId: string, idempotencyKey: string): Promise<void> {
    if (!this.usePrisma()) this.commandIdempotency.add(`${deviceId}:${idempotencyKey}`);
  }

  async pushAudit(event: Record<string, unknown>): Promise<void> {
    if (!this.usePrisma()) {
      this.audit.push(event);
      return;
    }
    await this.prisma.auditEvent.create({
      data: {
        id: String(event.id),
        tenantId: (event.tenantId as string | undefined) ?? null,
        deviceId: (event.deviceId as string | undefined) ?? null,
        actorType: String(event.actorType),
        eventType: String(event.eventType),
        severity: String(event.severity),
        message: String(event.message),
        metadataJson: JSON.stringify(event),
        createdAt: new Date(String(event.createdAt))
      }
    });
  }

  async listAuditByDevice(deviceId: string): Promise<Array<Record<string, unknown>>> {
    if (!this.usePrisma()) {
      return this.audit.filter((event) => event.deviceId === deviceId);
    }
    const rows = await this.prisma.auditEvent.findMany({
      where: { deviceId },
      orderBy: { createdAt: "asc" }
    });
    return rows.map((row) => ({
      id: row.id,
      eventType: row.eventType,
      actorType: row.actorType,
      severity: row.severity,
      message: row.message,
      tenantId: row.tenantId ?? undefined,
      deviceId: row.deviceId ?? undefined,
      createdAt: row.createdAt.toISOString()
    }));
  }
}
