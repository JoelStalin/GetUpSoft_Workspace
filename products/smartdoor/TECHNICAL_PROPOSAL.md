# GetUpSoft Smart Door - Technical Proposal

## 0. Executive summary

GetUpSoft Smart Door should launch as a cloud-first, multi-tenant product that uses Tuya Cloud Open API for the MVP, NestJS as the control plane, Flutter for the mobile app, and Cloudflare as the public security edge.

The strongest commercially viable sequence is:

1. MVP without home gateway for officially supported Tuya smart locks.
2. Optional local gateway for BLE, Zigbee, LAN, and low-latency edge cases.
3. Future GetUpSoft-owned hardware for strategic independence.

This product should live as a canonical product in `02_Products/GetUpSoftSmartDoor/`, use `apps/backend-nest/` as the API foundation, and integrate with ORCA so workflows can automate onboarding, diagnostics, audit review, QR issuance, expiry, and support operations.

---

## 1. Feasibility analysis

### Scenario A - No additional hardware

Architecture:

```text
Flutter app
-> Cloudflare WAF / DNS / TLS
-> GetUpSoft Smart Door API (NestJS)
-> Tuya Integration Service
-> Tuya Cloud
-> Compatible Tuya smart lock
```

#### What can work

- Account linking to Tuya where official APIs allow it.
- Device inventory sync from Tuya-supported devices.
- Lock status retrieval when Tuya exposes status DP values or lock state endpoints.
- Remote open/close/lock/unlock commands where the device model and Tuya project permissions allow it.
- Battery level, online state, and telemetry where exposed by the provider.
- Access history ingestion via webhook, callback, or polling if officially supported.
- Temporary codes or credential operations only for models that expose those capabilities via the official Tuya API.

#### What depends on Tuya

- Device reachability from cloud to device.
- Device capability exposure per model, firmware, and Tuya project entitlement.
- Command delivery from Tuya Cloud to the lock.
- Event availability and latency.
- OAuth/account linking patterns if required by the Tuya product line.

#### What GetUpSoft stores

- Tenant, user, role, property, door, and device ownership mappings.
- Provider metadata and provider device mapping.
- Command history, idempotency keys, correlation IDs, and audit trails.
- Access schedules, guest invitations, temporary QR permissions, usage limits, and business rules.
- Subscription, billing, technician, installation, incident, and support records.
- Normalized lock events and health snapshots.

#### Limitations

- Not every Tuya lock supports all commands from the cloud.
- Some BLE or Zigbee devices still rely on a vendor bridge or local gateway.
- Temporary codes may be model-dependent.
- Event feeds may be incomplete or delayed.
- Latency is internet plus Tuya cloud plus device wake-up behavior.
- Offline local unlock without internet is not possible through GetUpSoft cloud alone.

#### Expected latency

- Status read: typically 300 ms to 3 s.
- Remote unlock command acknowledgement: typically 1 s to 6 s.
- Event visibility: near real-time to delayed, depending on Tuya callback support and polling frequency.

#### Failure modes

- If Tuya Cloud fails: GetUpSoft remains available for auth, audit, and UI, but provider-backed control degrades or stops.
- If GetUpSoft fails: Tuya app or native vendor path may still work; GetUpSoft policy, logs, QR access, and business workflows fail.
- If client internet fails: cloud control fails; any local/manual access method remains outside GetUpSoft cloud control.
- If the lock loses internet: no remote command path from Tuya Cloud.

#### Conclusion

Scenario A is viable for the MVP if device compatibility is explicitly controlled and the user promise is limited to officially supported Tuya cloud-capable models.

### Scenario B - Optional local gateway

Architecture:

```text
Flutter app / portals
-> Cloudflare
-> GetUpSoft API
-> MQTT / WebSocket / queue
-> Optional GetUpSoft Gateway on customer LAN
-> Local lock / bridge / BLE / Zigbee / LAN device
```

#### When a gateway is mandatory

- BLE lock with no official cloud control path.
- Zigbee lock that only works through a local coordinator or vendor hub.
- LAN lock that has only local API access.
- Low-latency or local-fallback requirements for enterprise sites.
- Future white-label edge automation such as door schedules, local anti-passback, or on-prem failover.

#### When a gateway is not needed

- Wi-Fi Tuya lock with stable official Tuya cloud support for the required commands.
- Lock family with reliable provider events and cloud API support.
- Customers who accept cloud-only latency and internet dependency.

#### Protocol limitations

- BLE: usually requires a nearby phone, proprietary bridge, or local gateway; direct global remote control is generally not possible without an always-on local path.
- Zigbee: requires a coordinator or vendor hub; Cloudflare cannot replace the RF network.
- Wi-Fi Tuya: often best for MVP, but still constrained by Tuya API entitlements and per-model features.
- LAN locks: feasible only when the vendor offers a legal local API; otherwise keep out of scope.

#### Gateway design constraints

- Outbound-only connection from customer LAN.
- No public inbound ports.
- Mutual authentication and per-gateway identity.
- MQTT over TLS or WebSocket over TLS to GetUpSoft.
- Optional Cloudflare Tunnel only for management surfaces, not as a substitute for local RF protocols.

#### Conclusion

Scenario B should be an optional enterprise module, not a Day 1 requirement. It is the correct path for BLE/Zigbee/LAN locks and for customers that require local resilience.

### Scenario C - Future GetUpSoft hardware

Architecture:

```text
GetUpSoft lock firmware
-> Device certificate
-> MQTT over TLS
-> GetUpSoft IoT control plane
-> NestJS services
-> Flutter / admin / ORCA automation
```

#### Benefits

- No Tuya dependency.
- Full control over capabilities, telemetry, and access rules.
- Better event fidelity.
- Device identity per certificate.
- OTA, secure provisioning, and fleet lifecycle control.

#### Requirements

- Hardware engineering and certification.
- Firmware security lifecycle.
- Secure manufacturing and key injection.
- OTA backend, rollback, and device twin strategy.
- Compliance, support, and warranty operations.

