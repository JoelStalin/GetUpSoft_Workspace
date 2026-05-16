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
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[externals]/node:fs/promises [external] (node:fs/promises, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:fs/promises", () => require("node:fs/promises"));

module.exports = mod;
}),
"[externals]/node:path [external] (node:path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:path", () => require("node:path"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

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
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/fs/promises [external] (fs/promises, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs/promises", () => require("fs/promises"));

module.exports = mod;
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
"[project]/Galantesjewelry/lib/customer-auth.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CUSTOMER_SESSION_COOKIE",
    ()=>CUSTOMER_SESSION_COOKIE,
    "CUSTOMER_SESSION_MAX_AGE",
    ()=>CUSTOMER_SESSION_MAX_AGE,
    "authenticateCustomerAccount",
    ()=>authenticateCustomerAccount,
    "getAuthenticatedCustomerFromCookies",
    ()=>getAuthenticatedCustomerFromCookies,
    "getAuthenticatedCustomerFromRequest",
    ()=>getAuthenticatedCustomerFromRequest,
    "getCustomerAccountByEmail",
    ()=>getCustomerAccountByEmail,
    "getCustomerSessionCookieOptions",
    ()=>getCustomerSessionCookieOptions,
    "getExpiredCustomerSessionCookieOptions",
    ()=>getExpiredCustomerSessionCookieOptions,
    "hashCustomerPassword",
    ()=>hashCustomerPassword,
    "registerCustomerAccount",
    ()=>registerCustomerAccount,
    "sanitizeCustomerIdentifier",
    ()=>sanitizeCustomerIdentifier,
    "signCustomerSession",
    ()=>signCustomerSession,
    "validateCustomerPassword",
    ()=>validateCustomerPassword,
    "verifyCustomerEmailToken",
    ()=>verifyCustomerEmailToken,
    "verifyCustomerPassword",
    ()=>verifyCustomerPassword,
    "verifyCustomerSession",
    ()=>verifyCustomerSession
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:crypto [external] (node:crypto, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs/promises [external] (node:fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$sign$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/jose/dist/webapi/jwt/sign.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$verify$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/jose/dist/webapi/jwt/verify.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$runtime$2d$paths$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/lib/runtime-paths.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/lib/auth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$google$2d$login$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/lib/google-login.ts [app-route] (ecmascript)");
;
;
;
;
;
;
;
const CUSTOMER_SESSION_COOKIE = 'customer_session';
const CUSTOMER_SESSION_MAX_AGE = __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$google$2d$login$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GOOGLE_USER_SESSION_MAX_AGE"];
const customerAuthFile = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join((0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$runtime$2d$paths$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDataRoot"])(), 'customer-auth.json');
const CUSTOMER_SESSION_FALLBACK_SECRET = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].randomBytes(32).toString('hex');
function normalizeValue(value) {
    return value.trim().toLowerCase();
}
function normalizeName(value) {
    return value.trim().replace(/\s+/g, ' ');
}
function getCustomerSessionKey() {
    return new TextEncoder().encode(process.env.CUSTOMER_SESSION_SECRET || process.env.GOOGLE_SESSION_SECRET || process.env.ADMIN_SECRET_KEY || CUSTOMER_SESSION_FALLBACK_SECRET);
}
function getPasswordSalt() {
    return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].randomBytes(16).toString('hex');
}
function hashPassword(password, salt = getPasswordSalt()) {
    return `${salt}:${__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].scryptSync(password, salt, 64).toString('hex')}`;
}
function verifyPassword(password, storedHash) {
    const [salt, digest] = storedHash.split(':');
    if (!salt || !digest) {
        return false;
    }
    const computed = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].scryptSync(password, salt, 64).toString('hex');
    return __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$crypto__$5b$external$5d$__$28$node$3a$crypto$2c$__cjs$29$__["default"].timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(digest, 'hex'));
}
function emptyStore() {
    return {
        customers: []
    };
}
async function readStore() {
    try {
        const content = await __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["default"].readFile(customerAuthFile, 'utf8');
        const parsed = JSON.parse(content);
        return {
            customers: Array.isArray(parsed.customers) ? parsed.customers : []
        };
    } catch  {
        return emptyStore();
    }
}
async function writeStore(store) {
    await __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["default"].mkdir(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].dirname(customerAuthFile), {
        recursive: true
    });
    await __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["default"].writeFile(customerAuthFile, JSON.stringify(store, null, 2), 'utf8');
}
function toAuthenticatedCustomer(record) {
    return {
        authMethod: 'password',
        email: record.email,
        name: record.name,
        username: record.username
    };
}
function toSessionPayload(customer) {
    return {
        sub: customer.email,
        email: customer.email,
        name: customer.name,
        username: customer.username,
        authMethod: customer.authMethod
    };
}
function sanitizeCustomerIdentifier(value) {
    return normalizeValue(value);
}
function validateCustomerPassword(password) {
    return password.trim().length >= 8;
}
function hashCustomerPassword(password) {
    return hashPassword(password);
}
function verifyCustomerPassword(password, storedHash) {
    return verifyPassword(password, storedHash);
}
async function registerCustomerAccount(input) {
    const username = normalizeValue(input.username);
    const email = normalizeValue(input.email);
    const name = normalizeName(input.name);
    if (!username || !email || !name) {
        throw new Error('Username, name, and email are required.');
    }
    if (!validateCustomerPassword(input.password)) {
        throw new Error('Password must be at least 8 characters long.');
    }
    const store = await readStore();
    const now = new Date().toISOString();
    const existingByUsername = store.customers.find((customer)=>normalizeValue(customer.username) === username);
    const existingByEmail = store.customers.find((customer)=>normalizeValue(customer.email) === email);
    if (existingByUsername && existingByEmail && existingByUsername !== existingByEmail) {
        throw new Error('Username and email already belong to different accounts.');
    }
    const existing = existingByUsername || existingByEmail;
    if (existing) {
        if (existingByUsername && normalizeValue(existing.email) !== email) {
            throw new Error('That username is already in use.');
        }
        if (existingByEmail && existingByUsername && existingByEmail.username && normalizeValue(existingByEmail.username) !== username) {
            throw new Error('That email is already linked to a different username.');
        }
        existing.username = username || existing.username;
        existing.email = email;
        existing.name = name;
        existing.passwordHash = hashCustomerPassword(input.password);
        existing.updatedAt = now;
        existing.lastLoginAt = now;
        await writeStore(store);
        return toAuthenticatedCustomer(existing);
    }
    const record = {
        username,
        name,
        email,
        passwordHash: hashCustomerPassword(input.password),
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now
    };
    store.customers.unshift(record);
    await writeStore(store);
    return toAuthenticatedCustomer(record);
}
async function authenticateCustomerAccount(identifier, password) {
    const normalizedIdentifier = normalizeValue(identifier);
    if (!normalizedIdentifier) {
        throw new Error('Username or email is required.');
    }
    if (!password) {
        throw new Error('Password is required.');
    }
    const store = await readStore();
    const customer = store.customers.find((record)=>normalizeValue(record.username) === normalizedIdentifier || normalizeValue(record.email) === normalizedIdentifier);
    if (!customer || !verifyPassword(password, customer.passwordHash)) {
        throw new Error('Invalid username/email or password.');
    }
    customer.lastLoginAt = new Date().toISOString();
    customer.updatedAt = customer.lastLoginAt;
    await writeStore(store);
    return toAuthenticatedCustomer(customer);
}
async function signCustomerSession(customer) {
    const expiresAt = new Date(Date.now() + CUSTOMER_SESSION_MAX_AGE * 1000);
    return await new __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$sign$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SignJWT"](toSessionPayload(customer)).setProtectedHeader({
        alg: 'HS256'
    }).setIssuedAt().setExpirationTime(expiresAt).sign(getCustomerSessionKey());
}
async function verifyCustomerSession(token) {
    try {
        const { payload } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$jose$2f$dist$2f$webapi$2f$jwt$2f$verify$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["jwtVerify"])(token, getCustomerSessionKey());
        const session = payload;
        if (!session.email || !session.authMethod) {
            return null;
        }
        return {
            authMethod: session.authMethod,
            email: session.email,
            name: session.name,
            username: session.username
        };
    } catch  {
        return null;
    }
}
async function verifyCustomerEmailToken(token) {
    const session = await verifyCustomerSession(token);
    if (!session) {
        throw new Error('Invalid or expired verification token');
    }
    return session;
}
function getCustomerSessionCookieOptions(request) {
    return {
        httpOnly: true,
        maxAge: CUSTOMER_SESSION_MAX_AGE,
        path: '/',
        sameSite: 'lax',
        secure: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["shouldUseSecureCookies"])(request)
    };
}
function getExpiredCustomerSessionCookieOptions(request) {
    return {
        ...getCustomerSessionCookieOptions(request),
        expires: new Date(0),
        maxAge: 0
    };
}
async function getAuthenticatedCustomerFromCookies(cookieSource) {
    const customerToken = cookieSource.get(CUSTOMER_SESSION_COOKIE)?.value;
    if (customerToken) {
        const localSession = await verifyCustomerSession(customerToken);
        if (localSession) {
            return localSession;
        }
    }
    const googleToken = cookieSource.get(__TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$google$2d$login$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["GOOGLE_USER_COOKIE"])?.value;
    if (googleToken) {
        const googleSession = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$google$2d$login$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["verifyGoogleUserSession"])(googleToken);
        if (googleSession) {
            return {
                authMethod: 'google',
                email: googleSession.email,
                name: googleSession.name
            };
        }
    }
    return null;
}
async function getAuthenticatedCustomerFromRequest(request) {
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) {
        return null;
    }
    const cookieMap = new Map(cookieHeader.split(';').map((chunk)=>{
        const [name, ...rest] = chunk.trim().split('=');
        return [
            name,
            rest.join('=')
        ];
    }));
    return getAuthenticatedCustomerFromCookies({
        get (name) {
            const value = cookieMap.get(name);
            return value ? {
                value
            } : undefined;
        }
    });
}
async function getCustomerAccountByEmail(email) {
    const store = await readStore();
    return store.customers.find((customer)=>normalizeValue(customer.email) === normalizeValue(email)) || null;
}
}),
"[project]/Galantesjewelry/lib/odoo/services.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "OdooService",
    ()=>OdooService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$src$2f$config$2f$odooClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/src/config/odooClient.js [app-route] (ecmascript)");
