import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';
import { CreateQrGrantDto } from './dto/create-qr-grant.dto';
import { LockActionRequestDto } from './dto/lock-action-request.dto';
import { RegisterLockDto } from './dto/register-lock.dto';

type LockStatus = 'locked' | 'unlocked' | 'offline';
type CommandStatus = 'accepted' | 'rejected';
type QrGrantStatus = 'active' | 'expired' | 'revoked' | 'exhausted';

export interface SmartDoorLock {
  id: string;
  tenant_id: string;
  name: string;
  provider: string;
  provider_device_id: string;
  property_id: string;
  supports_remote_unlock: boolean;
  supports_qr_web_access: boolean;
  lock_status: LockStatus;
  battery_level: number;
  last_seen_at: string;
}

export interface SmartDoorEvent {
  id: string;
  smart_lock_id: string;
  type: string;
  message: string;
  created_at: string;
  correlation_id?: string;
}

export interface QrGrant {
  id: string;
  tenant_id: string;
  smart_lock_id: string;
  issued_by_user_id: string;
  guest_label: string;
  token: string;
  token_hash: string;
  valid_from: string;
  expires_at: string;
  stay_duration_minutes: number;
  allowed_hours: string[];
  max_uses: number;
  current_uses: number;
  status: QrGrantStatus;
  created_at: string;
}

@Injectable()
export class SmartDoorService {
  private readonly locks = new Map<string, SmartDoorLock>();
  private readonly events = new Map<string, SmartDoorEvent[]>();
  private readonly qrGrants = new Map<string, QrGrant>();

  constructor() {
    const demoLock: SmartDoorLock = {
      id: 'lock-tuya-frontdoor-01',
      tenant_id: 'tenant-getupsoft-demo',
      name: 'Front Door',
      provider: 'tuya_cloud',
      provider_device_id: 'tuya-device-frontdoor-01',
      property_id: 'property-demo-main',
      supports_remote_unlock: true,
      supports_qr_web_access: true,
      lock_status: 'locked',
      battery_level: 84,
      last_seen_at: new Date().toISOString(),
    };
    this.locks.set(demoLock.id, demoLock);
    this.events.set(demoLock.id, [
      {
        id: randomUUID(),
        smart_lock_id: demoLock.id,
        type: 'lock.seeded',
        message: 'Demo lock registered for Smart Door scaffold',
        created_at: new Date().toISOString(),
      },
    ]);
  }

  getBlueprint() {
    return {
      product: 'GetUpSoft Smart Door',
      canonical_docs: '02_Products/GetUpSoftSmartDoor/TECHNICAL_PROPOSAL.md',
      backend_stack: ['Node.js', 'NestJS', 'TypeScript', 'PostgreSQL', 'Redis', 'BullMQ'],
      mobile_stack: ['Flutter', 'Firebase Cloud Messaging', 'Apple Push Notification Service'],
      cloud_stack: ['Cloudflare DNS', 'Cloudflare WAF', 'Cloudflare Access', 'Cloudflare Tunnel'],
      database_strategy: {
        container_policy: 'single-postgresql-container-per-environment',
        isolation_model: 'schema-based',
        schema_names: ['smartdoor', 'orca', 'workspace', 'analytics', 'shared'],
      },
      provider_strategy: ['tuya_cloud', 'getupsoft_gateway', 'getupsoft_native'],
      recommendation: {
        mvp: 'Use Tuya Cloud API without mandatory home gateway.',
        v1: 'Add guest access, QR grants, subscriptions, and technician workflows.',
        enterprise: 'Offer optional gateway and HA controls.',
      },
      orca: {
        prompt_id: 'getupsoft-smartdoor-orca-automation',
        workflow_contract: 'task-ledger/automation/getupsoft-smartdoor-orca-workflow.md',
        automation_scope: [
          'tenant onboarding',
          'offline lock sweep',
          'battery low sweep',
          'qr grant expiry cleanup',
          'tuya outage triage',
        ],
      },
    };
  }

  listLocks() {
    return [...this.locks.values()];
  }

  registerLock(dto: RegisterLockDto) {
    const id = `lock-${randomUUID()}`;
    const lock: SmartDoorLock = {
      id,
      tenant_id: dto.tenant_id,
      name: dto.name,
      provider: dto.provider,
      provider_device_id: dto.provider_device_id,
      property_id: dto.property_id,
      supports_remote_unlock: dto.supports_remote_unlock,
      supports_qr_web_access: dto.supports_qr_web_access,
      lock_status: 'locked',
      battery_level: 100,
      last_seen_at: new Date().toISOString(),
    };
    this.locks.set(id, lock);
    this.events.set(id, [
      {
        id: randomUUID(),
        smart_lock_id: id,
        type: 'lock.registered',
        message: `Lock ${dto.name} registered in Smart Door`,
        created_at: new Date().toISOString(),
      },
    ]);
    return lock;
  }

  getLock(lockId: string) {
    const lock = this.locks.get(lockId);
    if (!lock) {
      throw new NotFoundException('Smart lock not found');
    }
    return lock;
  }

  getLockEvents(lockId: string) {
    this.getLock(lockId);
    return this.events.get(lockId) ?? [];
  }