#### Conclusion

Scenario C is a future roadmap investment for independence, premium enterprise control, and ecosystem lock-in.

### Final recommendation

- MVP: Tuya Cloud Open API, no extra hardware, strict supported-device matrix.
- V1/Enterprise: optional local gateway module for BLE, Zigbee, LAN, and resilience.
- Long-term: GetUpSoft hardware line with native MQTT and device certificates.

---

## 2. General architecture

### Logical text diagram

```text
Mobile user / Admin / Technician / Customer
-> Flutter app / Admin web / Technician portal / Customer portal
-> Cloudflare DNS
-> Cloudflare WAF
-> Cloudflare TLS termination
-> Cloudflare Access for protected portals
-> GetUpSoft Smart Door API Gateway (NestJS)
-> Auth Service
-> Tenancy / RBAC / ABAC
-> Device Service
-> Smart Locks Service
-> Lock Command Service
-> Tuya Integration Service or Local Gateway Adapter or Future Hardware Adapter
-> Tuya Cloud / Gateway / Native MQTT device
-> Smart Door
```

### Event flow

```text
Smart Door
-> Tuya Cloud or Gateway
-> Webhook / polling / MQTT event ingestion
-> TuyaModule or GatewayModule
-> BullMQ event queue
-> LockEvents projector
-> AuditLogs service
-> Notifications service
-> WebSocket gateway
-> Flutter app / portals
```

### Component list

1. Mobile App Flutter.
2. Backend API NestJS.
3. Auth Service.
4. Device Service.
5. Lock Command Service.
6. Tuya Integration Service.
7. Notification Service.
8. Audit Log Service.
9. Subscription/Billing Service.
10. Admin Web Panel.
11. Technician Portal.
12. Customer Portal.
13. Redis.
14. PostgreSQL.
15. BullMQ workers.
16. WebSocket Gateway.
17. Optional MQTT broker.
18. Cloudflare WAF.
19. Cloudflare Tunnel.
20. Cloudflare Access.
21. Monitoring stack.
22. Backup Service.

### Edge-to-core responsibilities

- Cloudflare: DNS, TLS, WAF, Access, rate limiting, edge identity, zero-trust wrapping for internal consoles.
- NestJS: business policy engine and audit control plane.
- Provider adapters: deliver commands through supported provider channels.
- Redis/BullMQ: async execution, retries, outbox dispatch, webhook/event decoupling.
- PostgreSQL: system of record.

---

## 3. Backend architecture in NestJS

### Layering

- Domain Layer: aggregates, policies, value objects, domain events.
- Application Layer: use cases, command handlers, query handlers, sagas, DTO mapping.
- Infrastructure Layer: Prisma repositories, provider adapters, queue publishers, Redis, Tuya API clients, push gateways.
- Presentation Layer: REST controllers, WebSocket gateways, webhook endpoints, guards, interceptors.

### Modules

#### AuthModule

- Responsibility: login, refresh, MFA, session control, token issuance.
- Entities: UserSession, RefreshToken, MfaChallenge.
- Services: AuthService, TokenService, MfaService, SessionService.
- Controllers: AuthController.
- DTOs: LoginDto, RefreshDto, LogoutDto, EnableMfaDto, VerifyMfaDto.
- Repositories: SecuritySessionRepository, RefreshTokenRepository.
- Events published: `auth.logged_in`, `auth.logged_out`, `auth.mfa_enabled`, `auth.failed`.
- Events consumed: `user.revoked`.
- Use cases: login, refresh, revoke sessions, enable MFA.

#### UsersModule

- Responsibility: user lifecycle.
- Entities: User.
- Services: UsersService, UserProfileService.
- Controllers: UsersController.
- DTOs: CreateUserDto, UpdateUserDto.
- Repositories: UserRepository.
- Events published: `user.created`, `user.updated`, `user.deleted`.
- Events consumed: `tenant.created`.
- Use cases: create user, assign profile, soft delete.

#### TenantsModule

- Responsibility: multi-tenant boundary and tenant settings.
- Entities: Tenant, TenantPolicy.
- Services: TenantsService, TenantPolicyService.
- Controllers: TenantsController.
- DTOs: CreateTenantDto, UpdateTenantDto.
- Repositories: TenantRepository, TenantSettingsRepository.
- Events published: `tenant.created`, `tenant.updated`, `tenant.suspended`.
- Events consumed: `subscription.changed`.
- Use cases: onboard tenant, suspend tenant, apply plan policy.

#### CustomersModule

- Responsibility: customer organization records and contact model.
- Entities: Customer, Property.
- Services: CustomersService, PropertyService.
- Controllers: CustomersController, PropertiesController.
- DTOs: CreateCustomerDto, CreatePropertyDto.
- Repositories: CustomerRepository, PropertyRepository.
- Events published: `customer.created`, `property.created`.
- Events consumed: `tenant.created`.
- Use cases: create enterprise customer, add site/property.

#### DevicesModule

- Responsibility: generic device registry.
- Entities: Device, DeviceHealthSnapshot.
- Services: DevicesService, DeviceSyncService.
- Controllers: DevicesController.
- DTOs: RegisterDeviceDto, UpdateDeviceDto.
- Repositories: DeviceRepository.
- Events published: `device.registered`, `device.synced`, `device.offline`.
- Events consumed: `provider.device_discovered`.
- Use cases: register provider device mapping, update health.

#### SmartLocksModule

- Responsibility: lock-specific domain state.
- Entities: SmartLock, Door.
- Services: SmartLocksService, LockStatusService.
- Controllers: SmartLocksController.
- DTOs: CreateSmartLockDto, LockStatusResponseDto.
- Repositories: SmartLockRepository, DoorRepository.
- Events published: `lock.created`, `lock.status_changed`, `lock.battery_low`.
- Events consumed: `provider.lock_event`.
- Use cases: map lock to door, query state, expose current status.

#### LockCommandsModule