;
const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$src$2f$config$2f$odooClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createOdooClient"])();
function buildPortalUrl(baseUrl, accessUrl) {
    return accessUrl ? `${baseUrl}${accessUrl}` : null;
}
function buildInvoicePdfUrl(baseUrl, accessUrl, accessToken) {
    if (!accessUrl) return null;
    const separator = accessUrl.includes('?') ? '&' : '?';
    const normalizedToken = accessToken && !accessUrl.includes('access_token=') ? `&access_token=${encodeURIComponent(accessToken)}` : '';
    return `${baseUrl}${accessUrl}${separator}report_type=pdf&download=true${normalizedToken}`;
}
const OdooService = {
    async getCompanySettings () {
        const config = client.getConfig();
        if (!config.enabled || !config.isReady) return {};
        try {
            const cmsSettings = await client.searchRead('galante.cms.settings', {
                domain: [],
                fields: [
                    'site_title',
                    'site_description',
                    'logo_url',
                    'favicon_url',
                    'hero_image_url',
                    'instagram_url',
                    'facebook_url',
                    'whatsapp_number',
                    'contact_email',
                    'contact_phone',
                    'contact_address',
                    'appointment_email',
                    'navigation_json'
                ],
                limit: 1
            });
            if (cmsSettings && cmsSettings.length > 0) {
                const s = cmsSettings[0];
                let navLinks = [];
                try {
                    const parsed = s.navigation_json ? JSON.parse(s.navigation_json) : [];
                    navLinks = Array.isArray(parsed) ? parsed : [];
                } catch (e) {
                    console.error('Failed to parse nav links', e);
                }
                return {
                    site_title: s.site_title ?? undefined,
                    site_description: s.site_description ?? undefined,
                    logo_url: s.logo_url ?? undefined,
                    favicon_url: s.favicon_url ?? undefined,
                    hero_image_url: s.hero_image_url ?? undefined,
                    instagram_url: s.instagram_url ?? undefined,
                    facebook_url: s.facebook_url ?? undefined,
                    whatsapp_number: s.whatsapp_number ?? undefined,
                    contact_email: s.contact_email ?? undefined,
                    contact_phone: s.contact_phone ?? undefined,
                    contact_address: s.contact_address ?? undefined,
                    appointment_email: s.appointment_email ?? undefined,
                    navigation_links: navLinks
                };
            }
            return {};
        } catch  {
            console.warn('[OdooService] Company settings fetch failed, using local CMS data fallback.');
            return {};
        }
    },
    async getPartnerByEmail (email) {
        try {
            const existing = await client.call('res.partner', 'search_read', {
                domain: [
                    [
                        'email',
                        '=',
                        email
                    ]
                ],
                fields: [
                    'id'
                ],
                limit: 1
            });
            return existing && existing.length > 0 ? existing[0].id : null;
        } catch (error) {
            console.warn('[OdooService] Partner search failed:', error instanceof Error ? error.message : 'Unknown error');
            return null;
        }
    },
    async findOrCreateCustomer (data) {
        try {
            const existing = await this.getPartnerByEmail(data.email);
            if (existing) return existing;
            let countryId = data.country_id || 233; // Default to US
            let stateId = data.state_id;
            const countryName = data.country?.trim() || '';
            const isDR = countryName === 'Dominican Republic' || countryName === 'República Dominicana' || countryName === 'Republica Dominicana';
            const isUS = countryName === 'United States';
            if (isDR) {
                countryId = 62;
            } else if (isUS) {
                countryId = 233;
            }
            // Special handling for Florida state ID if name provided but no ID
            if (data.state?.toUpperCase() === 'FL' || data.state?.toLowerCase() === 'florida') {
                stateId = 10;
            }
            return await client.create('res.partner', {
                name: data.name,
                email: data.email,
                phone: data.phone,
                street: data.street,
                city: data.city,
                zip: data.zip,
                state_id: stateId,
                country_id: countryId,
                customer_rank: 1
            });
        } catch (error) {
            console.warn('[OdooService] Partner creation failed:', error instanceof Error ? error.message : 'Unknown error');
            return null;
        }
    },
    async syncCustomerProfile (data) {
        try {
            const partnerId = await this.findOrCreateCustomer(data);
            if (!partnerId) return null;
            const vals = {
                customer_rank: 1,
                galantes_customer_source: data.authMethod || 'unknown',
                galantes_customer_last_auth_at: data.lastAuthAt || new Date().toISOString()
            };
            await client.call('res.partner', 'write', {
                ids: [
                    partnerId
                ],
                vals
            });
            return partnerId;
        } catch (error) {
            console.warn('[OdooService] User profile sync failed:', error instanceof Error ? error.message : 'Unknown error');
            return null;
        }
    },
    async syncAuthenticatedUser (data) {
        return await this.syncCustomerProfile({
            ...data,
            lastAuthAt: new Date().toISOString()
        });
    },
    async createOrder (partnerId, lines) {
        try {
            const lineVals = lines.map((l)=>[
                    0,
                    0,
                    {
                        product_id: l.product_id,
                        product_uom_qty: l.product_uom_qty,
                        price_unit: l.price_unit,
                        ...l.name ? {
                            name: l.name
                        } : {}
                    }
                ]);
            return await client.create('sale.order', {
                partner_id: partnerId,
                order_line: lineVals
            });
        } catch (error) {
            console.error('Odoo Order Creation Error:', error);
            return null;
        }
    },
    async getProductVariantIdByDefaultCode (defaultCode) {
        try {
            const templates = await client.call('product.template', 'search_read', {
                domain: [
                    [
                        'default_code',
                        '=',
                        defaultCode
                    ]
                ],
                fields: [
                    'id',
                    'product_variant_id'
                ],
                limit: 1
            });
            const templateVariant = templates?.[0]?.product_variant_id;
            if (Array.isArray(templateVariant)) {
                return typeof templateVariant[0] === 'number' ? templateVariant[0] : null;
            }
            if (typeof templateVariant === 'number' && Number.isFinite(templateVariant)) {
                return templateVariant;
            }
            const products = await client.call('product.product', 'search_read', {
                domain: [
                    [
                        'default_code',
                        '=',
                        defaultCode
                    ]
                ],
                fields: [
                    'id'
                ],
                limit: 1
            });
            return products && products.length > 0 ? products[0].id : null;
        } catch (error) {
            console.error('Odoo Product Lookup Error:', error);
            return null;
        }
    },
    async automateBillingFlow (orderId, stripeData) {
        try {
            // 1. Fetch current order state
            const orders = await client.call('sale.order', 'read', {
                ids: [
                    orderId
                ],
                fields: [
                    'state',
                    'invoice_status',
                    'invoice_ids',
                    'picking_ids'
                ]
            });
            if (!orders || orders.length === 0) throw new Error('Order not found');
            // 2. Normalize Stripe data for Odoo
            const stripeVals = stripeData ? {
                payment_intent_id: stripeData.paymentIntentId,
                charge_id: stripeData.chargeId || false,
                amount: stripeData.amount,
                currency: stripeData.currency,
                receipt_url: stripeData.receiptUrl,
                customer_email: stripeData.customerEmail,
                payment_status: stripeData.paymentStatus
            } : false;
            // 3. Call Odoo finalization action (custom logic in galantes_jewelry module)
            const result = await client.call('sale.order', 'action_galantes_finalize_paid_checkout', {
                ids: [
                    orderId
                ],
                stripe_payment: stripeVals
            });
            // The action returns a list with the updated order details
            const finalizedOrder = Array.isArray(result) && result.length > 0 ? result[0] : null;
            if (!finalizedOrder || !finalizedOrder.invoice_ids?.length && finalizedOrder.state !== 'cancel') {
                // Log in Odoo if it didn't cancel but also didn't invoice
                if (finalizedOrder?.state !== 'cancel') {
                    await client.call('sale.order', 'message_post', {
                        ids: [
                            orderId
                        ],
                        body: 'Billing finalization completed without creating or linking an invoice.'
                    });
                    throw new Error('Billing finalization completed without creating or linking an invoice.');
                }
            }
            return {
                success: true,
                orderId,
                invoiceId: finalizedOrder?.invoice_ids?.[0] || null,
                pickingIds: finalizedOrder?.picking_ids || [],
                steps: [
                    'confirmed',
                    'finalized'
                ]
            };
        } catch (error) {
            console.error('Odoo Billing Automation Error:', error);
            // Log failure in Odoo chatter
            try {
                await client.call('sale.order', 'message_post', {
                    ids: [
                        orderId
                    ],
                    body: `Billing Automation Failed: ${error instanceof Error ? error.message : String(error)}`
                });
            } catch  {}
            throw error instanceof Error ? error : new Error(String(error));
        }
    },
    async getOrderWithInvoices (orderId) {
        const orders = await client.call('sale.order', 'search_read', {
            domain: [
                [
                    'id',
                    '=',
                    orderId
                ]
            ],
            fields: [
                'name',
                'date_order',
                'state',
                'amount_total',
                'invoice_status',
                'access_url',
                'partner_id',
                'invoice_ids'
            ],
            limit: 1
        });
        if (!orders || orders.length === 0) return null;
        const o = orders[0];
        let baseUrl = process.env.ODOO_BASE_URL || 'http://odoo:8069';
        // Internal container networking fix
        if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
            baseUrl = baseUrl.replace('localhost', 'odoo').replace('127.0.0.1', 'odoo');
        }
        let invoices = [];
        const invoiceIds = o.invoice_ids ?? [];
        if (invoiceIds.length > 0) {
            const invData = await client.call('account.move', 'search_read', {
                domain: [
                    [
                        'id',
                        'in',
                        invoiceIds
                    ]
                ],
                fields: [
                    'name',
                    'invoice_date',
                    'state',
                    'amount_total',
                    'payment_state',
                    'access_url',
                    'access_token'
                ]
            });
            invoices = (invData || []).map((inv)=>({
                    ...inv,
                    display_status: this.mapInvoiceState(inv.state, inv.payment_state),
                    portal_url: buildPortalUrl(baseUrl, inv.access_url),
                    pdf_url: buildInvoicePdfUrl(baseUrl, inv.access_url, inv.access_token)
                }));
        }
        return {
            ...o,
            display_status: this.mapOrderState(o.state, o.invoice_status),
            portal_url: o.access_url ? `${baseUrl}${o.access_url}` : null,
            invoices
        };
    },
    async syncCompanyProfile (settings) {
        try {
            // Prefer the US country record, but fall back to the standard US id so state lookup still runs.
            const countries = await client.call('res.country', 'search_read', {
                domain: [
                    [
                        'code',
                        '=',
                        'US'
                    ]
                ],
                fields: [
                    'id'
                ],
                limit: 1
            });
            const countryId = countries?.[0]?.id || 233;
            // Simple address parsing for Islamorada
            const vals = {
                email: settings.contact_email,
                phone: settings.contact_phone,
                street: settings.contact_address?.split(',')[0]?.trim(),
                city: 'Islamorada',
                zip: '33036',
                country_id: countryId
            };
            if (settings.contact_address) {
                const stateMatch = settings.contact_address.match(/,\s*([A-Z]{2})\s+\d{5}(?:-\d{4})?\s*,/i);
                const stateCode = stateMatch?.[1]?.toUpperCase() || 'FL';
                const states = await client.call('res.country.state', 'search_read', {
                    domain: [
                        [
                            'code',
                            '=',
                            stateCode
                        ],
                        [
                            'country_id',
                            '=',
                            countryId
                        ]
                    ],
                    fields: [
                        'id'
                    ],
                    limit: 1
                });
                if (states?.length > 0) vals.state_id = states[0].id;
            }
            // Write to company 1
            await client.call('res.company', 'write', {
                ids: [
                    1
                ],
                vals
            });
            return true;
        } catch (error) {
            console.error('Company Sync Error:', error);
            return false;
        }
    },
    async getOrderDetails (orderId, authenticatedEmail) {
        try {
            const orders = await client.call('sale.order', 'search_read', {
                domain: [
                    [
                        'id',
                        '=',
                        orderId
                    ]
                ],
                fields: [
                    'name',
                    'date_order',
                    'state',
                    'amount_untaxed',
                    'amount_tax',
                    'amount_total',
                    'invoice_status',
                    'order_line',
                    'access_url',
                    'partner_id'
                ],
                limit: 1
            });
            if (!orders || orders.length === 0) return null;
            const order = orders[0];
            if (authenticatedEmail) {
                const partnerId = await this.getPartnerByEmail(authenticatedEmail);
                const orderPartnerId = Array.isArray(order.partner_id) ? order.partner_id[0] : order.partner_id;
                if (!partnerId || !orderPartnerId || partnerId !== orderPartnerId) {
                    return null;
                }
            }
            let baseUrl = process.env.ODOO_BASE_URL || 'http://odoo:8069';
            // Internal container networking fix
            if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
                baseUrl = baseUrl.replace('localhost', 'odoo').replace('127.0.0.1', 'odoo');
            }
            return {
                ...order,
                display_status: this.mapOrderState(order.state, order.invoice_status),
                portal_url: order.access_url ? `${baseUrl}${order.access_url}` : null
            };
        } catch (error) {
            console.error('Odoo Order Fetch Error:', error);
            return null;
        }
    },
    async getPartnerOrders (partnerId) {
        try {
            const orders = await client.call('sale.order', 'search_read', {
                domain: [
                    [
                        'partner_id',
                        '=',
                        partnerId
                    ]
                ],
                fields: [
                    'id',
                    'name',
                    'date_order',
                    'state',
                    'amount_total',
                    'invoice_status',
                    'access_url',
                    'invoice_ids'
                ],
                order: 'date_order desc'
            });
            let baseUrl = process.env.ODOO_BASE_URL || 'http://odoo:8069';
            // Internal container networking fix
            if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
                baseUrl = baseUrl.replace('localhost', 'odoo').replace('127.0.0.1', 'odoo');
            }
            return (orders || []).map((o)=>({
                    ...o,
                    display_status: this.mapOrderState(o.state, o.invoice_status),
                    portal_url: o.access_url ? `${baseUrl}${o.access_url}` : null
                }));
        } catch (error) {
            console.error('Odoo Partner Orders Fetch Error:', error);
            return [];
        }
    },
    async getOrdersWithInvoices (partnerId, authenticatedEmail) {
        try {
            if (authenticatedEmail) {
                const partner = await client.call('res.partner', 'search_read', {
                    domain: [
                        [
                            'id',
                            '=',
                            partnerId
                        ]
                    ],
                    fields: [
                        'email'
                    ],
                    limit: 1
                });
                const resolvedEmail = partner?.[0]?.email || '';
                if (!resolvedEmail || resolvedEmail.toLowerCase() !== authenticatedEmail.toLowerCase()) {
                    return [];
                }
            }
            const orders = await this.getPartnerOrders(partnerId);
            if (!orders || orders.length === 0) return [];
            let baseUrl = process.env.ODOO_BASE_URL || 'http://odoo:8069';
            // Internal container networking fix
            if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
                baseUrl = baseUrl.replace('localhost', 'odoo').replace('127.0.0.1', 'odoo');
            }
            const allInvoiceIds = orders.flatMap((o)=>o.invoice_ids || []);
            const invoiceMap = {};
            if (allInvoiceIds.length > 0) {
                const invoices = await client.call('account.move', 'search_read', {
                    domain: [
                        [
                            'id',
                            'in',
                            allInvoiceIds
                        ],
                        [
                            'move_type',
                            '=',
                            'out_invoice'
                        ]
                    ],
                    fields: [
                        'id',
                        'name',
                        'invoice_date',
                        'state',
                        'amount_total',
                        'payment_state',
                        'access_url',
                        'access_token'
                    ]
                });
                for (const inv of invoices || []){
                    const enriched = {
                        ...inv,
                        display_status: this.mapInvoiceState(inv.state, inv.payment_state),
                        portal_url: buildPortalUrl(baseUrl, inv.access_url),
                        pdf_url: buildInvoicePdfUrl(baseUrl, inv.access_url, inv.access_token)
                    };
                    for (const order of orders){
                        if ((order.invoice_ids || []).includes(inv.id)) {
                            if (!invoiceMap[order.id]) invoiceMap[order.id] = [];
                            invoiceMap[order.id].push(enriched);
                        }
                    }
                }
            }
            return orders.map((o)=>({
                    ...o,
                    invoices: invoiceMap[o.id] || []
                }));
        } catch (error) {
            console.warn('[OdooService] Orders+Invoices fetch failed:', error);
            return [];
        }
    },
    async getPartnerInvoices (partnerId) {
        try {
            const invoices = await client.call('account.move', 'search_read', {
                domain: [
                    [
                        'partner_id',
                        '=',
                        partnerId
                    ],
                    [
                        'move_type',
                        '=',
                        'out_invoice'
                    ]
                ],
                fields: [
                    'name',
                    'invoice_date',
                    'state',
                    'amount_total',
                    'payment_state',
                    'access_url',
                    'access_token'
                ],
                order: 'invoice_date desc'
            });
            let baseUrl = process.env.ODOO_BASE_URL || 'http://odoo:8069';
            // Internal container networking fix
            if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
                baseUrl = baseUrl.replace('localhost', 'odoo').replace('127.0.0.1', 'odoo');
            }
            return (invoices || []).map((inv)=>({
                    ...inv,
                    display_status: this.mapInvoiceState(inv.state, inv.payment_state),
                    portal_url: buildPortalUrl(baseUrl, inv.access_url),
                    pdf_url: buildInvoicePdfUrl(baseUrl, inv.access_url, inv.access_token)
                }));
        } catch (error) {
            console.error('Odoo Partner Invoices Fetch Error:', error);
            return [];
        }
    },
    async getPartnerAddresses (partnerId) {
        try {
            return await client.call('res.partner', 'search_read', {
                domain: [
                    [
                        'parent_id',
                        '=',
                        partnerId
                    ],
                    [
                        'type',
                        'in',
                        [
                            'delivery',
                            'invoice',
                            'other'
                        ]
                    ]
                ],
                fields: [
                    'id',
                    'name',
                    'type',
                    'email',
                    'phone',
                    'street',
                    'street2',
                    'city',
                    'zip',
                    'state_id',
                    'country_id'
                ],
                order: 'type asc'
            });
        } catch (error) {
            console.error('Odoo Partner Addresses Fetch Error:', error);
            return [];
        }
    },
    async savePartnerAddress (partnerId, data) {
        try {
            const vals = {
                parent_id: partnerId,
                ...data
            };
            if (data.id) {
                await client.call('res.partner', 'write', {
                    ids: [
                        data.id
                    ],
                    vals
                });
                return data.id;
            }
            return await client.create('res.partner', vals);
        } catch (error) {
            console.error('Odoo Address Save Error:', error);
            return null;
        }
    },
    async deletePartnerAddress (addressId) {
        try {
            return await client.call('res.partner', 'write', {
                ids: [
                    addressId
                ],
                vals: {
                    active: false
                }
            });
        } catch (error) {
            console.error('Odoo Address Delete Error:', error);
            return false;
        }
    },
    async getProductImage (templateId) {
        let baseUrl = process.env.ODOO_BASE_URL || 'http://odoo:8069';
        // Internal container networking fix
        if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
            baseUrl = baseUrl.replace('localhost', 'odoo').replace('127.0.0.1', 'odoo');
        }
        const db = process.env.ODOO_DATABASE || process.env.ODOO_DB || 'galantes_prod';
        const fields = [
            'image_256',
            'image_1920'
        ];
        // Attempt 1: Direct HTTP Fetch (Fastest, best for cache)
        for (const field of fields){
            const urls = [
                `${baseUrl}/web/image/product.template/${templateId}/${field}?db=${db}`,
                `${baseUrl}/web/image?model=product.template&id=${templateId}&field=${field}&db=${db}`
            ];
            for (const url of urls){
                try {
                    const response = await fetch(url, {
                        next: {
                            revalidate: 3600
                        }
                    });
                    if (response.ok) {
                        const buffer = await response.arrayBuffer();
                        if (buffer.byteLength > 9000) {
                            return Buffer.from(buffer).toString('base64');
                        }
                    }
                } catch (error) {
                // Silent fail to next attempt
                }
            }
        }
        // Attempt 2: Odoo API Call (Most reliable, uses credentials)
        console.log(`[OdooService] HTTP fetch failed or returned placeholders for ${templateId}, trying API fallback...`);
        try {
            const result = await client.call('product.template', 'read', {
                ids: [
                    templateId
                ],
                fields: [
                    'image_1920',
                    'image_256'
                ]
            });
            if (result && result.length > 0) {
                const p = result[0];
                // Check image_1920 first, then image_256
                const images = [
                    p.image_1920,
                    p.image_256
                ];
                for (const img of images){
                    if (img && img.length > 12000) {
                        console.log(`[OdooService] Success via API for ${templateId} using ${img === p.image_1920 ? '1920' : '256'}`);
                        return img;
                    }
                }
            }
        } catch (apiError) {
            console.error(`[OdooService] API fallback failed for ${templateId}:`, apiError);
        }
        return null;
    },
    async getOrderFullDetails (orderId, authenticatedEmail) {
        try {
            const order = await this.getOrderDetails(orderId, authenticatedEmail);
            if (!order) return null;
            const orderLineIds = order.order_line ?? [];
            const lines = await client.call('sale.order.line', 'search_read', {
                domain: [
                    [
                        'id',
                        'in',
                        orderLineIds
                    ]
                ],
                fields: [
                    'product_id',
                    'name',
                    'product_uom_qty',
                    'price_unit',
                    'price_subtotal',
                    'price_total',
                    'product_template_id'
                ]
            });
            let tracking = [];
            if (order.picking_ids && order.picking_ids.length > 0) {
                tracking = await client.call('stock.picking', 'search_read', {
                    domain: [
                        [
                            'id',
                            'in',
                            order.picking_ids
                        ]
                    ],
                    fields: [
                        'name',
                        'state',
                        'carrier_tracking_ref',
                        'carrier_id',
                        'date_done'
                    ]
                });
            }
            return {
                ...order,
                lines: (lines || []).map((l)=>({
                        ...l,
                        image_url: `/api/products/image?id=${Array.isArray(l.product_template_id) ? l.product_template_id[0] : l.product_template_id}`
                    })),
                tracking: (tracking || []).map((t)=>({
                        ...t,
                        carrier_name: Array.isArray(t.carrier_id) ? t.carrier_id[1] : 'Standard Shipping'
                    }))
            };
        } catch (error) {
            console.error('Odoo Order Full Details Error:', error);
            return null;
        }
    },
    async getPartnerProfile (partnerId) {
        try {
            const partners = await client.call('res.partner', 'search_read', {
                domain: [
                    [
                        'id',
                        '=',
                        partnerId
                    ]
                ],
                fields: [
                    'name',
                    'email',
                    'phone',
                    'street',
                    'street2',
                    'city',
                    'zip',
                    'country_id',
                    'state_id'
                ],
                limit: 1
            });
            if (!partners || partners.length === 0) return null;
            const p = partners[0];
            return {
                ...p,
                country_name: p.country_id ? p.country_id[1] : '',
                state_name: p.state_id ? p.state_id[1] : ''
            };
        } catch (error) {
            console.error('Odoo Profile Fetch Error:', error);
            return null;
        }
    },
    async updatePartnerProfile (partnerId, data) {
        try {
            await client.call('res.partner', 'write', {
                ids: [
                    partnerId
                ],
                vals: data
            });
            return {
                success: true
            };
        } catch (error) {
            console.error('Odoo Profile Update Error:', error);
            return {
                success: false,
                error: String(error)
            };
        }
    },
    mapOrderState (state, invoiceStatus) {
        const states = {
            'draft': 'Quotation',
            'sent': 'Quotation Sent',
            'sale': 'Confirmed',
            'done': 'Locked',
            'cancel': 'Cancelled'
        };
        if (state === 'sale' && invoiceStatus === 'invoiced') return 'Completed & Invoiced';
        if (state === 'sale' && invoiceStatus === 'to invoice') return 'Ready to Invoice';
        return states[state] || state;
    },
    mapInvoiceState (state, paymentState) {
        if (paymentState === 'paid') return 'Paid';
        if (paymentState === 'in_payment') return 'Processing Payment';
        if (paymentState === 'partial') return 'Partially Paid';
        const states = {
            'draft': 'Draft',
            'posted': 'Posted',
            'cancel': 'Cancelled'
        };
        return states[state] || state;
    }
};
}),
"[project]/Galantesjewelry/app/api/account/profile/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "PATCH",
    ()=>PATCH
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/node_modules/next/headers.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$customer$2d$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/lib/customer-auth.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$odoo$2f$services$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Galantesjewelry/lib/odoo/services.ts [app-route] (ecmascript)");
;
;
;
;
async function GET() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$customer$2d$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAuthenticatedCustomerFromCookies"])(cookieStore);
    if (!user) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Invalid session'
        }, {
            status: 401
        });
    }
    const baseProfile = {
        name: user.name || user.username || '',
        email: user.email,
        phone: '',
        street: '',
        street2: '',
        city: '',
        zip: '',
        state_id: undefined,
        country_id: undefined,
        state_name: '',
        country_name: ''
    };
    try {
        const partnerId = await __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$odoo$2f$services$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["OdooService"].getPartnerByEmail(user.email);
        if (!partnerId) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                authenticated: true,
                profile: baseProfile
            });
        }
        const profile = await __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$odoo$2f$services$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["OdooService"].getPartnerProfile(partnerId);
        return __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            authenticated: true,
            profile: {
                ...baseProfile,
                name: profile?.name || baseProfile.name,
                phone: profile?.phone || '',
                street: profile?.street || '',
                street2: profile?.street2 || '',
                city: profile?.city || '',
                zip: profile?.zip || '',
                state_id: profile?.state_id?.[0],
                country_id: profile?.country_id?.[0],
                state_name: profile?.state_id?.[1] || '',
                country_name: profile?.country_id?.[1] || ''
            }
        });
    } catch (error) {
        console.error('API Profile Fetch Error:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            authenticated: true,
            profile: baseProfile
        });
    }
}
async function PATCH(req) {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$customer$2d$auth$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getAuthenticatedCustomerFromCookies"])(cookieStore);
    if (!user) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Invalid session'
        }, {
            status: 401
        });
    }
    let body;
    try {
        body = await req.json();
    } catch  {
        return __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Invalid JSON'
        }, {
            status: 400
        });
    }
    // Whitelist — email is auth-managed, cannot change here
    const allowed = [
        'name',
        'phone',
        'street',
        'street2',
        'city',
        'zip',
        'state_id',
        'country_id'
    ];
    const update = {};
    for (const key of allowed){
        const value = body[key];
        if (key === 'state_id' || key === 'country_id') {
            if (typeof value === 'number') {
                update[key] = value;
            }
            continue;
        }
        if (typeof value === 'string') {
            update[key] = value;
        }
    }
    if (Object.keys(update).length === 0) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'No valid fields provided'
        }, {
            status: 400
        });
    }
    const partnerId = await __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$odoo$2f$services$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["OdooService"].getPartnerByEmail(user.email) || await __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$odoo$2f$services$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["OdooService"].findOrCreateCustomer({
        name: user.name || user.username || user.email,
        email: user.email
    });
    if (!partnerId) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Partner not found in Odoo'
        }, {
            status: 404
        });
    }
    const result = await __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$lib$2f$odoo$2f$services$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["OdooService"].updatePartnerProfile(partnerId, update);
    if (!result.success) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to update profile'
        }, {
            status: 500
        });
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$Galantesjewelry$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        success: true
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__13xwq2m._.js.map