  openLock(lockId: string, dto: LockActionRequestDto) {
    const lock = this.getLock(lockId);
    if (!lock.supports_remote_unlock) {
      throw new BadRequestException('Lock does not support remote unlock');
    }

    lock.lock_status = 'unlocked';
    lock.last_seen_at = new Date().toISOString();

    const commandId = randomUUID();
    const event: SmartDoorEvent = {
      id: randomUUID(),
      smart_lock_id: lockId,
      type: 'lock.opened',
      message: `Remote open accepted for ${lock.name}`,
      created_at: new Date().toISOString(),
      correlation_id: dto.correlation_id,
    };
    this.events.set(lockId, [event, ...(this.events.get(lockId) ?? [])]);

    return {
      command_id: commandId,
      smart_lock_id: lockId,
      command_status: 'accepted' satisfies CommandStatus,
      lock_status: lock.lock_status,
      correlation_id: dto.correlation_id,
      idempotency_key: dto.idempotency_key,
      command_signature: this.signCommand(lockId, dto.idempotency_key, dto.correlation_id),
      expires_at: new Date(Date.now() + 60_000).toISOString(),
    };
  }

  createQrGrant(dto: CreateQrGrantDto) {
    const lock = this.getLock(dto.smart_lock_id);
    if (!lock.supports_qr_web_access) {
      throw new BadRequestException('Lock does not support QR web access');
    }

    const validFrom = new Date(dto.valid_from);
    const expiresAt = new Date(validFrom.getTime() + dto.stay_duration_minutes * 60_000);
    const token = randomUUID();
    const grant: QrGrant = {
      id: `qr-${randomUUID()}`,
      tenant_id: dto.tenant_id,
      smart_lock_id: dto.smart_lock_id,
      issued_by_user_id: dto.issued_by_user_id,
      guest_label: dto.guest_label,
      token,
      token_hash: this.hashToken(token),
      valid_from: validFrom.toISOString(),
      expires_at: expiresAt.toISOString(),
      stay_duration_minutes: dto.stay_duration_minutes,
      allowed_hours: dto.allowed_hours ?? [],
      max_uses: dto.max_uses ?? 1,
      current_uses: 0,
      status: 'active',
      created_at: new Date().toISOString(),
    };
    this.qrGrants.set(token, grant);

    return {
      ...grant,
      landing_url: `https://app.smartdoor.getupsoft.com/qr/${token}`,
    };
  }

  resolveQrGrant(token: string) {
    const grant = this.getActiveGrant(token);
    const lock = this.getLock(grant.smart_lock_id);

    return {
      qr_grant_id: grant.id,
      tenant_id: grant.tenant_id,
      guest_label: grant.guest_label,
      smart_lock_id: grant.smart_lock_id,
      smart_lock_name: lock.name,
      valid_from: grant.valid_from,
      expires_at: grant.expires_at,
      stay_duration_minutes: grant.stay_duration_minutes,
      remaining_uses: grant.max_uses - grant.current_uses,
      status: grant.status,
      allowed_hours: grant.allowed_hours,
    };
  }

  openLockWithQr(token: string, dto: LockActionRequestDto) {
    const grant = this.getActiveGrant(token);
    const lock = this.getLock(grant.smart_lock_id);

    if (grant.current_uses >= grant.max_uses) {
      grant.status = 'exhausted';
      throw new BadRequestException('QR grant usage limit reached');
    }

    grant.current_uses += 1;
    if (grant.current_uses >= grant.max_uses) {
      grant.status = 'exhausted';
    }

    const result = this.openLock(lock.id, dto);
    return {
      ...result,
      qr_grant_id: grant.id,
      guest_label: grant.guest_label,
      remaining_uses: Math.max(grant.max_uses - grant.current_uses, 0),
    };
  }

  getOrcaWorkflowSummary() {
    return {
      workflow_contract: 'task-ledger/automation/getupsoft-smartdoor-orca-workflow.md',
      prompt_id: 'getupsoft-smartdoor-orca-automation',
      allowed_intents: [
        'architecture review',
        'supported-device qualification',
        'tenant onboarding checklist',
        'technician dispatch planning',
        'low-battery sweep',
        'offline device sweep',
        'qr grant expiry cleanup',
        'audit timeline generation',
      ],
      forbidden_behaviors: [
        'direct unlock without Smart Door policy checks',
        'RBAC or ABAC bypass',
        'provider secret exposure',
        'illegal reverse engineering',
      ],
    };
  }

  private getActiveGrant(token: string) {
    const grant = this.qrGrants.get(token);
    if (!grant) {
      throw new NotFoundException('QR grant not found');
    }

    const now = Date.now();
    if (grant.status === 'revoked') {
      throw new BadRequestException('QR grant has been revoked');
    }
    if (new Date(grant.expires_at).getTime() <= now) {
      grant.status = 'expired';
      throw new BadRequestException('QR grant has expired');
    }
    if (new Date(grant.valid_from).getTime() > now) {
      throw new BadRequestException('QR grant is not active yet');
    }

    return grant;
  }

  private signCommand(lockId: string, idempotencyKey: string, correlationId: string) {
    return createHash('sha256')
      .update(`${lockId}:${idempotencyKey}:${correlationId}`)
      .digest('hex');
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }
}