- Responsibility: remote command lifecycle.
- Entities: LockCommand.
- Services: LockCommandsService, CommandSignatureService, CommandPolicyService.
- Controllers: LockCommandsController.
- DTOs: OpenLockDto, LockActionResponseDto.
- Repositories: LockCommandRepository.
- Events published: `lock_command.created`, `lock_command.dispatched`, `lock_command.completed`, `lock_command.failed`.
- Events consumed: `provider.command_result`.
- Use cases: open, close, lock, unlock, revoke command, replay protection.

#### TuyaModule

- Responsibility: Tuya provider integration.
- Entities: TuyaAccount, TuyaDevice, TuyaWebhookEvent.
- Services: TuyaAuthService, TuyaDeviceSyncService, TuyaCommandAdapter, TuyaWebhookService.
- Controllers: TuyaController, TuyaWebhookController.
- DTOs: LinkTuyaDto, SyncTuyaDto, TuyaWebhookDto.
- Repositories: TuyaAccountRepository, TuyaDeviceRepository, WebhookEventRepository.
- Events published: `provider.device_discovered`, `provider.lock_event`, `provider.command_result`.
- Events consumed: `lock_command.created`, `tenant.integration_requested`.
- Use cases: link account, sync devices, dispatch command, normalize events.

#### InvitationsModule

- Responsibility: guest invitation lifecycle.
- Entities: GuestInvitation.
- Services: InvitationsService, InvitationTokenService.
- Controllers: InvitationsController.
- DTOs: CreateInvitationDto, AcceptInvitationDto, RevokeInvitationDto.
- Repositories: InvitationRepository.
- Events published: `invitation.created`, `invitation.accepted`, `invitation.revoked`, `invitation.expired`.
- Events consumed: `user.revoked`, `plan.changed`.
- Use cases: issue temporary guest access, accept invite, auto-expire.

#### AccessCodesModule

- Responsibility: temporary access codes and QR-linked web access policies.
- Entities: AccessCode, QrAccessGrant.
- Services: AccessCodesService, QrAccessService.
- Controllers: AccessCodesController, QrAccessController.
- DTOs: CreateAccessCodeDto, CreateQrGrantDto.
- Repositories: AccessCodeRepository, QrAccessGrantRepository.
- Events published: `access_code.created`, `access_code.revoked`, `qr_grant.created`, `qr_grant.expired`.
- Events consumed: `lock.capabilities_synced`.
- Use cases: issue code, revoke code, generate QR web access session with stay-time window.

#### AuditLogsModule

- Responsibility: immutable security trail.
- Entities: AuditLog.
- Services: AuditLogsService.
- Controllers: AuditLogsController.
- DTOs: AuditLogFilterDto.
- Repositories: AuditLogRepository.
- Events published: none externally; writes durable records.
- Events consumed: all critical domain events.
- Use cases: store full trace, tenant-visible audit reporting.

#### NotificationsModule

- Responsibility: push, email, SMS-ready notification orchestration.
- Entities: NotificationToken, PushNotification.
- Services: NotificationService, PushService, TemplateService.
- Controllers: NotificationTokensController.
- DTOs: RegisterNotificationTokenDto.
- Repositories: NotificationTokenRepository, PushNotificationRepository.
- Events published: `notification.sent`, `notification.failed`.
- Events consumed: `lock_event.created`, `lock_command.completed`, `invitation.created`, `battery.low`.
- Use cases: notify unlock, alert anomaly, route technician alerts.

#### BillingModule

- Responsibility: invoices and payments.
- Entities: Invoice, Payment.
- Services: BillingService, BillingWebhookService.
- Controllers: BillingController.
- DTOs: BillingWebhookDto.
- Repositories: InvoiceRepository, PaymentRepository.
- Events published: `payment.received`, `invoice.failed`.
- Events consumed: `subscription.created`, `subscription.renewed`.
- Use cases: payment recording and dunning.

#### SubscriptionsModule

- Responsibility: plans and entitlements.
- Entities: Subscription, Plan.
- Services: SubscriptionsService, EntitlementService.
- Controllers: SubscriptionsController, PlansController.
- DTOs: CreateSubscriptionDto.
- Repositories: SubscriptionRepository, PlanRepository.
- Events published: `subscription.created`, `subscription.changed`, `subscription.suspended`.
- Events consumed: `tenant.created`.
- Use cases: enforce feature flags like QR guests, temporary codes, gateway support.

#### TechniciansModule

- Responsibility: installer and field support workflows.
- Entities: Technician, InstallationJob.
- Services: TechniciansService, InstallationJobsService.
- Controllers: TechniciansController, InstallationJobsController.
- DTOs: CreateJobDto, CompleteJobDto.
- Repositories: TechnicianRepository, InstallationJobRepository.
- Events published: `installation_job.created`, `installation_job.completed`.
- Events consumed: `device.registered`.
- Use cases: bind locks, diagnostics, handoff to customer.

#### AdminModule

- Responsibility: GetUpSoft super-admin operations.
- Entities: SystemSetting, AdminAction.
- Services: AdminDashboardService, PlatformOpsService.
- Controllers: AdminController.
- DTOs: SystemHealthQueryDto.
- Repositories: SystemSettingsRepository.
- Events published: `admin.action`.
- Events consumed: platform metrics streams.
- Use cases: view tenant health, device errors, incident overview.

#### WebsocketModule

- Responsibility: real-time state updates.
- Entities: none core.
- Services: PresenceService, RealtimeDispatchService.
- Controllers: none.
- DTOs: WebSocket event payloads.
- Repositories: optional Redis-backed session index.
- Events published: socket events only.
- Events consumed: `lock_command.completed`, `lock.status_changed`, `notification.sent`.
- Use cases: live status, command progress, guest expiry countdown.

#### QueueModule

- Responsibility: async orchestration with BullMQ.
- Entities: JobEnvelope.
- Services: QueueService, JobDispatchService.
- Controllers: none.
- DTOs: internal job contracts.
- Repositories: job persistence through Redis plus outbox.
- Events published: `job.scheduled`, `job.failed`.
- Events consumed: command dispatch, webhook normalization, expiry sweeps.
- Use cases: retries, cron jobs, sagas, outbox relay.

