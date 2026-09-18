module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/fs/promises [external] (fs/promises, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs/promises", () => require("fs/promises"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/Galantesjewelry/lib/runtime-paths.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getDataRoot",
    ()=>getDataRoot
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
;
function getDataRoot() {
    if (process.env.APP_DATA_DIR) {
        return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["resolve"])(/* turbopackIgnore: true */ process.env.APP_DATA_DIR);
    }
    return (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["resolve"])(process.cwd(), 'data');
}
}),
"[project]/Galantesjewelry/lib/appointments.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addAppointmentRecord",
    ()=>addAppointmentRecord,
    "buildAppointmentInterval",
    ()=>buildAppointmentInterval,
    "contactSubmissionSchema",
    ()=>contactSubmissionSchema,
    "createAppointmentId",
    ()=>createAppointmentId,
    "getClientIp",
    ()=>getClientIp,
    "listAppointmentRecords",
    ()=>listAppointmentRecords,
    "sanitizeErrorMessage",
    ()=>sanitizeErrorMessage,
    "updateAppointmentRecord",
    ()=>updateAppointmentRecord
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs/promises [external] (fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$runtime$2d$paths$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/lib/runtime-paths.ts [app-route] (ecmascript)");
;
;
;
;
;
const contactSubmissionSchema = __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    name: __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(2).max(120),
    email: __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().email().max(180),
    phone: __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().max(40).optional().default(''),
    inquiryType: __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(2).max(80),
    message: __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().trim().min(5).max(2000),
    appointmentDate: __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().regex(/^\d{4}-\d{2}-\d{2}$/),
    appointmentTime: __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().regex(/^\d{2}:\d{2}$/),
    honeypot: __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional().default('')
});
const appointmentsFile = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join((0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$runtime$2d$paths$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDataRoot"])(), 'appointments.json');
function emptyStore() {
    return {
        records: []
    };
}
async function readStore() {
    try {
        const fileContent = await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].readFile(appointmentsFile, 'utf-8');
        const parsed = JSON.parse(fileContent);
        return {
            records: Array.isArray(parsed.records) ? parsed.records : []
        };
    } catch  {
        return emptyStore();
    }
}
async function writeStore(store) {
    await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].mkdir(__TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].dirname(appointmentsFile), {
        recursive: true
    });
    await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].writeFile(appointmentsFile, JSON.stringify(store, null, 2), 'utf-8');
}
function createAppointmentId() {
    return `appt_${Date.now()}_${__TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].randomBytes(4).toString('hex')}`;
}
async function addAppointmentRecord(input) {
    const store = await readStore();
    const now = new Date().toISOString();
    const record = {
        id: createAppointmentId(),
        createdAt: now,
        updatedAt: now,
        ...input
    };
    store.records = [
        record,
        ...store.records
    ].slice(0, 1000);
    await writeStore(store);
    return record;
}
async function updateAppointmentRecord(id, updates) {
    const store = await readStore();
    const index = store.records.findIndex((record)=>record.id === id);
    if (index === -1) {
        return null;
    }
    store.records[index] = {
        ...store.records[index],
        ...updates,
        updatedAt: new Date().toISOString()
    };
    await writeStore(store);
    return store.records[index];
}
async function listAppointmentRecords(limitOrOptions = 100) {
    const store = await readStore();
    const options = typeof limitOrOptions === 'number' ? {
        limit: limitOrOptions
    } : limitOrOptions;
    const filteredRecords = options.odooSyncStatus ? store.records.filter((record)=>record.odooSyncStatus === options.odooSyncStatus) : store.records;
    return filteredRecords.slice(0, options.limit ?? 100);
}
function getClientIp(request) {
    const forwardedFor = request.headers.get('x-forwarded-for') || '';
    return forwardedFor.split(',')[0]?.trim() || 'local';
}
function sanitizeErrorMessage(error) {
    if (error instanceof Error) {
        return error.message.slice(0, 300);
    }
    return 'Unknown error';
}
function getTimeZoneOffsetMs(timeZone, date) {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone,
        hour12: false,
        hourCycle: 'h23',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).formatToParts(date);
    const valueFor = (type)=>Number(parts.find((part)=>part.type === type)?.value || '0');
    const asUtc = Date.UTC(valueFor('year'), valueFor('month') - 1, valueFor('day'), valueFor('hour'), valueFor('minute'), valueFor('second'));
    return asUtc - date.getTime();
}
function buildAppointmentInterval(input) {
    const [year, month, day] = input.appointmentDate.split('-').map(Number);
    const [hour, minute] = input.appointmentTime.split(':').map(Number);
    if (![
        year,
        month,
        day,
        hour,
        minute
    ].every(Number.isFinite)) {
        throw new Error('Invalid appointment date or time.');
    }
    const localUtc = Date.UTC(year, month - 1, day, hour, minute, 0);
    const firstGuess = new Date(localUtc);
    const firstOffset = getTimeZoneOffsetMs(input.timezone, firstGuess);
    const secondGuess = new Date(localUtc - firstOffset);
    const secondOffset = getTimeZoneOffsetMs(input.timezone, secondGuess);
    const start = new Date(localUtc - secondOffset);
    const end = new Date(start.getTime() + input.durationMinutes * 60 * 1000);
    if (start.getTime() < Date.now() - 5 * 60 * 1000) {
        throw new Error('Please select a future appointment time.');
    }
    return {
        start,
        end
    };
}
}),
"[project]/Galantesjewelry/lib/appointment-schedule.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "assertAppointmentSlotAllowed",
    ()=>assertAppointmentSlotAllowed,
    "isAllowedAppointmentDate",
    ()=>isAllowedAppointmentDate,
    "isAllowedAppointmentTime",
    ()=>isAllowedAppointmentTime,
    "listScheduleSlotsForDate",
    ()=>listScheduleSlotsForDate
]);
function parseTime(value) {
    const [hours, minutes] = value.split(':').map(Number);
    return hours * 60 + minutes;
}
function formatTime(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}
function getDateWeekday(dateValue) {
    const [year, month, day] = dateValue.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCDay();
}
function isAllowedAppointmentDate(appointmentDate, config) {
    return config.availableWeekdays.includes(getDateWeekday(appointmentDate));
}
function isAllowedAppointmentTime(appointmentTime, config) {
    const startMinutes = parseTime(config.startTime);
    const endMinutes = parseTime(config.endTime);
    const appointmentMinutes = parseTime(appointmentTime);
    const lastStartMinutes = endMinutes - config.durationMinutes;
    if (appointmentMinutes < startMinutes || appointmentMinutes > lastStartMinutes) {
        return false;
    }
    return (appointmentMinutes - startMinutes) % config.slotIntervalMinutes === 0;
}
function assertAppointmentSlotAllowed(appointmentDate, appointmentTime, config) {
    if (!isAllowedAppointmentDate(appointmentDate, config)) {
        throw new Error('Appointments are not offered on the selected day.');
    }
    if (!isAllowedAppointmentTime(appointmentTime, config)) {
        throw new Error('The selected appointment time is outside the available schedule.');
    }
}
function listScheduleSlotsForDate(appointmentDate, config) {
    if (!isAllowedAppointmentDate(appointmentDate, config)) {
        return [];
    }
    const slots = [];
    const startMinutes = parseTime(config.startTime);
    const lastStartMinutes = parseTime(config.endTime) - config.durationMinutes;
    for(let current = startMinutes; current <= lastStartMinutes; current += config.slotIntervalMinutes){
        const time = formatTime(current);
        slots.push({
            time,
            label: new Intl.DateTimeFormat('en-US', {
                hour: 'numeric',
                minute: '2-digit'
            }).format(new Date(`2000-01-01T${time}:00`))
        });
    }
    return slots;
}
}),
"[project]/Galantesjewelry/src/config/odooClient.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OdooConfigError",
    ()=>OdooConfigError,
    "OdooRequestError",
    ()=>OdooRequestError,
    "assertOdooConfig",
    ()=>assertOdooConfig,
    "buildOdooJson2Url",
    ()=>buildOdooJson2Url,
    "createOdooClient",
    ()=>createOdooClient,
    "getOdooAuthToken",
    ()=>getOdooAuthToken,
    "getOdooConfig",
    ()=>getOdooConfig,
    "getOdooHeaders",
    ()=>getOdooHeaders,
    "parseBooleanEnv",
    ()=>parseBooleanEnv
]);
const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_USER_AGENT = 'galantes-jewelry-appointments/1.0';
const DEFAULT_PARTNER_MODEL = 'res.partner';
const DEFAULT_APPOINTMENT_MODEL = 'galante.appointment';
const NON_RETRYABLE_STATUS_CODES = new Set([
    401,
    403,
    404
]);
const TRUE_VALUES = new Set([
    '1',
    'true',
    'yes',
    'on'
]);
const FALSE_VALUES = new Set([
    '0',
    'false',
    'no',
    'off'
]);
class OdooConfigError extends Error {
    constructor(message, details = {}){
        super(message);
        this.name = 'OdooConfigError';
        this.details = details;
    }
}
class OdooRequestError extends Error {
    constructor(message, details = {}){
        super(message);
        this.name = 'OdooRequestError';
        this.details = details;
    }
}
function firstDefinedValue(...values) {
    return values.find((value)=>value !== undefined && value !== null);
}
function parseBooleanEnv(value, fallback = false) {
    if (value === undefined || value === null || value === '') {
        return fallback;
    }
    if (typeof value === 'boolean') {
        return value;
    }
    const normalized = String(value).trim().toLowerCase();
    if (TRUE_VALUES.has(normalized)) {
        return true;
    }
    if (FALSE_VALUES.has(normalized)) {
        return false;
    }
    throw new OdooConfigError(`Invalid boolean value "${value}" in Odoo configuration.`);
}
function parseIntegerEnv(value, fallback, label) {
    if (value === undefined || value === null || value === '') {
        return fallback;
    }
    const parsed = Number.parseInt(String(value), 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new OdooConfigError(`${label} must be a positive integer.`);
    }
    return parsed;
}
function normalizeOptionalString(value) {
    if (value === undefined || value === null) {
        return '';
    }
    return String(value).trim();
}
function normalizeBaseUrl(value) {
    const normalized = normalizeOptionalString(value).replace(/\/+$/, '');
    if (!normalized) {
        return '';
    }
    try {
        const url = new URL(normalized);
        if (![
            'http:',
            'https:'
        ].includes(url.protocol)) {
            throw new Error('Invalid protocol');
        }
        return url.toString().replace(/\/+$/, '');
    } catch  {
        throw new OdooConfigError('ODOO_BASE_URL must be a valid http(s) URL.');
    }
}
function getOdooAuthToken(overrides = {}) {
    return normalizeOptionalString(firstDefinedValue(overrides.authToken, process.env.ODOO_BEARER_TOKEN, process.env.ODOO_API_KEY));
}
function getOdooPasswordFallback(overrides = {}) {
    return normalizeOptionalString(firstDefinedValue(overrides.password, process.env.ODOO_PASSWORD));
}
function getOdooConfig(overrides = {}) {
    const enabled = parseBooleanEnv(firstDefinedValue(overrides.enabled, process.env.ODOO_ENABLED), true);
    const baseUrl = normalizeBaseUrl(firstDefinedValue(overrides.baseUrl, process.env.ODOO_BASE_URL));
    const database = normalizeOptionalString(firstDefinedValue(overrides.database, process.env.ODOO_DATABASE, process.env.ODOO_DB));
    const authToken = getOdooAuthToken(overrides);
    const password = getOdooPasswordFallback(overrides);
    const timeoutMs = parseIntegerEnv(firstDefinedValue(overrides.timeoutMs, process.env.ODOO_TIMEOUT_MS), DEFAULT_TIMEOUT_MS, 'ODOO_TIMEOUT_MS');
    const config = {
        enabled,
        baseUrl,
        database,
        authToken,
        password,
        timeoutMs,
        syncOnAppointmentValidated: parseBooleanEnv(firstDefinedValue(overrides.syncOnAppointmentValidated, process.env.ODOO_SYNC_ON_APPOINTMENT_VALIDATED), true),
        publicShopUrl: normalizeOptionalString(firstDefinedValue(overrides.publicShopUrl, process.env.ODOO_PUBLIC_SHOP_URL)),
        websiteId: normalizeOptionalString(firstDefinedValue(overrides.websiteId, process.env.ODOO_WEBSITE_ID)),
        companyId: normalizeOptionalString(firstDefinedValue(overrides.companyId, process.env.ODOO_COMPANY_ID)),
        partnerModel: normalizeOptionalString(firstDefinedValue(overrides.partnerModel, process.env.ODOO_PARTNER_MODEL)) || DEFAULT_PARTNER_MODEL,
        appointmentModel: normalizeOptionalString(firstDefinedValue(overrides.appointmentModel, process.env.ODOO_APPOINTMENT_MODEL)) || DEFAULT_APPOINTMENT_MODEL,
        userAgent: normalizeOptionalString(firstDefinedValue(overrides.userAgent, process.env.ODOO_USER_AGENT)) || DEFAULT_USER_AGENT
    };
    const missing = [];
    if (config.enabled && !config.baseUrl) {
        missing.push('ODOO_BASE_URL');
    }
    if (config.enabled && !config.authToken && !config.password) {
        missing.push('ODOO_BEARER_TOKEN or ODOO_API_KEY or ODOO_PASSWORD');
    }
    if (config.enabled && !config.database) {
        missing.push('ODOO_DATABASE or ODOO_DB');
    }
    return {
        ...config,
        missing,
        isReady: config.enabled ? missing.length === 0 : false
    };
}
function assertOdooConfig(config = getOdooConfig()) {
    if (!config.enabled) {
        throw new OdooConfigError('Odoo sync is disabled by configuration.', {
            missing: []
        });
    }
    if (config.missing.length > 0) {
        throw new OdooConfigError(`Odoo configuration is incomplete: ${config.missing.join(', ')}`, {
            missing: config.missing
        });
    }
    return config;
}
function getOdooHeaders(config = getOdooConfig()) {
    const headers = {
        'Content-Type': 'application/json; charset=utf-8',
        Accept: 'application/json',
        'User-Agent': config.userAgent,
        'X-Odoo-Database': config.database
    };
    if (config.authToken) {
        headers['Authorization'] = `Bearer ${config.authToken}`;
    } else if (config.password) {
        // Some Odoo JSON-2 deployments accept the shared admin secret only via bearer auth.
        headers['Authorization'] = `Bearer ${config.password}`;
    }
    return headers;
}
function buildOdooUrl(model, method, config = getOdooConfig()) {
    const normalizedModel = normalizeOptionalString(model);
    const normalizedMethod = normalizeOptionalString(method);
    if (!normalizedModel || !normalizedMethod) {
        throw new OdooConfigError('Odoo model and method are required.');
    }
    return `${config.baseUrl}/json/2/${encodeURIComponent(normalizedModel)}/${encodeURIComponent(normalizedMethod)}`;
}
function buildOdooJson2Url(model, method, config = getOdooConfig()) {
    return buildOdooUrl(model, method, config);
}
async function parseResponseBody(response) {
    const contentType = response.headers.get('content-type') || '';
    if (response.status === 204) {
        return null;
    }
    if (contentType.includes('application/json')) {
        const data = await response.json();
        // Standard Odoo JSON-RPC wraps results in a 'result' or 'error' object
        if (data && typeof data === 'object' && ('result' in data || 'error' in data)) {
            if (data.error) {
                throw new OdooRequestError(data.error.message || 'Odoo JSON-RPC error', {
                    status: response.status,
                    body: data.error
                });
            }
            return data.result;
        }
        return data;
    }
    const text = await response.text();
    return text ? {
        message: text
    } : null;
}
function bindAbortSignal(controller, signal) {
    if (!signal) {
        return ()=>{};
    }
    if (signal.aborted) {
        controller.abort(signal.reason);
        return ()=>{};
    }
    const onAbort = ()=>controller.abort(signal.reason);
    signal.addEventListener('abort', onAbort, {
        once: true
    });
    return ()=>signal.removeEventListener('abort', onAbort);
}
function createOdooClient(overrides = {}) {
    function resolveConfig() {
        return getOdooConfig(overrides);
    }
    async function call(model, method, payload = {}, options = {}) {
        const config = assertOdooConfig(resolveConfig());
        const fetchImpl = options.fetchImpl || fetch;
        const maxRetries = options.maxRetries || 3;
        let lastError;
        for(let attempt = 0; attempt <= maxRetries; attempt++){
            const controller = new AbortController();
            const clearSignal = bindAbortSignal(controller, options.signal);
            const timeoutId = setTimeout(()=>controller.abort(), config.timeoutMs);
            try {
                if (attempt > 0) {
                    const delay = Math.pow(2, attempt) * 1000;
                    console.log(`[Odoo] Retry attempt ${attempt}/${maxRetries} using json2...`);
                    await new Promise((resolve)=>setTimeout(resolve, delay));
                }
                const cleanPayload = {
                    ...payload
                };
                delete cleanPayload.args;
                delete cleanPayload.kwargs;
                const response = await fetchImpl(buildOdooUrl(model, method, config), {
                    method: 'POST',
                    headers: getOdooHeaders(config),
                    body: JSON.stringify(cleanPayload),
                    signal: controller.signal
                });
                const result = await parseResponseBody(response);
                if (!response.ok) {
                    throw new OdooRequestError(result?.message || `Odoo request failed with status ${response.status}.`, {
                        status: response.status,
                        body: result,
                        model,
                        method
                    });
                }
                clearTimeout(timeoutId);
                clearSignal();
                return result;
            } catch (error) {
                clearTimeout(timeoutId);
                clearSignal();
                lastError = error;
                const errorStatus = error?.status || error?.details?.status;
                if (NON_RETRYABLE_STATUS_CODES.has(errorStatus) || error.name === 'OdooConfigError') {
                    throw error;
                }
                console.warn(`[Odoo] Request attempt ${attempt} failed with json2: ${error.message}`);
                if (attempt === maxRetries) {
                    throw error;
                }
            }
        }
        throw lastError || new OdooRequestError(`Unable to reach Odoo API after retries.`, {
            model,
            method
        });
    }
    return {
        getConfig: resolveConfig,
        call,
        async searchRead (model, payload = {}, options = {}) {
            return call(model, 'search_read', payload, options);
        },
        async create (model, values, options = {}) {
            return call(model, 'create', {
                vals: Array.isArray(values) ? undefined : values,
                vals_list: Array.isArray(values) ? values : [
                    values
                ]
            }, options);
        }
    };
}
;
}),
"[project]/Galantesjewelry/lib/odoo-cms-sync.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "loadCmsSnapshotFromOdoo",
    ()=>loadCmsSnapshotFromOdoo,
    "loadIntegrationsSnapshotFromOdoo",
    ()=>loadIntegrationsSnapshotFromOdoo,
    "syncCmsSnapshotToOdoo",
    ()=>syncCmsSnapshotToOdoo,
    "syncIntegrationsSnapshotToOdoo",
    ()=>syncIntegrationsSnapshotToOdoo,
    "syncSettingsToOdoo",
    ()=>syncSettingsToOdoo
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$src$2f$config$2f$odooClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/src/config/odooClient.js [app-route] (ecmascript)");
;
function getOdooClient() {
    const config = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$src$2f$config$2f$odooClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getOdooConfig"])();
    if (!config.isReady) {
        return null;
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$src$2f$config$2f$odooClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createOdooClient"])(config);
}
async function readSingletonRecord() {
    const odoo = getOdooClient();
    if (!odoo) {
        return null;
    }
    try {
        const records = await odoo.searchRead('galante.cms.settings', {
            domain: [],
            fields: [
                'id',
                'cms_snapshot_json',
                'integrations_snapshot_json'
            ],
            limit: 1
        });
        return records[0] || null;
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (message.includes('Invalid apikey') || message.includes('Access Denied')) {
            console.warn('[OdooSync] Authentication failed (Invalid apikey/Access Denied). Using local cache.');
        } else {
            console.error('Odoo snapshot read failed:', error);
        }
        return null;
    }
}
function buildFlatCmsFields(snapshot) {
    const settings = snapshot.settings || {};
    return {
        site_title: settings.site_title || null,
        site_description: settings.site_description || null,
        favicon_url: settings.favicon_url || null,
        logo_url: settings.logo_url || null,
        hero_image_url: settings.hero_image_url || null,
        instagram_url: settings.instagram_url || null,
        facebook_url: settings.facebook_url || null,
        whatsapp_number: settings.whatsapp_number || null,
        contact_email: settings.contact_email || null,
        contact_phone: settings.contact_phone || null,
        contact_address: settings.contact_address || null,
        appointment_email: settings.appointment_email || null,
        navigation_json: JSON.stringify(settings.navigation_links || [])
    };
}
async function upsertSingletonRecord(values) {
    const odoo = getOdooClient();
    if (!odoo) {
        return;
    }
    const existing = await readSingletonRecord();
    if (existing) {
        await odoo.call('galante.cms.settings', 'write', {
            ids: [
                existing.id
            ],
            vals: values
        });
        return;
    }
    await odoo.call('galante.cms.settings', 'create', {
        vals: values
    });
}
async function syncCmsSnapshotToOdoo(snapshot) {
    try {
        const cms_snapshot_json = JSON.stringify(snapshot);
        await upsertSingletonRecord({
            cms_snapshot_json,
            ...buildFlatCmsFields(snapshot)
        });
        return {
            success: true
        };
    } catch (error) {
        console.error('Odoo CMS snapshot sync failed (non-blocking):', error);
        return {
            success: false
        };
    }
}
async function loadCmsSnapshotFromOdoo() {
    const record = await readSingletonRecord();
    if (!record?.cms_snapshot_json) {
        return null;
    }
    try {
        const parsed = JSON.parse(record.cms_snapshot_json);
        if (!parsed.settings || !Array.isArray(parsed.sections) || !Array.isArray(parsed.featured_items)) {
            return null;
        }
        return {
            settings: parsed.settings,
            sections: parsed.sections,
            featured_items: parsed.featured_items
        };
    } catch (error) {
        console.error('Invalid CMS snapshot JSON from Odoo:', error);
        return null;
    }
}
async function syncIntegrationsSnapshotToOdoo(snapshot) {
    try {
        const integrations_snapshot_json = JSON.stringify(snapshot);
        await upsertSingletonRecord({
            integrations_snapshot_json
        });
        return {
            success: true
        };
    } catch (error) {
        console.error('Odoo integrations snapshot sync failed (non-blocking):', error);
        return {
            success: false
        };
    }
}
async function loadIntegrationsSnapshotFromOdoo() {
    const record = await readSingletonRecord();
    if (!record?.integrations_snapshot_json) {
        return null;
    }
    try {
        const parsed = JSON.parse(record.integrations_snapshot_json);
        if (!parsed?.google || !parsed?.appointments || !Array.isArray(parsed.audit)) {
            return null;
        }
        return parsed;
    } catch (error) {
        console.error('Invalid integrations snapshot JSON from Odoo:', error);
        return null;
    }
}
async function syncSettingsToOdoo(settings) {
    const existing = await loadCmsSnapshotFromOdoo();
    return syncCmsSnapshotToOdoo({
        settings,
        sections: existing?.sections || [],
        featured_items: existing?.featured_items || []
    });
}
}),
"[project]/Galantesjewelry/lib/integration-types.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "appointmentSecretFields",
    ()=>appointmentSecretFields,
    "googleSecretFields",
    ()=>googleSecretFields,
    "integrationEnvironments",
    ()=>integrationEnvironments
]);
const integrationEnvironments = [
    'development',
    'staging',
    'production'
];
const googleSecretFields = [
    'googleClientSecret',
    'apiKey',
    'accessToken',
    'refreshToken'
];
const appointmentSecretFields = [
    'googlePrivateKey',
    'gmailSmtpPassword',
    'sendGridApiKey'
];
}),
"[project]/Galantesjewelry/lib/secure-settings.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "decryptSecret",
    ()=>decryptSecret,
    "encryptSecret",
    ()=>encryptSecret,
    "maskEncryptedSecret",
    ()=>maskEncryptedSecret
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
;
const localIntegrationSecret = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].randomBytes(32).toString('hex');
function getEncryptionKey() {
    const source = process.env.APPOINTMENT_ENCRYPTION_KEY || process.env.INTEGRATIONS_SECRET_KEY || process.env.ADMIN_SECRET_KEY || localIntegrationSecret;
    return __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].createHash('sha256').update(source).digest();
}
function encryptSecret(value) {
    const iv = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].randomBytes(12);
    const cipher = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
    const encrypted = Buffer.concat([
        cipher.update(value, 'utf8'),
        cipher.final()
    ]);
    const tag = cipher.getAuthTag();
    return [
        'v1',
        iv.toString('base64url'),
        tag.toString('base64url'),
        encrypted.toString('base64url')
    ].join(':');
}
function decryptSecret(payload) {
    const [version, ivValue, tagValue, encryptedValue] = payload.split(':');
    if (version !== 'v1' || !ivValue || !tagValue || !encryptedValue) {
        throw new Error('Unsupported encrypted secret payload.');
    }
    const decipher = __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].createDecipheriv('aes-256-gcm', getEncryptionKey(), Buffer.from(ivValue, 'base64url'), {
        authTagLength: 16
    });
    decipher.setAuthTag(Buffer.from(tagValue, 'base64url'));
    return Buffer.concat([
        decipher.update(Buffer.from(encryptedValue, 'base64url')),
        decipher.final()
    ]).toString('utf8');
}
function maskEncryptedSecret(encryptedValue) {
    if (!encryptedValue) {
        return {
            isSet: false,
            maskedValue: ''
        };
    }
    try {
        const decrypted = decryptSecret(encryptedValue);
        const tail = decrypted.slice(-4);
        return {
            isSet: true,
            maskedValue: tail ? `********${tail}` : '********'
        };
    } catch  {
        return {
            isSet: true,
            maskedValue: '********'
        };
    }
}
}),
"[project]/Galantesjewelry/lib/integrations.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getAppointmentIntegrationConfigs",
    ()=>getAppointmentIntegrationConfigs,
    "getAppointmentIntegrationForEnvironment",
    ()=>getAppointmentIntegrationForEnvironment,
    "getDecryptedAppointmentIntegration",
    ()=>getDecryptedAppointmentIntegration,
    "getDecryptedGoogleIntegration",
    ()=>getDecryptedGoogleIntegration,
    "getGoogleIntegrationConfigs",
    ()=>getGoogleIntegrationConfigs,
    "getGoogleIntegrationForEnvironment",
    ()=>getGoogleIntegrationForEnvironment,
    "getIntegrationAdminPayload",
    ()=>getIntegrationAdminPayload,
    "recordAppointmentIntegrationTest",
    ()=>recordAppointmentIntegrationTest,
    "recordGoogleIntegrationTest",
    ()=>recordGoogleIntegrationTest,
    "storeGoogleOAuthTokens",
    ()=>storeGoogleOAuthTokens,
    "updateAppointmentIntegrationConfig",
    ()=>updateAppointmentIntegrationConfig,
    "updateGoogleIntegrationConfig",
    ()=>updateGoogleIntegrationConfig
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/crypto [external] (crypto, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs/promises [external] (fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$runtime$2d$paths$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/lib/runtime-paths.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$odoo$2d$cms$2d$sync$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/lib/odoo-cms-sync.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$integration$2d$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/lib/integration-types.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$secure$2d$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/lib/secure-settings.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
const dataDir = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$runtime$2d$paths$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDataRoot"])();
const integrationsFile = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].join(dataDir, 'integrations.json');
const MINIMUM_GOOGLE_SCOPES = [
    'openid',
    'email',
    'profile'
];
const DEFAULT_TIMEZONE = 'America/New_York';
const DEFAULT_DURATION_MINUTES = 60;
const DEFAULT_START_TIME = '09:00';
const DEFAULT_END_TIME = '18:00';
const DEFAULT_SLOT_INTERVAL_MINUTES = 30;
const DEFAULT_AVAILABLE_WEEKDAYS = [
    0,
    1,
    2,
    3,
    4,
    5,
    6
];
const DEFAULT_GMAIL_SENDER = process.env.GMAIL_SMTP_USER || '';
const DEFAULT_GMAIL_RECIPIENT = process.env.GMAIL_NOTIFICATION_TO || 'appointments@galantesjewelry.com';
const DEFAULT_GOOGLE_CONFIGS = {
    development: buildDefaultGoogleConfig({
        environment: 'development',
        javascriptOrigin: 'http://localhost:3000',
        redirectUri: 'http://localhost:3000/auth/google/callback'
    }),
    staging: buildDefaultGoogleConfig({
        environment: 'staging',
        javascriptOrigin: 'https://staging.galantesjewelry.com',
        redirectUri: 'https://staging.galantesjewelry.com/auth/google/callback'
    }),
    production: buildDefaultGoogleConfig({
        environment: 'production',
        javascriptOrigin: 'https://galantesjewelry.com',
        redirectUri: 'https://galantesjewelry.com/auth/google/callback'
    })
};
const DEFAULT_APPOINTMENT_CONFIGS = {
    development: buildDefaultAppointmentConfig('development'),
    staging: buildDefaultAppointmentConfig('staging'),
    production: buildDefaultAppointmentConfig('production')
};
function buildDefaultGoogleConfig(input) {
    return {
        provider: 'google',
        environment: input.environment,
        enabled: false,
        googleClientId: '',
        javascriptOrigin: input.javascriptOrigin,
        redirectUri: input.redirectUri,
        scopes: MINIMUM_GOOGLE_SCOPES,
        connectedGoogleEmail: '',
        oauthConnectedAt: null,
        encryptedSecrets: {},
        updatedAt: null,
        updatedBy: null
    };
}
function buildDefaultAppointmentConfig(environment) {
    return {
        provider: 'appointments',
        environment,
        googleCalendarEnabled: false,
        googleCalendarId: '',
        googleServiceAccountEmail: '',
        gmailNotificationsEnabled: false,
        gmailRecipientInbox: DEFAULT_GMAIL_RECIPIENT,
        gmailSender: DEFAULT_GMAIL_SENDER,
        appointmentDurationMinutes: DEFAULT_DURATION_MINUTES,
        appointmentTimezone: DEFAULT_TIMEZONE,
        appointmentStartTime: DEFAULT_START_TIME,
        appointmentEndTime: DEFAULT_END_TIME,
        appointmentSlotIntervalMinutes: DEFAULT_SLOT_INTERVAL_MINUTES,
        appointmentAvailableWeekdays: DEFAULT_AVAILABLE_WEEKDAYS,
        encryptedSecrets: {},
        updatedAt: null,
        updatedBy: null
    };
}
function emptyStore() {
    return {
        google: {
            development: {
                ...DEFAULT_GOOGLE_CONFIGS.development
            },
            staging: {
                ...DEFAULT_GOOGLE_CONFIGS.staging
            },
            production: {
                ...DEFAULT_GOOGLE_CONFIGS.production
            }
        },
        appointments: {
            development: {
                ...DEFAULT_APPOINTMENT_CONFIGS.development
            },
            staging: {
                ...DEFAULT_APPOINTMENT_CONFIGS.staging
            },
            production: {
                ...DEFAULT_APPOINTMENT_CONFIGS.production
            }
        },
        audit: []
    };
}
function isIntegrationEnvironment(value) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$integration$2d$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integrationEnvironments"].includes(value);
}
function assertGoogleSecretField(value) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$integration$2d$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["googleSecretFields"].includes(value);
}
function assertAppointmentSecretField(value) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$integration$2d$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["appointmentSecretFields"].includes(value);
}
function toAdminConfig(config) {
    return {
        provider: config.provider,
        environment: config.environment,
        enabled: config.enabled,
        googleClientId: config.googleClientId || process.env.GOOGLE_OAUTH_CLIENT_ID || '',
        javascriptOrigin: config.javascriptOrigin || process.env.GOOGLE_OAUTH_JAVASCRIPT_ORIGIN || '',
        redirectUri: config.redirectUri || process.env.GOOGLE_OAUTH_REDIRECT_URI || '',
        scopes: config.scopes.length > 0 ? config.scopes : process.env.GOOGLE_OAUTH_SCOPES?.split(' ') || [],
        connectedGoogleEmail: config.connectedGoogleEmail || '',
        oauthConnectedAt: config.oauthConnectedAt || null,
        updatedAt: config.updatedAt,
        updatedBy: config.updatedBy,
        secrets: {
            googleClientSecret: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$secure$2d$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["maskEncryptedSecret"])(config.encryptedSecrets.googleClientSecret),
            apiKey: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$secure$2d$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["maskEncryptedSecret"])(config.encryptedSecrets.apiKey),
            accessToken: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$secure$2d$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["maskEncryptedSecret"])(config.encryptedSecrets.accessToken),
            refreshToken: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$secure$2d$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["maskEncryptedSecret"])(config.encryptedSecrets.refreshToken)
        }
    };
}
function toAppointmentAdminConfig(config) {
    return {
        provider: config.provider,
        environment: config.environment,
        googleCalendarEnabled: config.googleCalendarEnabled,
        googleCalendarId: config.googleCalendarId,
        googleServiceAccountEmail: config.googleServiceAccountEmail,
        gmailNotificationsEnabled: config.gmailNotificationsEnabled,
        gmailRecipientInbox: config.gmailRecipientInbox,
        gmailSender: config.gmailSender,
        appointmentDurationMinutes: config.appointmentDurationMinutes,
        appointmentTimezone: config.appointmentTimezone,
        appointmentStartTime: config.appointmentStartTime,
        appointmentEndTime: config.appointmentEndTime,
        appointmentSlotIntervalMinutes: config.appointmentSlotIntervalMinutes,
        appointmentAvailableWeekdays: config.appointmentAvailableWeekdays,
        updatedAt: config.updatedAt,
        updatedBy: config.updatedBy,
        secrets: {
            googlePrivateKey: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$secure$2d$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["maskEncryptedSecret"])(config.encryptedSecrets.googlePrivateKey),
            gmailSmtpPassword: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$secure$2d$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["maskEncryptedSecret"])(config.encryptedSecrets.gmailSmtpPassword),
            sendGridApiKey: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$secure$2d$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["maskEncryptedSecret"])(config.encryptedSecrets.sendGridApiKey)
        }
    };
}
function normalizeScopeInput(value) {
    const rawScopes = Array.isArray(value) ? value : typeof value === 'string' ? value.split(/[\s,]+/) : MINIMUM_GOOGLE_SCOPES;
    const normalized = rawScopes.map((scope)=>String(scope).trim()).filter(Boolean);
    const deduped = Array.from(new Set([
        ...MINIMUM_GOOGLE_SCOPES,
        ...normalized
    ]));
    return deduped;
}
function validateNoWildcard(value, label) {
    if (value.includes('*')) {
        throw new Error(`${label} cannot contain wildcards.`);
    }
}
function isLocalhost(hostname) {
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
}
function validateHttpsUnlessLocalhost(url, label) {
    if (url.protocol === 'https:') {
        return;
    }
    if (url.protocol === 'http:' && isLocalhost(url.hostname)) {
        return;
    }
    throw new Error(`${label} must use HTTPS except for localhost.`);
}
function validateJavaScriptOrigin(value) {
    validateNoWildcard(value, 'Authorized JavaScript origin');
    const url = new URL(value);
    validateHttpsUnlessLocalhost(url, 'Authorized JavaScript origin');
    if (url.pathname !== '/' || url.search || url.hash || url.username || url.password) {
        throw new Error('Authorized JavaScript origin must not include path, query, fragment, or userinfo.');
    }
    return url.origin;
}
function validateRedirectUri(value) {
    validateNoWildcard(value, 'Authorized redirect URI');
    const url = new URL(value);
    validateHttpsUnlessLocalhost(url, 'Authorized redirect URI');
    if (url.hash || url.username || url.password) {
        throw new Error('Authorized redirect URI must not include fragment or userinfo.');
    }
    if (url.pathname.includes('/../') || url.pathname.includes('\\..')) {
        throw new Error('Authorized redirect URI must not contain path traversal.');
    }
    return url.toString();
}
async function ensureStoreFile() {
    await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].mkdir(dataDir, {
        recursive: true
    });
}
function hydrateStore(parsed) {
    const nextStore = emptyStore();
    for (const environment of __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$integration$2d$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integrationEnvironments"]){
        nextStore.google[environment] = {
            ...nextStore.google[environment],
            ...parsed.google?.[environment] || {},
            provider: 'google',
            environment,
            connectedGoogleEmail: parsed.google?.[environment]?.connectedGoogleEmail || '',
            oauthConnectedAt: parsed.google?.[environment]?.oauthConnectedAt || null
        };
    }
    for (const environment of __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$integration$2d$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integrationEnvironments"]){
        nextStore.appointments[environment] = {
            ...nextStore.appointments[environment],
            ...parsed.appointments?.[environment] || {},
            provider: 'appointments',
            environment
        };
    }
    nextStore.audit = Array.isArray(parsed.audit) ? parsed.audit.slice(0, 100) : [];
    return nextStore;
}
async function readStore() {
    await ensureStoreFile();
    try {
        const fileContent = await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].readFile(integrationsFile, 'utf-8');
        const parsed = JSON.parse(fileContent);
        return hydrateStore(parsed);
    } catch  {
        const odooSnapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$odoo$2d$cms$2d$sync$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadIntegrationsSnapshotFromOdoo"])();
        const nextStore = odooSnapshot ? hydrateStore(odooSnapshot) : emptyStore();
        await writeStore(nextStore);
        return nextStore;
    }
}
async function writeStore(store) {
    await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].mkdir(dataDir, {
        recursive: true
    });
    await __TURBOPACK__imported__module__$5b$externals$5d2f$fs$2f$promises__$5b$external$5d$__$28$fs$2f$promises$2c$__cjs$29$__["default"].writeFile(integrationsFile, JSON.stringify(store, null, 2), 'utf-8');
}
function buildAuditEntry(config, context, action, changedFields) {
    return {
        id: `${Date.now()}-${__TURBOPACK__imported__module__$5b$externals$5d2f$crypto__$5b$external$5d$__$28$crypto$2c$__cjs$29$__["default"].randomBytes(4).toString('hex')}`,
        timestamp: new Date().toISOString(),
        actor: context.actor,
        provider: config.provider,
        environment: config.environment,
        action,
        changedFields,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent
    };
}
async function getGoogleIntegrationConfigs() {
    const store = await readStore();
    return {
        configs: __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$integration$2d$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integrationEnvironments"].map((environment)=>toAdminConfig(store.google[environment])),
        audit: store.audit
    };
}
async function getAppointmentIntegrationConfigs() {
    const store = await readStore();
    return {
        configs: __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$integration$2d$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integrationEnvironments"].map((environment)=>toAppointmentAdminConfig(store.appointments[environment])),
        audit: store.audit
    };
}
async function getIntegrationAdminPayload() {
    const store = await readStore();
    return {
        configs: __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$integration$2d$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integrationEnvironments"].map((environment)=>toAdminConfig(store.google[environment])),
        appointmentConfigs: __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$integration$2d$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integrationEnvironments"].map((environment)=>toAppointmentAdminConfig(store.appointments[environment])),
        audit: store.audit
    };
}
async function getGoogleIntegrationForEnvironment(environment) {
    const store = await readStore();
    return store.google[environment];
}
async function getDecryptedGoogleIntegration(environment) {
    const config = await getGoogleIntegrationForEnvironment(environment);
    return {
        ...config,
        secrets: Object.fromEntries(__TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$integration$2d$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["googleSecretFields"].map((field)=>{
            const encryptedValue = config.encryptedSecrets[field];
            return [
                field,
                encryptedValue ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$secure$2d$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["decryptSecret"])(encryptedValue) : ''
            ];
        }))
    };
}
async function getAppointmentIntegrationForEnvironment(environment) {
    const store = await readStore();
    return store.appointments[environment];
}
async function getDecryptedAppointmentIntegration(environment) {
    const config = await getAppointmentIntegrationForEnvironment(environment);
    return {
        ...config,
        secrets: Object.fromEntries(__TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$integration$2d$types$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["appointmentSecretFields"].map((field)=>{
            const encryptedValue = config.encryptedSecrets[field];
            return [
                field,
                encryptedValue ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$secure$2d$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["decryptSecret"])(encryptedValue) : ''
            ];
        }))
    };
}
async function updateGoogleIntegrationConfig(input, context) {
    if (!isIntegrationEnvironment(input.environment)) {
        throw new Error('Invalid integration environment.');
    }
    const store = await readStore();
    const current = store.google[input.environment];
    const next = {
        ...current,
        encryptedSecrets: {
            ...current.encryptedSecrets
        }
    };
    const changedFields = new Set();
    if (typeof input.enabled === 'boolean' && input.enabled !== current.enabled) {
        next.enabled = input.enabled;
        changedFields.add('enabled');
    }
    if (typeof input.googleClientId === 'string' && input.googleClientId.trim() !== current.googleClientId) {
        next.googleClientId = input.googleClientId.trim();
        changedFields.add('googleClientId');
    }
    if (typeof input.javascriptOrigin === 'string') {
        const normalizedOrigin = validateJavaScriptOrigin(input.javascriptOrigin.trim());
        if (normalizedOrigin !== current.javascriptOrigin) {
            next.javascriptOrigin = normalizedOrigin;
            changedFields.add('javascriptOrigin');
        }
    }
    if (typeof input.redirectUri === 'string') {
        const normalizedRedirectUri = validateRedirectUri(input.redirectUri.trim());
        if (normalizedRedirectUri !== current.redirectUri) {
            next.redirectUri = normalizedRedirectUri;
            changedFields.add('redirectUri');
        }
    }
    if (input.scopes !== undefined) {
        const scopes = normalizeScopeInput(input.scopes);
        if (JSON.stringify(scopes) !== JSON.stringify(current.scopes)) {
            next.scopes = scopes;
            changedFields.add('scopes');
        }
    }
    for (const field of input.clearSecrets || []){
        if (!assertGoogleSecretField(field)) {
            continue;
        }
        if (next.encryptedSecrets[field]) {
            delete next.encryptedSecrets[field];
            changedFields.add(field);
        }
    }
    for (const [field, value] of Object.entries(input.secrets || {})){
        if (!assertGoogleSecretField(field)) {
            continue;
        }
        const trimmedValue = String(value || '').trim();
        if (!trimmedValue) {
            continue;
        }
        next.encryptedSecrets[field] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$secure$2d$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["encryptSecret"])(trimmedValue);
        changedFields.add(field);
    }
    if (changedFields.size > 0) {
        next.updatedAt = new Date().toISOString();
        next.updatedBy = context.actor;
        store.google[input.environment] = next;
        store.audit = [
            buildAuditEntry(next, context, current.updatedAt ? 'update' : 'create', [
                ...changedFields
            ]),
            ...store.audit
        ].slice(0, 100);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$odoo$2d$cms$2d$sync$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["syncIntegrationsSnapshotToOdoo"])(store);
        await writeStore(store);
    }
    return {
        config: toAdminConfig(next),
        changedFields: [
            ...changedFields
        ],
        audit: store.audit
    };
}
async function storeGoogleOAuthTokens(input, context) {
    if (!isIntegrationEnvironment(input.environment)) {
        throw new Error('Invalid integration environment.');
    }
    const store = await readStore();
    const current = store.google[input.environment];
    const next = {
        ...current,
        encryptedSecrets: {
            ...current.encryptedSecrets
        }
    };
    const changedFields = new Set();
    if (input.accessToken) {
        next.encryptedSecrets.accessToken = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$secure$2d$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["encryptSecret"])(input.accessToken);
        changedFields.add('accessToken');
    }
    if (input.refreshToken) {
        next.encryptedSecrets.refreshToken = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$secure$2d$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["encryptSecret"])(input.refreshToken);
        changedFields.add('refreshToken');
    }
    if (input.scopes !== undefined) {
        const scopes = normalizeScopeInput(input.scopes);
        if (JSON.stringify(scopes) !== JSON.stringify(current.scopes)) {
            next.scopes = scopes;
            changedFields.add('scopes');
        }
    }
    if (input.connectedGoogleEmail !== undefined && input.connectedGoogleEmail !== current.connectedGoogleEmail) {
        next.connectedGoogleEmail = normalizeEmail(input.connectedGoogleEmail);
        changedFields.add('connectedGoogleEmail');
    }
    next.oauthConnectedAt = new Date().toISOString();
    changedFields.add('oauthConnectedAt');
    next.enabled = true;
    changedFields.add('enabled');
    next.updatedAt = new Date().toISOString();
    next.updatedBy = context.actor;
    store.google[input.environment] = next;
    store.audit = [
        buildAuditEntry(next, context, current.updatedAt ? 'update' : 'create', [
            ...changedFields
        ]),
        ...store.audit
    ].slice(0, 100);
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$odoo$2d$cms$2d$sync$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["syncIntegrationsSnapshotToOdoo"])(store);
    await writeStore(store);
    return {
        config: toAdminConfig(next),
        changedFields: [
            ...changedFields
        ],
        audit: store.audit
    };
}
function normalizeEmail(value) {
    return String(value || '').trim().toLowerCase();
}
function normalizeOptionalText(value) {
    return String(value || '').trim();
}
function normalizeDuration(value) {
    const duration = Number(value);
    if (!Number.isFinite(duration) || duration < 15 || duration > 240) {
        throw new Error('Appointment duration must be between 15 and 240 minutes.');
    }
    return Math.round(duration);
}
function validateTimeString(value, label = 'Appointment time') {
    const normalized = normalizeOptionalText(value);
    if (!/^\d{2}:\d{2}$/.test(normalized)) {
        throw new Error(`${label} must use HH:MM format.`);
    }
    const [hours, minutes] = normalized.split(':').map(Number);
    if (!Number.isInteger(hours) || !Number.isInteger(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        throw new Error(`${label} is invalid.`);
    }
    return normalized;
}
function timeToMinutes(value) {
    const [hours, minutes] = value.split(':').map(Number);
    return hours * 60 + minutes;
}
function validateSlotInterval(value) {
    const interval = Number(value);
    if (!Number.isFinite(interval) || interval < 15 || interval > 240) {
        throw new Error('Appointment slot interval must be between 15 and 240 minutes.');
    }
    return Math.round(interval);
}
function validateAvailableWeekdays(value) {
    const normalized = Array.isArray(value) ? Array.from(new Set(value.map((day)=>Number(day)).filter((day)=>Number.isInteger(day) && day >= 0 && day <= 6))) : DEFAULT_AVAILABLE_WEEKDAYS;
    if (normalized.length === 0) {
        throw new Error('At least one appointment weekday must be enabled.');
    }
    return normalized.sort((left, right)=>left - right);
}
function validateTimeZone(value) {
    const timezone = normalizeOptionalText(value) || DEFAULT_TIMEZONE;
    try {
        new Intl.DateTimeFormat('en-US', {
            timeZone: timezone
        }).format(new Date());
        return timezone;
    } catch  {
        throw new Error('Appointment timezone is invalid.');
    }
}
async function updateAppointmentIntegrationConfig(input, context) {
    if (!isIntegrationEnvironment(input.environment)) {
        throw new Error('Invalid integration environment.');
    }
    const store = await readStore();
    const current = store.appointments[input.environment];
    const next = {
        ...current,
        encryptedSecrets: {
            ...current.encryptedSecrets
        }
    };
    const changedFields = new Set();
    if (typeof input.googleCalendarEnabled === 'boolean' && input.googleCalendarEnabled !== current.googleCalendarEnabled) {
        next.googleCalendarEnabled = input.googleCalendarEnabled;
        changedFields.add('googleCalendarEnabled');
    }
    if (typeof input.gmailNotificationsEnabled === 'boolean' && input.gmailNotificationsEnabled !== current.gmailNotificationsEnabled) {
        next.gmailNotificationsEnabled = input.gmailNotificationsEnabled;
        changedFields.add('gmailNotificationsEnabled');
    }
    const textFields = [
        [
            'googleCalendarId',
            normalizeOptionalText(input.googleCalendarId)
        ],
        [
            'googleServiceAccountEmail',
            normalizeEmail(input.googleServiceAccountEmail)
        ],
        [
            'gmailRecipientInbox',
            normalizeEmail(input.gmailRecipientInbox)
        ],
        [
            'gmailSender',
            normalizeEmail(input.gmailSender)
        ]
    ];
    for (const [field, value] of textFields){
        if (input[field] === undefined) {
            continue;
        }
        if (value !== current[field]) {
            next[field] = value;
            changedFields.add(field);
        }
    }
    if (input.appointmentDurationMinutes !== undefined) {
        const duration = normalizeDuration(input.appointmentDurationMinutes);
        if (duration !== current.appointmentDurationMinutes) {
            next.appointmentDurationMinutes = duration;
            changedFields.add('appointmentDurationMinutes');
        }
    }
    if (input.appointmentTimezone !== undefined) {
        const timezone = validateTimeZone(input.appointmentTimezone);
        if (timezone !== current.appointmentTimezone) {
            next.appointmentTimezone = timezone;
            changedFields.add('appointmentTimezone');
        }
    }
    if (input.appointmentStartTime !== undefined) {
        const startTime = validateTimeString(input.appointmentStartTime, 'Appointment start time');
        if (startTime !== current.appointmentStartTime) {
            next.appointmentStartTime = startTime;
            changedFields.add('appointmentStartTime');
        }
    }
    if (input.appointmentEndTime !== undefined) {
        const endTime = validateTimeString(input.appointmentEndTime, 'Appointment end time');
        if (endTime !== current.appointmentEndTime) {
            next.appointmentEndTime = endTime;
            changedFields.add('appointmentEndTime');
        }
    }
    if (input.appointmentSlotIntervalMinutes !== undefined) {
        const interval = validateSlotInterval(input.appointmentSlotIntervalMinutes);
        if (interval !== current.appointmentSlotIntervalMinutes) {
            next.appointmentSlotIntervalMinutes = interval;
            changedFields.add('appointmentSlotIntervalMinutes');
        }
    }
    if (input.appointmentAvailableWeekdays !== undefined) {
        const weekdays = validateAvailableWeekdays(input.appointmentAvailableWeekdays);
        if (JSON.stringify(weekdays) !== JSON.stringify(current.appointmentAvailableWeekdays)) {
            next.appointmentAvailableWeekdays = weekdays;
            changedFields.add('appointmentAvailableWeekdays');
        }
    }
    const effectiveStartTime = input.appointmentStartTime !== undefined ? next.appointmentStartTime : current.appointmentStartTime;
    const effectiveEndTime = input.appointmentEndTime !== undefined ? next.appointmentEndTime : current.appointmentEndTime;
    const effectiveDuration = input.appointmentDurationMinutes !== undefined ? next.appointmentDurationMinutes : current.appointmentDurationMinutes;
    const effectiveInterval = input.appointmentSlotIntervalMinutes !== undefined ? next.appointmentSlotIntervalMinutes : current.appointmentSlotIntervalMinutes;
    if (timeToMinutes(effectiveStartTime) >= timeToMinutes(effectiveEndTime)) {
        throw new Error('Appointment end time must be later than the start time.');
    }
    if (timeToMinutes(effectiveStartTime) + effectiveDuration > timeToMinutes(effectiveEndTime)) {
        throw new Error('Appointment duration does not fit inside the configured booking window.');
    }
    if (effectiveInterval > effectiveDuration) {
        throw new Error('Appointment slot interval cannot be longer than the appointment duration.');
    }
    for (const field of input.clearSecrets || []){
        if (!assertAppointmentSecretField(field)) {
            continue;
        }
        if (next.encryptedSecrets[field]) {
            delete next.encryptedSecrets[field];
            changedFields.add(field);
        }
    }
    for (const [field, value] of Object.entries(input.secrets || {})){
        if (!assertAppointmentSecretField(field)) {
            continue;
        }
        const trimmedValue = String(value || '').trim();
        if (!trimmedValue) {
            continue;
        }
        next.encryptedSecrets[field] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$secure$2d$settings$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["encryptSecret"])(trimmedValue);
        changedFields.add(field);
    }
    if (changedFields.size > 0) {
        next.updatedAt = new Date().toISOString();
        next.updatedBy = context.actor;
        store.appointments[input.environment] = next;
        store.audit = [
            buildAuditEntry(next, context, current.updatedAt ? 'update' : 'create', [
                ...changedFields
            ]),
            ...store.audit
        ].slice(0, 100);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$odoo$2d$cms$2d$sync$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["syncIntegrationsSnapshotToOdoo"])(store);
        await writeStore(store);
    }
    return {
        config: toAppointmentAdminConfig(next),
        changedFields: [
            ...changedFields
        ],
        audit: store.audit
    };
}
async function recordGoogleIntegrationTest(environment, context) {
    if (!isIntegrationEnvironment(environment)) {
        throw new Error('Invalid integration environment.');
    }
    const store = await readStore();
    const config = store.google[environment];
    const auditEntry = buildAuditEntry(config, context, 'test', [
        'connectionTest'
    ]);
    store.audit = [
        auditEntry,
        ...store.audit
    ].slice(0, 100);
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$odoo$2d$cms$2d$sync$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["syncIntegrationsSnapshotToOdoo"])(store);
    await writeStore(store);
    return auditEntry;
}
async function recordAppointmentIntegrationTest(environment, context) {
    if (!isIntegrationEnvironment(environment)) {
        throw new Error('Invalid integration environment.');
    }
    const store = await readStore();
    const config = store.appointments[environment];
    const auditEntry = buildAuditEntry(config, context, 'test', [
        'appointmentIntegrationTest'
    ]);
    store.audit = [
        auditEntry,
        ...store.audit
    ].slice(0, 100);
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$odoo$2d$cms$2d$sync$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["syncIntegrationsSnapshotToOdoo"])(store);
    await writeStore(store);
    return auditEntry;
}
}),
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[project]/Galantesjewelry/lib/auth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ADMIN_COOKIE_NAME",
    ()=>ADMIN_COOKIE_NAME,
    "ADMIN_SESSION_MAX_AGE",
    ()=>ADMIN_SESSION_MAX_AGE,
    "getAdminCookieOptions",
    ()=>getAdminCookieOptions,
    "getAdminSessionFromRequest",
    ()=>getAdminSessionFromRequest,
    "getExpiredAdminCookieOptions",
    ()=>getExpiredAdminCookieOptions,
    "shouldUseSecureCookies",
    ()=>shouldUseSecureCookies,
    "signToken",
    ()=>signToken,
    "verifyToken",
    ()=>verifyToken
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$sign$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/jose/dist/webapi/jwt/sign.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$verify$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/jose/dist/webapi/jwt/verify.js [app-route] (ecmascript)");
;
;
const ADMIN_COOKIE_NAME = 'admin_token';
const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24 * 30;
const localAdminSecret = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].randomBytes(32).toString('hex');
function readCookieValue(cookieHeader, cookieName) {
    if (!cookieHeader) {
        return null;
    }
    for (const chunk of cookieHeader.split(';')){
        const [rawName, ...rest] = chunk.trim().split('=');
        if (rawName === cookieName) {
            return rest.join('=') || null;
        }
    }
    return null;
}
function getSecretKey() {
    return new TextEncoder().encode(process.env.ADMIN_SECRET_KEY || localAdminSecret);
}
function shouldUseSecureCookies(request) {
    const forwardedProto = request?.headers.get('x-forwarded-proto');
    if (forwardedProto) {
        return forwardedProto.split(',')[0]?.trim() === 'https';
    }
    return ("TURBOPACK compile-time value", "development") === 'production';
}
function getAdminCookieOptions(request) {
    return {
        httpOnly: true,
        maxAge: ADMIN_SESSION_MAX_AGE,
        path: '/',
        sameSite: 'lax',
        secure: shouldUseSecureCookies(request)
    };
}
function getExpiredAdminCookieOptions(request) {
    return {
        ...getAdminCookieOptions(request),
        expires: new Date(0),
        maxAge: 0
    };
}
async function signToken(payload) {
    return await new __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$sign$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SignJWT"](payload).setProtectedHeader({
        alg: 'HS256'
    }).setIssuedAt().setExpirationTime('30d').sign(getSecretKey());
}
async function verifyToken(token) {
    try {
        const { payload } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$verify$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jwtVerify"])(token, getSecretKey());
        return payload;
    } catch  {
        return null;
    }
}
async function getAdminSessionFromRequest(request) {
    const token = readCookieValue(request.headers.get('cookie'), ADMIN_COOKIE_NAME);
    if (!token) {
        return null;
    }
    return verifyToken(token);
}
}),
"[project]/Galantesjewelry/lib/google-login.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GOOGLE_OAUTH_RETURN_COOKIE",
    ()=>GOOGLE_OAUTH_RETURN_COOKIE,
    "GOOGLE_OAUTH_STATE_COOKIE",
    ()=>GOOGLE_OAUTH_STATE_COOKIE,
    "GOOGLE_USER_COOKIE",
    ()=>GOOGLE_USER_COOKIE,
    "GOOGLE_USER_SESSION_MAX_AGE",
    ()=>GOOGLE_USER_SESSION_MAX_AGE,
    "assertGoogleLoginConfig",
    ()=>assertGoogleLoginConfig,
    "getExpiredGoogleOAuthCookieOptions",
    ()=>getExpiredGoogleOAuthCookieOptions,
    "getGoogleLoginConfig",
    ()=>getGoogleLoginConfig,
    "getGoogleOAuthCookieOptions",
    ()=>getGoogleOAuthCookieOptions,
    "getGoogleRedirectBaseUrl",
    ()=>getGoogleRedirectBaseUrl,
    "getGoogleUserCookieOptions",
    ()=>getGoogleUserCookieOptions,
    "getPublicBaseUrl",
    ()=>getPublicBaseUrl,
    "getPublicUrl",
    ()=>getPublicUrl,
    "getRequestBaseUrl",
    ()=>getRequestBaseUrl,
    "getRequestUrl",
    ()=>getRequestUrl,
    "resolveGoogleEnvironmentFromHost",
    ()=>resolveGoogleEnvironmentFromHost,
    "sanitizeReturnTo",
    ()=>sanitizeReturnTo,
    "signGoogleUserSession",
    ()=>signGoogleUserSession,
    "verifyGoogleUserSession",
    ()=>verifyGoogleUserSession
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$sign$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/jose/dist/webapi/jwt/sign.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$verify$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/jose/dist/webapi/jwt/verify.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$integrations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/lib/integrations.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/lib/auth.ts [app-route] (ecmascript)");
;
;
;
;
const GOOGLE_OAUTH_STATE_COOKIE = 'google_oauth_state';
const GOOGLE_OAUTH_RETURN_COOKIE = 'google_oauth_return_to';
const GOOGLE_USER_COOKIE = 'google_user_session';
const GOOGLE_USER_SESSION_MAX_AGE = 60 * 60 * 24 * 365 * 10;
const localGoogleSessionSecret = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].randomBytes(32).toString('hex');
function normalizeBaseUrl(value) {
    const normalizedValue = value.trim().replace(/\/+$/, '');
    if (!normalizedValue) {
        return '';
    }
    try {
        const url = new URL(normalizedValue);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            return '';
        }
        url.hostname = normalizeHostname(url.hostname);
        return url.toString().replace(/\/+$/, '');
    } catch  {
        return '';
    }
}
function getConfiguredSiteUrl() {
    const candidates = [
        process.env.GOOGLE_PUBLIC_BASE_URL,
        process.env.SITE_URL,
        ("TURBOPACK compile-time value", "https://galantesjewelry.com")
    ];
    for (const candidate of candidates){
        const normalized = normalizeBaseUrl(candidate || '');
        if (!normalized) {
            continue;
        }
        return normalized;
    }
    return '';
}
function isLoopbackHostname(hostname) {
    return [
        'localhost',
        '127.0.0.1',
        '[::1]',
        '0.0.0.0',
        '::',
        '[::]'
    ].includes(hostname);
}
function normalizeHostname(hostname) {
    const normalized = hostname.trim().toLowerCase();
    if (normalized === '0.0.0.0' || normalized === '::' || normalized === '[::]') {
        return 'localhost';
    }
    return normalized;
}
function normalizeHostWithPort(host) {
    const trimmed = host.trim();
    if (!trimmed) {
        return '';
    }
    const ipv6LoopbackMatch = trimmed.match(/^\[(::|::1)\](?::(\d+))?$/i);
    if (ipv6LoopbackMatch) {
        const [, , port] = ipv6LoopbackMatch;
        return port ? `localhost:${port}` : 'localhost';
    }
    const [hostname, ...rest] = trimmed.split(':');
    const normalizedHostname = normalizeHostname(hostname);
    const port = rest.join(':');
    return port ? `${normalizedHostname}:${port}` : normalizedHostname;
}
function getGoogleSessionKey() {
    const secret = process.env.GOOGLE_SESSION_SECRET || process.env.ADMIN_SECRET_KEY || localGoogleSessionSecret;
    return new TextEncoder().encode(secret);
}
function resolveGoogleEnvironmentFromHost(host) {
    const normalizedHost = normalizeHostname(host.split(':')[0] || '');
    if (isLoopbackHostname(normalizedHost)) {
        return 'development';
    }
    if (normalizedHost.startsWith('staging.')) {
        return 'staging';
    }
    return 'production';
}
function sanitizeReturnTo(value) {
    if (!value || !value.startsWith('/') || value.startsWith('//')) {
        return '/';
    }
    return value;
}
function getPublicBaseUrl(request) {
    const siteUrl = getConfiguredSiteUrl();
    if (siteUrl) {
        return siteUrl;
    }
    const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
    const host = normalizeHostWithPort(forwardedHost || request.headers.get('host') || '');
    if (host) {
        const isLocal = host.startsWith('localhost') || host.startsWith('127.0.0.1');
        const protocol = isLocal ? 'http' : 'https';
        return `${protocol}://${host}`;
    }
    const isProd = ("TURBOPACK compile-time value", "development") === 'production';
    return ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : 'http://localhost:3000';
}
function getRequestBaseUrl(request) {
    const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
    const host = normalizeHostWithPort(forwardedHost || request.headers.get('host') || '');
    const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
    if (host) {
        const protocol = host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : forwardedProto;
        return `${protocol}://${host}`;
    }
    if (request.url) {
        try {
            const normalized = normalizeBaseUrl(new URL(request.url).origin);
            if (normalized) {
                return normalized;
            }
        } catch  {
        // Fall through to the canonical public base URL.
        }
    }
    const siteUrl = getConfiguredSiteUrl();
    if (siteUrl) {
        return siteUrl;
    }
    return getPublicBaseUrl(request);
}
function getPublicUrl(pathname, request) {
    const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
    return new URL(normalizedPath, getPublicBaseUrl(request)).toString();
}
function getRequestUrl(pathname, request) {
    const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
    return new URL(normalizedPath, getRequestBaseUrl(request)).toString();
}
function getGoogleRedirectBaseUrl(redirectUri, request) {
    const normalizedRedirectUri = redirectUri?.trim();
    if (normalizedRedirectUri) {
        try {
            return new URL(normalizedRedirectUri).origin;
        } catch  {
        // Fall through to the canonical public base URL.
        }
    }
    return getPublicBaseUrl(request);
}
function getGoogleOAuthCookieOptions(request, maxAge = 600) {
    const isProd = ("TURBOPACK compile-time value", "development") === 'production' || !request.headers.get('host')?.includes('localhost');
    return {
        httpOnly: true,
        maxAge,
        path: '/',
        // Use none for OAuth to survive redirects from Google, but requires Secure
        sameSite: isProd ? 'none' : 'lax',
        secure: isProd ? true : (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["shouldUseSecureCookies"])(request)
    };
}
function getExpiredGoogleOAuthCookieOptions(request) {
    return {
        ...getGoogleOAuthCookieOptions(request, 0),
        expires: new Date(0),
        maxAge: 0
    };
}
function getGoogleUserCookieOptions(request) {
    return {
        httpOnly: true,
        maxAge: GOOGLE_USER_SESSION_MAX_AGE,
        path: '/',
        sameSite: 'lax',
        secure: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["shouldUseSecureCookies"])(request)
    };
}
async function getGoogleLoginConfig(request) {
    const environment = resolveGoogleEnvironmentFromHost(request.headers.get('host') || '');
    const rawStored = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$integrations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getGoogleIntegrationForEnvironment"])(environment);
    const publicBaseUrl = getPublicBaseUrl(request);
    const requestRedirectUri = getRequestUrl('/auth/google/callback', request);
    let stored = rawStored;
    let storedClientSecret = '';
    try {
        const decryptedStored = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$integrations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDecryptedGoogleIntegration"])(environment);
        stored = decryptedStored;
        storedClientSecret = decryptedStored.secrets.googleClientSecret || '';
    } catch (error) {
        console.warn('[Google OAuth] Stored Google secret could not be decrypted; using environment fallback.', error);
    }
    return {
        environment,
        enabled: stored.enabled,
        clientId: stored.googleClientId || process.env.GOOGLE_OAUTH_CLIENT_ID || process.env.CLIENT_ID || '',
        clientSecret: storedClientSecret || process.env.GOOGLE_OAUTH_CLIENT_SECRET || process.env.CLIENT_SECRET || '',
        redirectUri: stored.redirectUri || process.env.GOOGLE_OAUTH_REDIRECT_URI || process.env.REDIRECT_URI || requestRedirectUri,
        javascriptOrigin: stored.javascriptOrigin || process.env.GOOGLE_OAUTH_JAVASCRIPT_ORIGIN || publicBaseUrl,
        scopes: stored.scopes.length > 0 ? stored.scopes : (process.env.GOOGLE_OAUTH_SCOPES || 'openid email profile').split(/[\s,]+/).filter(Boolean)
    };
}
function assertGoogleLoginConfig(config) {
    const missingFields = [
        !config.clientId ? 'GOOGLE_CLIENT_ID' : '',
        !config.clientSecret ? 'GOOGLE_CLIENT_SECRET' : '',
        !config.redirectUri ? 'GOOGLE_REDIRECT_URI' : ''
    ].filter(Boolean);
    if (missingFields.length > 0) {
        throw new Error(`Google OAuth is missing: ${missingFields.join(', ')}`);
    }
}
async function signGoogleUserSession(payload) {
    return await new __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$sign$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SignJWT"](payload).setProtectedHeader({
        alg: 'HS256'
    }).setIssuedAt().sign(getGoogleSessionKey());
}
async function verifyGoogleUserSession(token) {
    try {
        const { payload } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$verify$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jwtVerify"])(token, getGoogleSessionKey());
        return payload;
    } catch  {
        return null;
    }
}
}),
"[project]/Galantesjewelry/lib/google-oauth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GOOGLE_ADMIN_OAUTH_SCOPES",
    ()=>GOOGLE_ADMIN_OAUTH_SCOPES,
    "assertGoogleOAuthRuntimeConfig",
    ()=>assertGoogleOAuthRuntimeConfig,
    "exchangeGoogleOAuthCode",
    ()=>exchangeGoogleOAuthCode,
    "getAdminGoogleOAuthRedirectUri",
    ()=>getAdminGoogleOAuthRedirectUri,
    "getGoogleOAuthEmail",
    ()=>getGoogleOAuthEmail,
    "getGoogleOAuthRuntimeConfig",
    ()=>getGoogleOAuthRuntimeConfig,
    "refreshGoogleOAuthAccessToken",
    ()=>refreshGoogleOAuthAccessToken
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$integrations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/lib/integrations.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$google$2d$login$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/lib/google-login.ts [app-route] (ecmascript)");
;
;
const GOOGLE_ADMIN_OAUTH_SCOPES = [
    'openid',
    'email',
    'profile',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/gmail.send'
];
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
function getAdminGoogleOAuthRedirectUri(request) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$google$2d$login$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getRequestUrl"])('/api/admin/google/oauth/callback', request);
}
async function getGoogleOAuthRuntimeConfig(environment) {
    const stored = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$integrations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDecryptedGoogleIntegration"])(environment);
    return {
        environment,
        clientId: stored.googleClientId || process.env.GOOGLE_OAUTH_CLIENT_ID || process.env.CLIENT_ID || '',
        clientSecret: stored.secrets.googleClientSecret || process.env.GOOGLE_OAUTH_CLIENT_SECRET || process.env.CLIENT_SECRET || '',
        refreshToken: stored.secrets.refreshToken || process.env.GOOGLE_OAUTH_REFRESH_TOKEN || '',
        accessToken: stored.secrets.accessToken || '',
        connectedGoogleEmail: stored.connectedGoogleEmail || ''
    };
}
function assertGoogleOAuthRuntimeConfig(config) {
    const missing = [
        !config.clientId ? 'Google OAuth Client ID' : '',
        !config.clientSecret ? 'Google OAuth Client Secret' : '',
        !config.refreshToken ? 'Google OAuth refresh token' : ''
    ].filter(Boolean);
    if (missing.length > 0) {
        console.warn(`[Google OAuth] Configuration is incomplete: ${missing.join(', ')}. Calendar and Gmail features will be disabled.`);
        return false;
    }
    return true;
}
async function refreshGoogleOAuthAccessToken(config) {
    if (!assertGoogleOAuthRuntimeConfig(config)) {
        throw new Error('Google OAuth is not configured. Please connect your account in the admin panel.');
    }
    const response = await fetch(GOOGLE_TOKEN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            client_id: config.clientId,
            client_secret: config.clientSecret,
            refresh_token: config.refreshToken,
            grant_type: 'refresh_token'
        }),
        cache: 'no-store'
    });
    const payload = await response.json();
    if (!response.ok || !payload.access_token) {
        throw new Error(payload.error_description || payload.error || 'Google OAuth token refresh failed.');
    }
    return payload.access_token;
}
async function exchangeGoogleOAuthCode(input) {
    const response = await fetch(GOOGLE_TOKEN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            code: input.code,
            client_id: input.clientId,
            client_secret: input.clientSecret,
            redirect_uri: input.redirectUri,
            grant_type: 'authorization_code'
        }),
        cache: 'no-store'
    });
    const payload = await response.json();
    if (!response.ok || payload.error || !payload.access_token) {
        throw new Error(payload.error_description || payload.error || 'Google OAuth token exchange failed.');
    }
    return payload;
}
async function getGoogleOAuthEmail(accessToken) {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
            Authorization: `Bearer ${accessToken}`
        },
        cache: 'no-store'
    });
    const payload = await response.json();
    if (!response.ok || payload.error || !payload.email) {
        throw new Error(payload.error || 'Could not read the connected Google email.');
    }
    if (payload.verified_email === false) {
        throw new Error('Connected Google email is not verified.');
    }
    return payload.email;
}
}),
"[project]/Galantesjewelry/lib/google-calendar.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildCalendarEventSummary",
    ()=>buildCalendarEventSummary,
    "createCalendarEvent",
    ()=>createCalendarEvent,
    "getCalendarRuntimeConfig",
    ()=>getCalendarRuntimeConfig,
    "isCalendarSlotAvailable",
    ()=>isCalendarSlotAvailable,
    "testCalendarConnection",
    ()=>testCalendarConnection
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$googleapis__$5b$external$5d$__$28$googleapis$2c$__cjs$2c$__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$googleapis$29$__ = __turbopack_context__.i("[externals]/googleapis [external] (googleapis, cjs, [project]/Galantesjewelry/node_modules/googleapis)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$google$2d$auth$2d$library__$5b$external$5d$__$28$google$2d$auth$2d$library$2c$__cjs$2c$__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$google$2d$auth$2d$library$29$__ = __turbopack_context__.i("[externals]/google-auth-library [external] (google-auth-library, cjs, [project]/Galantesjewelry/node_modules/google-auth-library)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$integrations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/lib/integrations.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$google$2d$oauth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/lib/google-oauth.ts [app-route] (ecmascript)");
;
;
;
;
const GOOGLE_CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar';
// Cache TTL: 45 min for OAuth (refresh tokens revoked/rotated), 4 h for JWT service accounts
const OAUTH_CACHE_TTL_MS = 45 * 60 * 1000;
const JWT_CACHE_TTL_MS = 4 * 60 * 60 * 1000;
const authClientCache = new Map();
function normalizePrivateKey(value) {
    return value.replace(/\\n/g, '\n').trim();
}
async function getCalendarRuntimeConfig(environment) {
    const stored = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$integrations$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDecryptedAppointmentIntegration"])(environment);
    const googleOAuth = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$google$2d$oauth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getGoogleOAuthRuntimeConfig"])(environment);
    const isTestMode = getAppointmentTestMode() === 'true';
    return {
        environment,
        enabled: isTestMode || stored.googleCalendarEnabled,
        calendarId: stored.googleCalendarId || process.env.GOOGLE_CALENDAR_ID || 'primary',
        serviceAccountEmail: stored.googleServiceAccountEmail || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '',
        privateKey: normalizePrivateKey(stored.secrets.googlePrivateKey || process.env.GOOGLE_PRIVATE_KEY || ''),
        oauthClientId: googleOAuth.clientId,
        oauthClientSecret: googleOAuth.clientSecret,
        oauthRefreshToken: googleOAuth.refreshToken,
        oauthConnectedGoogleEmail: googleOAuth.connectedGoogleEmail,
        timezone: stored.appointmentTimezone || 'America/New_York',
        durationMinutes: stored.appointmentDurationMinutes || 60,
        startTime: stored.appointmentStartTime || '09:00',
        endTime: stored.appointmentEndTime || '18:00',
        slotIntervalMinutes: stored.appointmentSlotIntervalMinutes || 30,
        availableWeekdays: stored.appointmentAvailableWeekdays?.length ? stored.appointmentAvailableWeekdays : [
            0,
            1,
            2,
            3,
            4,
            5,
            6
        ]
    };
}
function hasServiceAccountConfig(config) {
    return Boolean(config.serviceAccountEmail && config.privateKey);
}
function hasGoogleOAuthConfig(config) {
    return Boolean(config.oauthClientId && config.oauthClientSecret && config.oauthRefreshToken);
}
function assertCalendarConfig(config) {
    if (getAppointmentTestMode()) {
        return true;
    }
    const missing = [
        !config.enabled ? 'Google Calendar integration is disabled' : '',
        !config.calendarId ? 'Google Calendar ID' : '',
        !hasServiceAccountConfig(config) && !hasGoogleOAuthConfig(config) ? 'Google service account credentials or connected Google OAuth account' : ''
    ].filter(Boolean);
    if (missing.length > 0) {
        console.warn(`[Google Calendar] Configuration is incomplete: ${missing.join(', ')}. Calendar sync will be disabled.`);
        return false;
    }
    return true;
}
function shouldUseLocalCalendarFallback(config) {
    return !config.enabled || !config.calendarId || !hasServiceAccountConfig(config) && !hasGoogleOAuthConfig(config);
}
function isRecoverableCalendarError(error) {
    const message = calendarApiError(error).toLowerCase();
    return [
        'decoder routines::unsupported',
        'invalid_grant',
        'invalid credentials',
        'unauthorized',
        'unauthenticated',
        'not configured',
        'configuration is incomplete',
        'access denied'
    ].some((fragment)=>message.includes(fragment));
}
function getAppointmentTestMode() {
    return process.env.APPOINTMENT_TEST_MODE || '';
}
function cacheKey(config) {
    if (hasServiceAccountConfig(config)) {
        return `service:${config.serviceAccountEmail}:${config.calendarId}`;
    }
    return `oauth:${config.oauthClientId}:${config.calendarId}`;
}
async function getCalendarAuthClient(config) {
    if (!assertCalendarConfig(config)) {
        throw new Error('Google Calendar is not configured. Please check your settings in the admin panel.');
    }
    const key = cacheKey(config);
    const cached = authClientCache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
        return cached.client;
    }
    // Calendar operations should prefer the service account when it is configured.
    // The service account is the stable operational path for the shared business
    // calendar, while owner OAuth is primarily useful for Gmail API delivery and
    // as a fallback when no service account exists.
    if (hasServiceAccountConfig(config)) {
        const jwtClient = new __TURBOPACK__imported__module__$5b$externals$5d2f$google$2d$auth$2d$library__$5b$external$5d$__$28$google$2d$auth$2d$library$2c$__cjs$2c$__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$google$2d$auth$2d$library$29$__["JWT"]({
            email: config.serviceAccountEmail,
            key: config.privateKey,
            scopes: [
                GOOGLE_CALENDAR_SCOPE
            ]
        });
        await jwtClient.authorize();
        authClientCache.set(key, {
            client: jwtClient,
            expiresAt: Date.now() + JWT_CACHE_TTL_MS
        });
        return jwtClient;
    }
    if (hasGoogleOAuthConfig(config)) {
        const oauth2Client = new __TURBOPACK__imported__module__$5b$externals$5d2f$google$2d$auth$2d$library__$5b$external$5d$__$28$google$2d$auth$2d$library$2c$__cjs$2c$__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$google$2d$auth$2d$library$29$__["OAuth2Client"](config.oauthClientId, config.oauthClientSecret);
        oauth2Client.setCredentials({
            refresh_token: config.oauthRefreshToken
        });
        // Verify token integrity before the transaction. google-auth-library refreshes expired access tokens automatically.
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$google$2d$oauth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["refreshGoogleOAuthAccessToken"])({
                environment: config.environment,
                clientId: config.oauthClientId,
                clientSecret: config.oauthClientSecret,
                refreshToken: config.oauthRefreshToken,
                accessToken: '',
                connectedGoogleEmail: config.oauthConnectedGoogleEmail
            });
        } catch (err) {
            // Evict any stale cache entry so the next request retries fresh
            authClientCache.delete(key);
            throw err;
        }
        authClientCache.set(key, {
            client: oauth2Client,
            expiresAt: Date.now() + OAUTH_CACHE_TTL_MS
        });
        return oauth2Client;
    }
    throw new Error('Google Calendar is not configured. Please check your settings in the admin panel.');
}
async function getCalendarClient(config) {
    const auth = await getCalendarAuthClient(config);
    return __TURBOPACK__imported__module__$5b$externals$5d2f$googleapis__$5b$external$5d$__$28$googleapis$2c$__cjs$2c$__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$googleapis$29$__["google"].calendar({
        version: 'v3',
        auth
    });
}
function calendarApiError(error) {
    if (error && typeof error === 'object' && 'message' in error) {
        return String(error.message || 'Google Calendar API request failed.');
    }
    return 'Google Calendar API request failed.';
}
async function isCalendarSlotAvailable(input) {
    const testMode = getAppointmentTestMode();
    if (testMode === 'conflict') {
        return false;
    }
    if (testMode === 'calendar_error') {
        throw new Error('Mock Google Calendar failure.');
    }
    if (testMode) {
        return true;
    }
    if (shouldUseLocalCalendarFallback(input.config)) {
        console.warn('[Google Calendar] Falling back to local schedule availability because Google Calendar credentials are missing.');
        return true;
    }
    try {
        const calendar = await getCalendarClient(input.config);
        const response = await calendar.freebusy.query({
            requestBody: {
                timeMin: input.start.toISOString(),
                timeMax: input.end.toISOString(),
                timeZone: input.config.timezone,
                items: [
                    {
                        id: input.config.calendarId
                    }
                ]
            }
        });
        const busy = response.data.calendars?.[input.config.calendarId]?.busy || [];
        return busy.length === 0;
    } catch (error) {
        if (isRecoverableCalendarError(error)) {
            console.warn('[Google Calendar] Availability check fell back to local schedule:', calendarApiError(error));
            return true;
        }
        throw new Error(calendarApiError(error));
    }
}
function buildCalendarEventSummary(submission) {
    const type = (submission.inquiryType || '').trim().replace(/\s+/g, ' ');
    const name = (submission.name || '').trim().replace(/\s+/g, ' ');
    if (!type && !name) return 'Jewelry Appointment';
    if (!type) return name;
    if (!name) return type;
    return `${type} - ${name}`;
}
async function createCalendarEvent(input) {
    if (getAppointmentTestMode()) {
        return {
            id: `mock-event-${input.record.id}`,
            htmlLink: `https://calendar.google.com/calendar/event?eid=${input.record.id}`
        };
    }
    if (shouldUseLocalCalendarFallback(input.config)) {
        console.warn('[Google Calendar] Falling back to a synthetic calendar event because Google Calendar credentials are missing.');
        return {
            id: `local-event-${input.record.id}`,
            htmlLink: `https://calendar.google.com/calendar/event?eid=${input.record.id}`
        };
    }
    const { record, submission } = input;
    const usesServiceAccount = hasServiceAccountConfig(input.config);
    const phoneLine = submission.phone ? `Phone: ${submission.phone}\n` : '';
    const event = {
        summary: `${record.id} - ${submission.name}`,
        description: [
            `Galantes Jewelry appointment request`,
            `Appointment ID: ${record.id}`,
            `Name: ${submission.name}`,
            `Email: ${submission.email}`,
            phoneLine.trim(),
            `Inquiry type: ${submission.inquiryType}`,
            `Requested date: ${submission.appointmentDate}`,
            `Requested time: ${submission.appointmentTime}`,
            `Timezone: ${record.timezone}`,
            '',
            'Message:',
            submission.message
        ].filter(Boolean).join('\n'),
        start: {
            dateTime: input.start.toISOString(),
            timeZone: input.config.timezone
        },
        end: {
            dateTime: input.end.toISOString(),
            timeZone: input.config.timezone
        },
        reminders: {
            useDefault: false,
            overrides: [
                {
                    method: 'email',
                    minutes: 24 * 60
                },
                {
                    method: 'popup',
                    minutes: 30
                }
            ]
        },
        extendedProperties: {
            private: {
                galantesAppointmentId: record.id,
                inquiryType: submission.inquiryType,
                customerEmail: submission.email
            }
        }
    };
    if (!usesServiceAccount) {
        // Google blocks attendee invites from service accounts unless the tenant is
        // configured with domain-wide delegation. Customer/owner notifications are
        // handled by the app mailer, so only OAuth-backed owner calendars should
        // send Google attendee invites directly.
        event.attendees = [
            {
                email: 'ceo@galantesjewelry.com',
                displayName: 'Galantes CEO',
                responseStatus: 'accepted'
            },
            {
                email: submission.email,
                displayName: submission.name,
                responseStatus: 'needsAction'
            }
        ];
    }
    try {
        const calendar = await getCalendarClient(input.config);
        const response = await calendar.events.insert({
            calendarId: input.config.calendarId || 'primary',
            requestBody: event,
            sendUpdates: usesServiceAccount ? 'none' : 'all'
        });
        return {
            id: response.data.id || '',
            htmlLink: response.data.htmlLink || ''
        };
    } catch (error) {
        if (isRecoverableCalendarError(error)) {
            console.warn('[Google Calendar] Event creation fell back to a synthetic calendar event:', calendarApiError(error));
            return {
                id: `local-event-${input.record.id}`,
                htmlLink: `https://calendar.google.com/calendar/event?eid=${input.record.id}`
            };
        }
        throw new Error(calendarApiError(error));
    }
}
async function testCalendarConnection(environment) {
    const config = await getCalendarRuntimeConfig(environment);
    if (getAppointmentTestMode()) {
        return {
            calendarId: config.calendarId || 'mock-calendar',
            timezone: config.timezone,
            durationMinutes: config.durationMinutes
        };
    }
    if (shouldUseLocalCalendarFallback(config)) {
        console.warn('[Google Calendar] Connection test fell back to local schedule because Google Calendar credentials are missing.');
        return {
            calendarId: config.calendarId || 'mock-calendar',
            timezone: config.timezone,
            durationMinutes: config.durationMinutes
        };
    }
    const now = new Date();
    const later = new Date(now.getTime() + 15 * 60 * 1000);
    try {
        const calendar = await getCalendarClient(config);
        await calendar.freebusy.query({
            requestBody: {
                timeMin: now.toISOString(),
                timeMax: later.toISOString(),
                timeZone: config.timezone,
                items: [
                    {
                        id: config.calendarId
                    }
                ]
            }
        });
    } catch (error) {
        if (isRecoverableCalendarError(error)) {
            console.warn('[Google Calendar] Connection test fell back to local schedule:', calendarApiError(error));
            return {
                calendarId: config.calendarId || 'mock-calendar',
                timezone: config.timezone,
                durationMinutes: config.durationMinutes
            };
        }
        throw new Error(calendarApiError(error));
    }
    return {
        calendarId: config.calendarId,
        timezone: config.timezone,
        durationMinutes: config.durationMinutes
    };
}
}),
"[project]/Galantesjewelry/app/api/contact/availability/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "runtime",
    ()=>runtime
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$appointments$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/lib/appointments.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$appointment$2d$schedule$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/lib/appointment-schedule.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$google$2d$calendar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/lib/google-calendar.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$google$2d$login$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/lib/google-login.ts [app-route] (ecmascript)");
;
;
;
;
;
;
const runtime = 'nodejs';
const availabilitySchema = __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    appointmentDate: __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    appointmentTime: __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().regex(/^\d{2}:\d{2}$/).optional()
});
async function hasLocalAppointmentConflict(appointmentDate, appointmentTime) {
    const records = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$appointments$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["listAppointmentRecords"])({
        limit: 1000
    });
    return records.some((record)=>record.appointmentDate === appointmentDate && record.appointmentTime === appointmentTime && record.status !== 'validation_failed' && record.status !== 'calendar_failed');
}
async function GET(request) {
    try {
        const url = new URL(request.url);
        const appointmentDate = url.searchParams.get('appointmentDate') || undefined;
        const appointmentTime = url.searchParams.get('appointmentTime') || undefined;
        if (appointmentTime && !appointmentDate) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'An appointment date is required when checking a specific time.'
            }, {
                status: 400
            });
        }
        const payload = availabilitySchema.parse({
            appointmentDate,
            appointmentTime
        });
        const environment = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$google$2d$login$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveGoogleEnvironmentFromHost"])(request.headers.get('host') || '');
        const calendarConfig = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$google$2d$calendar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCalendarRuntimeConfig"])(environment);
        if (!payload.appointmentDate) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                availableSlots: [],
                timezone: calendarConfig.timezone,
                durationMinutes: calendarConfig.durationMinutes,
                startTime: calendarConfig.startTime,
                endTime: calendarConfig.endTime,
                slotIntervalMinutes: calendarConfig.slotIntervalMinutes,
                availableWeekdays: calendarConfig.availableWeekdays,
                conflictBufferMinutes: 5
            });
        }
        if (payload.appointmentTime) {
            if (await hasLocalAppointmentConflict(payload.appointmentDate, payload.appointmentTime)) {
                return __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                    available: false,
                    timezone: calendarConfig.timezone,
                    durationMinutes: calendarConfig.durationMinutes,
                    startTime: calendarConfig.startTime,
                    endTime: calendarConfig.endTime,
                    slotIntervalMinutes: calendarConfig.slotIntervalMinutes,
                    availableWeekdays: calendarConfig.availableWeekdays,
                    conflictBufferMinutes: 5
                });
            }
            const { start, end } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$appointments$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildAppointmentInterval"])({
                appointmentDate: payload.appointmentDate,
                appointmentTime: payload.appointmentTime,
                timezone: calendarConfig.timezone,
                durationMinutes: calendarConfig.durationMinutes
            });
            const available = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$google$2d$calendar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isCalendarSlotAvailable"])({
                config: calendarConfig,
                start,
                end
            });
            return __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                available,
                timezone: calendarConfig.timezone,
                durationMinutes: calendarConfig.durationMinutes,
                startTime: calendarConfig.startTime,
                endTime: calendarConfig.endTime,
                slotIntervalMinutes: calendarConfig.slotIntervalMinutes,
                availableWeekdays: calendarConfig.availableWeekdays,
                conflictBufferMinutes: 5
            });
        }
        const scheduleSlots = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$appointment$2d$schedule$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["listScheduleSlotsForDate"])(payload.appointmentDate, calendarConfig);
        const availableSlots = [];
        for (const slot of scheduleSlots){
            let start;
            let end;
            try {
                ({ start, end } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$appointments$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildAppointmentInterval"])({
                    appointmentDate: payload.appointmentDate,
                    appointmentTime: slot.time,
                    timezone: calendarConfig.timezone,
                    durationMinutes: calendarConfig.durationMinutes
                }));
            } catch (error) {
                const message = error instanceof Error ? error.message : '';
                if (message === 'Please select a future appointment time.') {
                    continue;
                }
                throw error;
            }
            if (await hasLocalAppointmentConflict(payload.appointmentDate, slot.time)) {
                continue;
            }
            const available = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$google$2d$calendar$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isCalendarSlotAvailable"])({
                config: calendarConfig,
                start,
                end
            });
            if (available) {
                availableSlots.push(slot);
            }
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            availableSlots,
            timezone: calendarConfig.timezone,
            durationMinutes: calendarConfig.durationMinutes,
            startTime: calendarConfig.startTime,
            endTime: calendarConfig.endTime,
            slotIntervalMinutes: calendarConfig.slotIntervalMinutes,
            availableWeekdays: calendarConfig.availableWeekdays,
            conflictBufferMinutes: 5
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Could not check availability.';
        const status = message.includes('not configured') || message.includes('disabled') || message.includes('incomplete') ? 503 : 400;
        return __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: message
        }, {
            status
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0xt6f-~._.js.map