#### SecurityModule

- Responsibility: policy enforcement, idempotency, rate limiting, device trust, signature validation.
- Entities: ApiKey, SecuritySession, IdempotencyRecord.
- Services: SecurityPolicyService, IdempotencyService, RateLimitService.
- Controllers: none directly or internal admin endpoints.
- DTOs: internal only.
- Repositories: ApiKeyRepository, SecuritySessionRepository.
- Events published: `security.alert`.
- Events consumed: login failures, suspicious commands.
- Use cases: replay prevention, abuse throttling.

#### ReportsModule

- Responsibility: operational and commercial reporting.
- Entities: materialized views and report snapshots.
- Services: ReportsService.
- Controllers: ReportsController.
- DTOs: ReportFilterDto.
- Repositories: ReportReadRepository.
- Events published: scheduled exports.
- Events consumed: subscription, audit, lock event streams.
- Use cases: usage by tenant, unlock volume, technician productivity.

#### HealthModule

- Responsibility: readiness, liveness, dependency health.
- Entities: none.
- Services: HealthService.
- Controllers: HealthController.
- DTOs: none.
- Repositories: none.
- Events published: `health.degraded`.
- Events consumed: monitor probes.
- Use cases: `/health`, `/health/database`, `/health/redis`, `/health/tuya`.

---

## 4. Design patterns

- Clean Architecture: all business rules sit in domain/application, not controllers.
- Hexagonal Architecture: provider adapters isolate Tuya, gateway, and future hardware.
- Repository Pattern: abstract PostgreSQL persistence from use cases.
- Unit of Work: wrap command creation + outbox + audit write in one transaction.
- Service Layer: application services coordinate use cases and policies.
- Strategy Pattern: `LockProviderStrategy` selects Tuya, Gateway, or NativeHardware.
- Adapter Pattern: Tuya API payloads become `LockStatus`, `LockEvent`, `LockCommandResult`.
- Factory Pattern: create concrete command payloads by provider and lock capability.
- Command Pattern: open, close, lock, unlock, issue code, revoke invite.
- Observer/Event Driven Pattern: lock events drive notifications, audits, and websockets.
- Partial CQRS: command path for critical mutations, read-optimized queries for dashboards.
- Saga Pattern: invitation issuance, remote command flows, revocation workflows.
- Circuit Breaker: wrap Tuya API calls.
- Retry Pattern: BullMQ-backed retries on transient provider errors.
- Outbox Pattern: reliable event publication after DB commit.
- Idempotency Pattern: `idempotency_key` required for critical remote actions.
- Rate Limiting Pattern: user, tenant, lock, IP, and QR-session throttles.
- RBAC: role-permission matrix by platform role.
- Multi-tenant Pattern: `tenant_id` on every tenant-scoped table plus query scoping.
- Audit Trail Pattern: every critical action creates a durable audit log.

---

## 5. Multi-tenant model

### Roles

- `SUPER_ADMIN_GETUPSOFT`
- `TENANT_ADMIN`
- `OWNER`
- `GUEST`
- `TECHNICIAN`
- `SUPPORT`

### Rules

- Every tenant-scoped table includes `tenant_id`.
- Every query path applies tenant guards before repository access.
- Cross-tenant support access requires explicit support impersonation workflow, reason code, time box, and audit log.
- Technicians can install and diagnose, but remote unlock is denied unless a temporary scoped grant exists and is audited.
- QR access resolves to a tenant-scoped web session tied to door permission, time window, usage count, and revocation status.

### Anti-leak controls

- Repository methods require tenant context.
- JWT carries tenant and role claims; server revalidates membership.
- Background jobs include tenant context.
- Admin analytics use separate elevated read models.
- Exports are tenant scoped, signed, and time-limited.

---

## 6. PostgreSQL data model

### Core conventions

- Primary keys: UUID.
- Audit fields: `created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`.
- Soft delete: `deleted_at` nullable timestamp, never hard delete security-critical rows except retention jobs with archive policy.
- Common indexes: `(tenant_id, id)`, `(tenant_id, created_at desc)`, provider IDs unique where required.

### Tables

#### tenants

- Fields: `id`, `name`, `slug`, `status`, `plan_id`, `timezone`, `settings_json`, audit fields.
- Indexes: unique `slug`, index `status`.

#### users

- Fields: `id`, `tenant_id`, `email`, `phone`, `full_name`, `status`, `password_hash`, `mfa_enabled`, `last_login_at`, audit fields.
- Indexes: unique `(tenant_id, email)`, unique global email if required for platform identity.

#### roles

- Fields: `id`, `code`, `name`, `scope`.
- Indexes: unique `code`.

#### permissions

- Fields: `id`, `code`, `name`, `resource`, `action`.
- Indexes: unique `code`.

#### user_roles

- Fields: `id`, `tenant_id`, `user_id`, `role_id`, `granted_by`, audit fields.
- Indexes: unique `(tenant_id, user_id, role_id)`.

#### customers

- Fields: `id`, `tenant_id`, `legal_name`, `display_name`, `contact_email`, `status`, audit fields.

#### properties

- Fields: `id`, `tenant_id`, `customer_id`, `name`, `address_line1`, `city`, `country`, `timezone`, audit fields.
- Indexes: `(tenant_id, customer_id)`.

#### doors

- Fields: `id`, `tenant_id`, `property_id`, `name`, `location_hint`, `status`, audit fields.

#### devices

- Fields: `id`, `tenant_id`, `door_id`, `device_provider`, `provider_device_id`, `serial_number`, `hardware_type`, `connectivity_type`, `last_seen_at`, `battery_level`, `lock_status`, `metadata_json`, audit fields.
- Indexes: unique `(device_provider, provider_device_id)`, `(tenant_id, door_id)`, `(tenant_id, last_seen_at)`.

#### smart_locks

- Fields: `id`, `tenant_id`, `device_id`, `capabilities_json`, `supports_remote_unlock`, `supports_access_codes`, `supports_qr_web_access`, `firmware_version`, `lock_status`, `battery_level`, `last_seen_at`, audit fields.

#### lock_providers

- Fields: `id`, `code`, `name`, `provider_type`, `status`, `config_schema_json`, audit fields.
- Seeded values: `tuya_cloud`, `getupsoft_gateway`, `getupsoft_native`.

#### tuya_accounts

- Fields: `id`, `tenant_id`, `provider_user_id`, `region`, `access_token_ref`, `refresh_token_ref`, `expires_at`, `status`, audit fields.
- Indexes: unique `(tenant_id, provider_user_id)`.

#### tuya_devices

- Fields: `id`, `tenant_id`, `tuya_account_id`, `device_id`, `category`, `product_id`, `raw_capabilities_json`, `last_sync_at`, audit fields.
- Indexes: unique `(tenant_id, device_id)`.

#### lock_commands

- Fields: `id`, `tenant_id`, `smart_lock_id`, `requested_by_user_id`, `command_type`, `command_payload_json`, `command_status`, `idempotency_key`, `correlation_id`, `command_signature`, `provider_request_id`, `expires_at`, `sent_at`, `completed_at`, `failure_reason`, audit fields.
- Indexes: unique `(tenant_id, idempotency_key)`, `(tenant_id, smart_lock_id, created_at desc)`, `(correlation_id)`.

#### lock_events

- Fields: `id`, `tenant_id`, `smart_lock_id`, `provider_event_id`, `event_type`, `event_source`, `event_at`, `normalized_payload_json`, `battery_level`, `lock_status`, `correlation_id`, audit fields.
- Indexes: unique `(tenant_id, provider_event_id)`, `(tenant_id, smart_lock_id, event_at desc)`.

#### access_codes

- Fields: `id`, `tenant_id`, `smart_lock_id`, `created_by_user_id`, `code_ref`, `label`, `status`, `valid_from`, `expires_at`, `usage_limit`, `usage_count`, audit fields.

#### guest_invitations

- Fields: `id`, `tenant_id`, `door_id`, `owner_user_id`, `guest_user_id`, `guest_email`, `status`, `valid_from`, `expires_at`, `allowed_hours_json`, `usage_limit`, `usage_count`, `invitation_token_hash`, audit fields.

#### user_device_permissions

- Fields: `id`, `tenant_id`, `user_id`, `device_id`, `permission_level`, `allowed_hours_json`, `valid_from`, `expires_at`, `max_uses`, `current_uses`, audit fields.

#### audit_logs

- Fields: `id`, `tenant_id`, `actor_user_id`, `actor_role`, `action`, `resource_type`, `resource_id`, `result`, `ip_address`, `user_agent`, `device_fingerprint`, `geo_approx_json`, `correlation_id`, `details_json`, `created_at`.
- Indexes: `(tenant_id, created_at desc)`, `(resource_type, resource_id)`, `(correlation_id)`.

#### notification_tokens

- Fields: `id`, `tenant_id`, `user_id`, `platform`, `token`, `device_name`, `last_seen_at`, audit fields.
- Indexes: unique `(platform, token)`.

#### push_notifications

- Fields: `id`, `tenant_id`, `user_id`, `type`, `title`, `body`, `status`, `sent_at`, `provider_message_id`, `payload_json`, audit fields.

#### subscriptions

- Fields: `id`, `tenant_id`, `plan_id`, `status`, `starts_at`, `expires_at`, `seat_limit`, `door_limit`, `feature_flags_json`, audit fields.

#### plans

- Fields: `id`, `code`, `name`, `price_monthly`, `price_yearly`, `features_json`, `status`, audit fields.

#### invoices

- Fields: `id`, `tenant_id`, `subscription_id`, `amount`, `currency`, `status`, `due_at`, `paid_at`, audit fields.

#### payments

- Fields: `id`, `tenant_id`, `invoice_id`, `provider`, `provider_payment_id`, `amount`, `status`, `paid_at`, audit fields.

#### technicians

- Fields: `id`, `tenant_id`, `user_id`, `status`, `skill_tags_json`, `scope_json`, audit fields.

#### installation_jobs

- Fields: `id`, `tenant_id`, `technician_id`, `property_id`, `door_id`, `status`, `scheduled_at`, `completed_at`, `notes_json`, audit fields.

#### gateway_devices

- Fields: `id`, `tenant_id`, `property_id`, `gateway_code`, `hardware_model`, `certificate_ref`, `status`, `last_seen_at`, `firmware_version`, `metadata_json`, audit fields.
- Indexes: unique `gateway_code`.

#### api_keys

- Fields: `id`, `tenant_id`, `name`, `key_hash`, `scope_json`, `expires_at`, `last_used_at`, audit fields.

#### security_sessions

- Fields: `id`, `tenant_id`, `user_id`, `session_type`, `device_fingerprint`, `ip_address`, `status`, `last_seen_at`, `expires_at`, audit fields.

#### refresh_tokens

- Fields: `id`, `tenant_id`, `user_id`, `token_hash`, `session_id`, `expires_at`, `revoked_at`, `replaced_by_token_id`, audit fields.

#### webhook_events

- Fields: `id`, `tenant_id`, `provider`, `event_type`, `provider_event_id`, `headers_json`, `payload_json`, `processed_at`, `status`, `error_text`, audit fields.
- Indexes: unique `(provider, provider_event_id)`.

#### outbox_events

- Fields: `id`, `tenant_id`, `aggregate_type`, `aggregate_id`, `event_type`, `payload_json`, `status`, `available_at`, `published_at`, retry fields, audit fields.

#### system_settings

- Fields: `id`, `scope`, `scope_ref_id`, `key`, `value_json`, audit fields.

### QR access additions

- Add `qr_access_grants` in implementation phase if separated from `access_codes`.
- Fields: `id`, `tenant_id`, `door_id`, `issued_by_user_id`, `guest_label`, `token_hash`, `valid_from`, `expires_at`, `stay_duration_minutes`, `allowed_hours_json`, `max_uses`, `current_uses`, `status`, `last_used_at`, audit fields.

---

## 7. REST API design

### Auth

- `POST /auth/login`
  - Request: `LoginDto { email, password, mfa_code? }`
  - Response: `AuthTokensDto`
  - Roles: public.
  - Errors: 401, 423, 429.
  - Events: `auth.logged_in`, `auth.failed`.
  - Audit: yes.
- `POST /auth/register`
  - Request: `RegisterDto { tenant_name, admin_name, email, password, phone? }`
  - Response: `TenantRegistrationResponseDto`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/mfa/enable`
- `POST /auth/mfa/verify`

### Tenants

- `GET /tenants`
- `POST /tenants`
- `GET /tenants/:id`
- `PATCH /tenants/:id`

Guardrails:

- `SUPER_ADMIN_GETUPSOFT` for global access.
- `TENANT_ADMIN` only for own tenant metadata.

### Users

- `GET /users`
- `POST /users`
- `PATCH /users/:id`
- `DELETE /users/:id`
- `POST /users/:id/roles`

### Devices

- `GET /devices`
- `POST /devices/register`
- `GET /devices/:id`
- `PATCH /devices/:id`
- `DELETE /devices/:id`

### Smart Locks

- `GET /locks`
- `GET /locks/:id`
- `POST /locks/:id/open`
- `POST /locks/:id/close`
- `POST /locks/:id/lock`
- `POST /locks/:id/unlock`
- `GET /locks/:id/status`
- `GET /locks/:id/events`
- `GET /locks/:id/battery`

Command request DTO pattern:

```text
LockActionRequestDto
- idempotency_key
- reason
- client_timestamp
- biometric_assertion_id
- correlation_id
```

### Access Codes

- `POST /locks/:id/access-codes`
- `GET /locks/:id/access-codes`
- `PATCH /access-codes/:id`
- `DELETE /access-codes/:id`

### Invitations

- `POST /invitations`
- `GET /invitations`
- `POST /invitations/:id/accept`
- `POST /invitations/:id/revoke`

### Tuya

- `POST /integrations/tuya/link`
- `GET /integrations/tuya/devices`
- `POST /integrations/tuya/sync`
- `POST /integrations/tuya/webhook`

### Audit

- `GET /audit-logs`
- `GET /audit-logs/locks/:id`

### Admin

- `GET /admin/dashboard`
- `GET /admin/tenants`
- `GET /admin/system-health`
- `GET /admin/device-errors`

### Technicians

- `GET /technicians/jobs`
- `POST /technicians/jobs`
- `PATCH /technicians/jobs/:id`
- `POST /technicians/jobs/:id/complete`

### Billing

- `GET /plans`
- `POST /subscriptions`
- `GET /subscriptions/current`
- `POST /billing/webhook`

### Health

- `GET /health`
- `GET /health/database`
- `GET /health/redis`
- `GET /health/tuya`

### QR web access endpoints

- `POST /locks/:id/qr-grants`
  - Create parametrized QR grant with stay window.
- `GET /qr/:token`
  - Resolve QR landing page, validate grant, show allowed door and time.
- `POST /qr/:token/open`
  - Execute remote open after policy validation and optional additional verification.

QR response rules:

- Never embed raw provider credentials in the QR.
- QR contains only a signed opaque token or short-lived URL token.
- Stay time parameter becomes `valid_from`, `expires_at`, allowed hours, and max use policy in server-side records.

---

## 8. Main flows

### A. Customer registration

1. Public register request arrives.
2. Tenant is created.
3. Tenant admin user is created.
4. Initial plan is assigned.
5. Welcome notification is queued.
6. Audit entry is recorded.

### B. Tuya lock linking

1. User enters app.
2. Chooses add smart door.
3. Chooses Tuya provider.
4. Completes provider linking flow.
5. Backend syncs discoverable devices.
6. User selects supported lock.
7. Internal device and smart lock mappings are saved.
8. Initial state sync is stored.
9. Audit entry is written.

### C. Remote opening

1. User presses open.
2. App requires biometric confirmation.
3. Backend validates JWT and session.
4. Backend validates tenant scope.
5. Backend validates door permission and time policy.
6. Backend validates plan entitlement if needed.
7. Backend generates or validates `idempotency_key`.
8. Backend signs command.
9. Command row is created in pending state.
10. Provider adapter dispatches to Tuya.
11. Response or async event updates command status.
12. Audit log is written.
13. Push notification is sent.
14. WebSocket updates the app.

### D. Temporary guest

1. Owner creates guest invitation.
2. Door and policy window are selected.
3. Use limits and schedules are defined.
4. Invitation token is generated.
5. Guest accepts.
6. Permission is activated.
7. Expiry and revocation jobs are scheduled.

### E. Temporary code

1. User requests access code.
2. Backend validates entitlement and capability.
3. Backend creates code record.
4. Provider adapter pushes code if supported.
5. Code remains active until expiry or revocation.

### F. Access event

1. Lock emits event.
2. Tuya exposes it by callback or polling.
3. Integration service ingests event.
4. Event is normalized.
5. `lock_events` is written.
6. `audit_logs` is written.
7. Notifications and socket updates are emitted.

### G. User revocation

1. Admin revokes user.
2. Sessions and refresh tokens are invalidated.
3. Device permissions are revoked.
4. Dependent guest or QR grants are revoked if needed.
5. Provider state is synchronized where applicable.
6. Audit trail is finalized.

### H. QR access with stay-time parameter

1. Owner or tenant admin creates QR grant.
2. Chooses allowed door(s), validity start, stay duration, and usage count.
3. Backend creates server-side grant with opaque token and expiry.
4. App renders QR.
5. Guest scans QR and reaches GetUpSoft web page.
6. Landing page validates token, displays allowed door and remaining window.
7. User taps open.
8. Backend validates grant status, tenant policy, rate limit, optional device fingerprint, and lock availability.
9. Unlock command is dispatched.
10. Usage count and audit are updated.
11. Grant auto-expires after configured stay-time or max uses.

---

## 9. Security design

### Authentication

- Short-lived JWT access tokens.
- Rotating refresh tokens.
- Optional MFA.
- Mobile biometric confirmation for critical commands.
- Failed login throttling and temporary lockout.

### Authorization

- RBAC for coarse permissions.
- ABAC for door, time, tenant, plan, and invitation scope.
- Tenant isolation enforced server-side for every request and job.

### Critical command controls

- Biometric confirmation in app.
- `idempotency_key`.
- `correlation_id`.
- command signature.
- short command expiry.
- nonce/replay prevention.
- rate limits per user, lock, tenant, QR grant, and IP.

### Infrastructure controls

- TLS required end-to-end where applicable.
- Cloudflare WAF for public entrypoints.
- Cloudflare Access for internal/admin surfaces.
- Private DB and Redis only.
- MQTT never public without mTLS and ACLs.
- Secrets in env or vault-backed storage.
- Encrypted backups.

### Audit requirements

- Every unlock attempt.
- Every failed unlock.
- Every permission change.
- Every QR issuance and use.
- Every technician support action.
- Every admin change.

### Alerts

- Repeated failed login.
- Repeated failed unlock.
- Unlock outside allowed hours.
- Offline lock.
- Low battery.
- Revoked user attempt.
- Tuya outage patterns.
- Suspected replay or abuse.

---

## 10. Cloudflare design

### Suggested DNS names

- `api.smartdoor.getupsoft.com`
- `admin.smartdoor.getupsoft.com`
- `app.smartdoor.getupsoft.com`
- `ws.smartdoor.getupsoft.com`
- `mqtt.smartdoor.getupsoft.com` if used
- `dev-api.smartdoor.getupsoft.com`
- `qa-api.smartdoor.getupsoft.com`

### WAF

- API rate limiting by IP and token.
- OWASP managed rules.
- Bot filtering for admin/public web surfaces.
- Country or ASN controls if business rules justify them.

### Zero Trust

- Admin panel behind Cloudflare Access.
- Grafana, Prometheus exporters, and internal dashboards behind Access.
- Technician elevated tools behind Access.

### Tunnel

- Expose internal admin tools without public inbound ports.
- Optional WebSocket exposure if topology needs tunnel.
- Optional gateway control plane registration through outbound tunnel-like patterns, but not as a replacement for IoT protocol support.

### Clarifications

- Cloudflare protects and routes traffic.
- Cloudflare does not replace the physical smart lock.
- Cloudflare does not replace BLE or Zigbee.
- Cloudflare cannot control a local-only lock without an available communication channel.
- Tuya Wi-Fi devices primarily use Tuya Cloud as the command path.
- BLE/Zigbee often require a gateway.
- Every GetUpSoft service should share a single PostgreSQL container per environment, with schema-based isolation instead of separate database containers.

---

## 11. Environments

### Local development

- Docker Compose local stack.
- Single local PostgreSQL container and Redis.
- Schema isolation per product or service namespace.
- Mock Tuya API.
- Mock push notifications.
- seed data.
- unit and integration tests.
- hot reload.

### Dev server

- `dev-api.smartdoor.getupsoft.com`
- `dev-admin.smartdoor.getupsoft.com`
- fake data, provider sandbox, verbose logs.
- auto deploy from `develop`.

### QA/Staging

- `qa-api.smartdoor.getupsoft.com`
- `qa-admin.smartdoor.getupsoft.com`
- production-like topology.
- single PostgreSQL container with separate schemas for qa workloads.
- separate Redis, keys, storage.
- E2E and load tests.
- protected by Cloudflare Access.

### Production

- `api.smartdoor.getupsoft.com`
- `admin.smartdoor.getupsoft.com`
- `ws.smartdoor.getupsoft.com`
- single PostgreSQL container per environment with per-product schemas.
- real data, backup, alerting, manual promotion.

---

## 12. Suggested server structure

```text
/opt/getupsoft-smartdoor/
  docker-compose.yml
  .env.production
  .env.qa
  .env.dev
  nginx/
  cloudflared/
  backend/
  admin/
  mobile/
  database/
  backups/
  logs/
  monitoring/
  scripts/
  docs/
```

### Docker services

- `smartdoor-api`
- `smartdoor-worker`
- `smartdoor-websocket`
- `smartdoor-admin`
- `smartdoor-postgres`
- `smartdoor-redis`
- `smartdoor-emqx`
- `smartdoor-prometheus`
- `smartdoor-grafana`
- `smartdoor-loki`
- `smartdoor-cloudflared`
- `smartdoor-backup`

---

## 13. CI/CD

### Repositories

- `getupsoft-smartdoor-backend`
- `getupsoft-smartdoor-admin`
- `getupsoft-smartdoor-mobile`
- `getupsoft-smartdoor-infra`

### Branching

- `feature/*`
- `develop`
- `release/*`
- `main`
- `hotfix/*`

### Deployment rules

- `develop -> dev`
- `release/* -> qa`
- `main -> production` with manual approval.

### Backend pipeline

1. install
2. lint
3. typecheck
4. unit tests
5. integration tests
6. Docker build
7. security scan
8. push image
9. deploy
10. migrations
11. health check
12. notification

---

## 14. Testing strategy

### Backend

- Unit, integration, E2E.
- contract tests for Tuya API.
- multi-tenant authorization tests.
- idempotency and duplicate command tests.
- QR access expiry and abuse tests.

### Mobile

- Unit, widget, integration.
- login, lock list, unlock, invitation, QR generation, offline partial behavior, biometrics.

### Admin

- Unit and E2E with Playwright.
- tenant scoping and dashboard role tests.

### IoT/provider

- mock Tuya.
- sandbox if available.
- lock simulator.
- timeout, retry, circuit breaker, duplicate event tests.

### Performance

- k6 for 100, 1000 users and 10,000 events/hour.
- concurrent websocket tests.

### Security

- SAST, DAST, dependency and secret scanning.
- replay attack and brute-force tests.

### UAT

- customer registers
- links lock
- opens door
- creates guest
- guest opens
- admin reviews history
- technician installs
- support diagnoses

---

## 15. Monitoring and observability

### Logs

- JSON structured logs.
- request ID, correlation ID, user ID, tenant ID, device ID, command ID.

### Metrics

- API latency.
- successful and failed commands.
- Tuya latency.
- event throughput.
- offline doors.
- low battery count.
- usage per tenant.

### Alerts

- API down.
- DB/Redis down.
- Tuya degraded.
- command failure spikes.
- backup failure.
- disk pressure.

### Tools

- Prometheus.
- Grafana.
- Loki.
- optional Uptime Kuma.
- optional Sentry.

---

## 16. Backups and recovery

### PostgreSQL

- Daily backups.
- Pre-migration backup.
- Retention 7-day, 30-day, monthly.
- encrypted at rest.
- monthly restore drill.

### Redis

- cache only, not source of truth.

### Disaster recovery targets

- MVP RPO: 24 h.
- MVP RTO: 4 h.
- Enterprise target later: RPO <= 1 h, RTO <= 1 h.

### Failure procedures

- Tuya outage: degrade command path, surface provider outage banner, queue non-critical sync jobs.
- Cloudflare outage: fail over to controlled direct origin only if business-approved; otherwise hold.
- GetUpSoft outage: restore from latest healthy deployment and DB snapshot.

---

## 17. Roadmap

### Phase 0 - Technical research

- validate Tuya Smart Lock API.
- validate model capabilities.
- validate sandbox/costs.
- buy 2-3 test locks.
- document official DP/capability matrix.

### Phase 1 - MVP

- NestJS API.
- PostgreSQL, Redis.
- JWT auth.
- basic multi-tenant.
- Flutter basics.
- link lock, open/close, status, history.
- push notifications.
- basic admin.

### Phase 2 - Commercial V1

- guests.
- temporary codes.
- QR access with stay-time policy.
- subscriptions.
- technician portal.
- advanced audit.
- real-time updates.

### Phase 3 - Enterprise

- white label.
- multi-property.
- advanced policies.
- optional local gateway.
- HA and SLA.

### Phase 4 - Hardware

- GetUpSoft gateway and lock hardware.
- firmware, MQTT, certs, OTA.

---

## 18. Detailed sprint plan

- Sprint 1: repos, NestJS, PostgreSQL, Redis, Docker, auth, tenant/user.
- Sprint 2: RBAC, refresh tokens, MFA base, initial audit, admin login.
- Sprint 3: devices, smart locks, provider model, Tuya skeleton, mocks.
- Sprint 4: Tuya linking, sync, lock state, integration logs.
- Sprint 5: remote commands, command pattern, idempotency, workers, retry/circuit breaker.
- Sprint 6: Flutter login, door list, open/close, real-time state.
- Sprint 7: guests, temporary permissions, QR access, push notifications.
- Sprint 8: admin, customers, technicians, dashboard, history.
- Sprint 9: QA, E2E, real Tuya validation, hardening.
- Sprint 10: production, backups, monitoring, documentation.

---

## 19. Documentation set

- technical README
- local install guide
- dev, QA, prod deploy guides
- Cloudflare guide
- Tuya guide
- env vars guide
- backup and restore guides
- technician guide
- customer manual
- support manual
- OpenAPI/Swagger
- architecture diagrams
- permissions matrix
- risk matrix

---

## 20. Risks and mitigations

| Risk | Probability | Impact | Mitigation | Fallback |
|---|---|---:|---|---|
| Tuya cloud dependency | High | High | strict compatibility matrix, circuit breaker, provider abstraction | optional gateway, future native hardware |
| API changes from Tuya | Medium | High | adapter isolation, contract tests, version pinning | temporary feature freeze by provider |
| Unsupported lock features | High | Medium | per-model capability registry | market only supported features |
| Unlock latency | Medium | High | UX expectations, retries, live status | optional gateway for premium sites |
| Internet outage | Medium | High | document limitation, local/manual fallback | gateway/local mode roadmap |
| Multi-tenant data leak | Low | Critical | tenant guards, tests, repository scoping | incident response and access shutdown |
| Cloudflare misconfiguration | Medium | High | IaC, staged validation, Access policies | rollback and direct internal access procedure |
| Token theft | Medium | High | short JWTs, rotating refresh, MFA, device binding | session revocation and forced logout |
| Legal issues from reverse engineering | Low | Critical | use official APIs only | remove unsupported model from scope |
| Cost overrun | Medium | Medium | quotas, plan limits, observability | adjust commercial plans |

---

## 21. Final recommendation

### MVP

- Tuya Cloud Open API.
- NestJS backend.
- Flutter app.
- Cloudflare edge security.
- No mandatory extra hardware.

### V1

- guest permissions.
- temporary codes.
- QR web access with configurable stay-time.
- advanced audit.
- subscriptions and technician portal.

### Enterprise

- optional local gateway.
- HA and stronger support operations.
- white label and external integrations.

### Independence path

- GetUpSoft hardware.
- native MQTT.
- device certs.
- OTA.
- secure provisioning.

---

## ORCA automation alignment

ORCA should orchestrate Smart Door operational workflows, not unlock doors directly without policy checks. Recommended ORCA automations:

- tenant onboarding checklist.
- Tuya capability matrix review.
- lock compatibility triage.
- daily offline lock sweep.
- battery-low notification campaigns.
- expired QR and guest access cleanup.
- technician job orchestration.
- incident timeline generation from audit logs.
- compliance report generation.

ORCA-triggered unlock commands must still go through the same authenticated Smart Door command APIs, with audit, role, policy, and idempotency enforcement.
